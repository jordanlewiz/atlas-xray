import { db } from '../utils/database';
import { apolloClient } from './apolloClient';
import { gql } from '@apollo/client';
import { PROJECT_VIEW_QUERY } from '../graphql/projectViewQuery';
import { PROJECT_UPDATES_QUERY } from '../graphql/projectUpdatesQuery';

export interface PipelineState {
  projectsOnPage: number;
  projectIds: string[]; // Store the actual project IDs found
  projectsStored: number;
  projectUpdatesStored: number;
  projectUpdatesAnalysed: number;
  isProcessing: boolean;
  lastUpdated: Date;
  currentStage: 'idle' | 'scanning' | 'fetching-projects' | 'fetching-updates' | 'queuing-analysis' | 'processing-analysis';
  error?: string;
}

export interface ProjectMatch {
  projectId: string;
  cloudId: string;
  href: string;
}

export interface ProjectUpdate {
  id: string;
  projectKey: string;
  summary: string;
  state: string;
  creationDate: string;
}

export class ProjectPipeline {
  private state: PipelineState;
  private rateLimitQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private maxRequestsPerSecond = 2;
  private lastRequestTime = 0;

  constructor() {
    this.state = {
      projectsOnPage: 0,
      projectIds: [], // Initialize empty array
      projectsStored: 0,
      projectUpdatesStored: 0,
      projectUpdatesAnalysed: 0,
      isProcessing: false,
      lastUpdated: new Date(),
      currentStage: 'idle'
    };
  }

  // Get current pipeline state
  getState(): PipelineState {
    return { ...this.state };
  }

  // Subscribe to state changes
  subscribe(callback: (state: PipelineState) => void): () => void {
    // Simple callback system - in production you might want a proper pub/sub
    const interval = setInterval(() => callback(this.getState()), 100);
    return () => clearInterval(interval);
  }

  // Stage 1a: Scan DOM for projects
  async scanProjectsOnPage(): Promise<number> {
    this.updateState({ 
      currentStage: 'scanning',
      isProcessing: true 
    });

    try {
      console.log(`[AtlasXray] 🔍 Scanning page: ${window.location.href}`);
      
      // Regex for /o/{cloudId}/s/{sectionId}/project/{ORG-123}
      const projectLinkPattern = /\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/;
      
      // Get all links on the page
      const links = Array.from(document.querySelectorAll('a[href]'));
      const hrefs = links.map(link => link.getAttribute('href'));
      
      console.log(`[AtlasXray] 🔍 Found ${links.length} total links on page`);
      
      // Find matching project links using the specific pattern
      const seen = new Set<string>();
      const projectIds: string[] = [];
      
      hrefs.forEach(href => {
        if (!href) return;
        const match = href.match(projectLinkPattern);
        if (match && match[3]) {
          const projectId = match[3];
          if (!seen.has(projectId)) {
            seen.add(projectId);
            projectIds.push(projectId);
            if (projectIds.length <= 5) { // Log first 5 for debugging
              console.log(`[AtlasXray] ✅ Found project: ${projectId} from ${href}`);
            }
          }
        }
      });
      
      console.log(`[AtlasXray] 🔍 Final project IDs found:`, projectIds);
      
      // Store the actual project IDs for later use
      this.updateState({
        projectsOnPage: projectIds.length,
        projectIds: projectIds,
        currentStage: 'idle',
        isProcessing: false,
        lastUpdated: new Date()
      });

      return projectIds.length;
    } catch (error) {
      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        error: `DOM scan failed: ${error}`
      });
      throw error;
    }
  }

  // Stage 1b: Fetch and store project data
  async fetchAndStoreProjects(): Promise<number> {
    this.updateState({ 
      currentStage: 'fetching-projects',
      isProcessing: true 
    });

    try {
      // Get the actual project IDs that were found by the scanner
      const currentState = this.getState();
      const actualProjectIds = currentState.projectIds || [];
      
      console.log(`[AtlasXray] 📋 Processing ${actualProjectIds.length} actual projects from scanner:`, actualProjectIds);
      
      // Filter out invalid projects
      const validProjects = actualProjectIds.filter(p => p && p.trim()).map(projectId => ({
        projectId: projectId.trim(),
        cloudId: 'unknown',
        href: `#${projectId}`
      }));

      // Process projects with rate limiting
      let storedCount = 0;
      let hasErrors = false;
      for (const project of validProjects) {
        try {
          await this.rateLimitedRequest(async () => {
            await this.fetchAndStoreSingleProject(project);
            storedCount++;
            
            // Update progress
            this.updateState({
              projectsStored: storedCount,
              lastUpdated: new Date()
            });
          });
        } catch (error) {
          console.error(`Failed to store project ${project.projectId}:`, error);
          hasErrors = true;
        }
      }

      // If all projects failed, set an error state
      if (storedCount === 0 && hasErrors) {
        this.updateState({
          currentStage: 'idle',
          isProcessing: false,
          error: 'All projects failed to store due to API errors',
          lastUpdated: new Date()
        });
      } else {
        this.updateState({
          currentStage: 'idle',
          isProcessing: false,
          lastUpdated: new Date()
        });
      }
      
      // Preserve the original projectsOnPage count from the scanner
      // Don't overwrite it with the stored count
      console.log(`[AtlasXray] 📊 Scanner found ${currentState.projectsOnPage} projects, stored ${storedCount} projects`);

      return storedCount;
    } catch (error) {
      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        error: `Project fetch failed: ${error}`
      });
      throw error;
    }
  }

  // Stage 2a & 2b: Fetch and store project updates
  async fetchAndStoreUpdates(): Promise<number> {
    this.updateState({ 
      currentStage: 'fetching-updates',
      isProcessing: true 
    });

    try {
      const storedProjects = await db.projectView.toArray();
      let totalUpdates = 0;

      for (const project of storedProjects) {
        try {
          await this.rateLimitedRequest(async () => {
            const updates = await this.fetchProjectUpdates(project.projectKey);
            await this.storeProjectUpdates(updates);
            totalUpdates += updates.length;
            
            // Update progress
            this.updateState({
              projectUpdatesStored: totalUpdates,
              lastUpdated: new Date()
            });
          });
        } catch (error) {
          console.error(`Failed to fetch updates for project ${project.projectKey}:`, error);
        }
      }

      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        lastUpdated: new Date()
      });

      return totalUpdates;
    } catch (error) {
      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        error: `Updates fetch failed: ${error}`
      });
      throw error;
    }
  }

  // Stage 3a & 3b: Queue and process AI analysis
  async queueAndProcessAnalysis(): Promise<number> {
    this.updateState({ 
      currentStage: 'queuing-analysis',
      isProcessing: true 
    });

    try {
      const storedUpdates = await db.projectUpdates.toArray();
      let analyzedCount = 0;

      // Queue all updates for analysis
      for (const update of storedUpdates) {
        try {
          await this.rateLimitedRequest(async () => {
            await this.queueUpdateForAnalysis(update);
            analyzedCount++;
            
            // Update progress
            this.updateState({
              projectUpdatesAnalysed: analyzedCount,
              lastUpdated: new Date()
            });
          });
        } catch (error) {
          console.error(`Failed to analyze update ${update.id}:`, error);
        }
      }

      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        lastUpdated: new Date()
      });

      return analyzedCount;
    } catch (error) {
      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        error: `Analysis failed: ${error}`
      });
      throw error;
    }
  }

  // Run complete pipeline
  async runCompletePipeline(): Promise<void> {
    try {
      // Stage 1a: Scan DOM
      await this.scanProjectsOnPage();
      
      // Store the original projectsOnPage count before processing
      const originalProjectsOnPage = this.getState().projectsOnPage;
      console.log(`[AtlasXray] 🔒 Preserving original count: ${originalProjectsOnPage} projects found`);
      
      // Stage 1b: Fetch and store projects
      const projectsStored = await this.fetchAndStoreProjects();
      
      // If no projects were stored, check if there was an error and set it
      if (projectsStored === 0) {
        const currentState = this.getState();
        if (currentState.error) {
          // Error already set by fetchAndStoreProjects
          return;
        }
      }
      
      // Stage 2: Fetch and store updates
      await this.fetchAndStoreUpdates();
      
      // Stage 3: Queue and process analysis
      await this.queueAndProcessAnalysis();
      
      // Restore the original projectsOnPage count
      this.updateState({
        projectsOnPage: originalProjectsOnPage,
        isProcessing: false,
        lastUpdated: new Date(),
        error: undefined
      });
      
      console.log(`[AtlasXray] 🔒 Restored original count: ${originalProjectsOnPage} projects`);
    } catch (error) {
      this.updateState({
        isProcessing: false,
        error: `Pipeline failed: ${error}`
      });
      throw error;
    }
  }

  // Rate limiting helper with exponential backoff for 429 errors
  private async rateLimitedRequest<T>(requestFn: () => Promise<T>, retryCount = 0): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.maxRequestsPerSecond; // Convert to milliseconds

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
    
    try {
      return await requestFn();
    } catch (error: any) {
      // Handle 429 errors with exponential backoff
      if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
        if (retryCount < 3) { // Max 3 retries
          const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`[AtlasXray] ⏳ 429 error, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.rateLimitedRequest(requestFn, retryCount + 1);
        } else {
          console.error('[AtlasXray] ❌ Max retries reached for 429 error');
        }
      }
      throw error;
    }
  }

  // Helper methods
  private async fetchAndStoreSingleProject(project: ProjectMatch): Promise<void> {
    // Validate project ID before making API call
    if (!project.projectId || typeof project.projectId !== 'string' || project.projectId.trim() === '') {
      console.error(`Invalid project ID: ${project.projectId}`);
      return;
    }

    try {
      // Fetch project view data
      const { data } = await apolloClient.query({
        query: gql`${PROJECT_VIEW_QUERY}`,
        variables: { 
          key: project.projectId.trim(),
          trackViewEvent: "DIRECT",
          workspaceId: null,
          onboardingKeyFilter: "PROJECT_SPOTLIGHT",
          areMilestonesEnabled: false,
          cloudId: project.cloudId || "",
          isNavRefreshEnabled: true
        }
      });
      
      if (data?.project) {
        // Store in IndexedDB
        await db.projectView.put({
          projectKey: project.projectId,
          raw: data.project
        });
      }
    } catch (error) {
      console.error(`Failed to fetch project ${project.projectId}:`, error);
      throw error;
    }
  }

  private async fetchProjectUpdates(projectKey: string): Promise<ProjectUpdate[]> {
    // Validate project key before making API call
    if (!projectKey || typeof projectKey !== 'string' || projectKey.trim() === '') {
      console.error(`Invalid project key: ${projectKey}`);
      return [];
    }

    try {
      const { data } = await apolloClient.query({
        query: gql`${PROJECT_UPDATES_QUERY}`,
        variables: { 
          key: projectKey.trim(), 
          isUpdatesTab: true 
        }
      });
      
      if (data?.project?.updates?.edges) {
        return data.project.updates.edges.map((edge: any) => edge.node).filter(Boolean);
      }
      
      return [];
    } catch (error) {
      console.error(`Failed to fetch updates for project ${projectKey}:`, error);
      return [];
    }
  }

  private async storeProjectUpdates(updates: ProjectUpdate[]): Promise<void> {
    try {
      for (const update of updates) {
        await db.projectUpdates.put({
          id: update.id,
          projectKey: update.projectKey,
          creationDate: update.creationDate,
          state: update.state,
          summary: update.summary,
          raw: update
        });
      }
    } catch (error) {
      console.error('Failed to store project updates:', error);
      throw error;
    }
  }

  private async queueUpdateForAnalysis(update: any): Promise<void> {
    try {
      // For now, just mark as analyzed (placeholder for AI analysis)
      // In the real implementation, this would add to an analysis queue
      await db.projectUpdates.update(update.id, {
        analyzed: true,
        analysisDate: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to queue update ${update.id} for analysis:`, error);
    }
  }

  private updateState(updates: Partial<PipelineState>): void {
    this.state = { ...this.state, ...updates };
  }
}

// Export singleton instance
export const projectPipeline = new ProjectPipeline();

// Debug function - call this from console to test manually
(window as any).testAtlasXrayPipeline = async () => {
  console.log('[AtlasXray] 🧪 Manual pipeline test started');
  
  try {
    // Test DOM scanning
    console.log('[AtlasXray] 🧪 Testing DOM scanning...');
    const scanResult = await projectPipeline.scanProjectsOnPage();
    console.log('[AtlasXray] 🧪 DOM scan result:', scanResult);
    
    // Test pipeline state
    const state = projectPipeline.getState();
    console.log('[AtlasXray] 🧪 Pipeline state:', state);
    
    // Test Apollo client
    console.log('[AtlasXray] 🧪 Testing Apollo client...');
    try {
      const { apolloClient } = await import('./apolloClient');
      console.log('[AtlasXray] 🧪 Apollo client loaded:', !!apolloClient);
    } catch (error) {
      console.error('[AtlasXray] 🧪 Apollo client error:', error);
    }
    
    return { scanResult, state };
  } catch (error) {
    console.error('[AtlasXray] 🧪 Pipeline test failed:', error);
    return { error: String(error) };
  }
};
