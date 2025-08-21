import { db, upsertProjectUpdates, upsertProjectStatusHistory } from '../utils/database';
import { apolloClient } from './apolloClient';
import { gql } from '@apollo/client';
import { PROJECT_VIEW_QUERY } from '../graphql/projectViewQuery';
import { PROJECT_UPDATES_QUERY } from '../graphql/projectUpdatesQuery';
import { PROJECT_STATUS_HISTORY_QUERY } from '../graphql/projectStatusHistoryQuery';

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
            const success = await this.fetchAndStoreSingleProject(project);
            if (success) {
              storedCount++;
              
              // Update progress
              this.updateState({
                projectsStored: storedCount,
                lastUpdated: new Date()
              });
            }
          });
        } catch (error) {
          console.error(`Failed to store project ${project.projectId}:`, error);
          hasErrors = true;
        }
      }

      // If all projects failed to store data, set an error state
      if (storedCount === 0 && validProjects.length > 0) {
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

  // Stage 2: Updates are now fetched and stored directly in fetchAndStoreSingleProject
  async fetchAndStoreUpdates(): Promise<number> {
    this.updateState({ 
      currentStage: 'fetching-updates',
      isProcessing: true 
    });

    try {
      // Updates are now fetched and stored during project fetching
      // This stage is kept for compatibility but doesn't need to do anything
      console.log(`[AtlasXray] 📊 Updates already fetched and stored during project processing`);
      
      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        lastUpdated: new Date()
      });

      return 0; // No additional updates to fetch
    } catch (error) {
      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        error: `Updates stage failed: ${error}`
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
      // Pipeline starting - scan will set the project count
      console.log(`[AtlasXray] 🚀 Starting complete pipeline`);
      
      // Stage 1a: Scan DOM
      await this.scanProjectsOnPage();
      
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
      
      // Keep the scan results - don't restore to a potentially incorrect count
      this.updateState({
        isProcessing: false,
        lastUpdated: new Date(),
        error: undefined
      });
      
      console.log(`[AtlasXray] ✅ Pipeline complete - keeping scan results`);
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
  private async fetchAndStoreSingleProject(project: ProjectMatch): Promise<boolean> {
    // Validate project ID before making API call
    if (!project.projectId || typeof project.projectId !== 'string' || project.projectId.trim() === '') {
      console.error(`Invalid project ID: ${project.projectId}`);
      return false;
    }

    try {
      console.log(`[AtlasXray] 📥 Fetching data for project: ${project.projectId}`);
      
      let hasStoredData = false;
      
      // 1. Fetch Project View data
      const projectViewVariables = {
        key: project.projectId.trim(),
        trackViewEvent: "DIRECT",
        workspaceId: null,
        onboardingKeyFilter: "PROJECT_SPOTLIGHT",
        areMilestonesEnabled: false,
        cloudId: project.cloudId || "",
        isNavRefreshEnabled: true
      };
      
      try {
        const { data } = await apolloClient.query({
          query: gql`${PROJECT_VIEW_QUERY}`,
          variables: projectViewVariables
        });
        
        if (data?.project) {
          // Store project view in IndexedDB
          await db.projectView.put({
            projectKey: project.projectId,
            raw: data.project
          });
          console.log(`[AtlasXray] ✅ Stored project view for ${project.projectId}`);
          hasStoredData = true;
        }
      } catch (err) {
        console.error(`[AtlasXray] Failed to fetch project view data for projectId: ${project.projectId}`, err);
      }

      // 2. Fetch Project Status History
      try {
        const { data } = await apolloClient.query({
          query: gql`${PROJECT_STATUS_HISTORY_QUERY}`,
          variables: { projectKey: project.projectId }
        });
        
        // Extract nodes from edges and store status history
        if (data?.project?.updates?.edges) {
          const nodes = data.project.updates.edges.map((edge: any) => edge.node).filter(Boolean);
          if (nodes.length > 0) {
            await upsertProjectStatusHistory(nodes, project.projectId);
            console.log(`[AtlasXray] ✅ Stored ${nodes.length} status history entries for ${project.projectId}`);
            hasStoredData = true;
          }
        }
      } catch (err) {
        console.error(`[AtlasXray] Failed to fetch project status history for projectId: ${project.projectId}`, err);
      }

      // 3. Fetch Project Updates
      try {
        const { data } = await apolloClient.query({
          query: gql`${PROJECT_UPDATES_QUERY}`,
          variables: { key: project.projectId, isUpdatesTab: true }
        });
        
        // Extract nodes from edges and store updates
        if (data?.project?.updates?.edges) {
          const nodes = data.project.updates.edges.map((edge: any) => edge.node).filter(Boolean);
          if (nodes.length > 0) {
            await upsertProjectUpdates(nodes);
            console.log(`[AtlasXray] ✅ Stored ${nodes.length} project updates for ${project.projectId}`);
            hasStoredData = true;
          }
        }
      } catch (err) {
        console.error(`[AtlasXray] Failed to fetch project updates for projectId: ${project.projectId}`, err);
      }
      
      if (hasStoredData) {
        console.log(`[AtlasXray] ✅ Completed data fetch for project: ${project.projectId}`);
        return true; // Successfully stored some project data
      } else {
        console.log(`[AtlasXray] ❌ No data was stored for project: ${project.projectId}`);
        return false; // Failed to store any project data
      }
    } catch (error) {
      console.error(`[AtlasXray] Failed to fetch project ${project.projectId}:`, error);
      return false; // Failed to store project data
    }
  }

  // Note: fetchProjectUpdates and storeProjectUpdates are no longer needed
  // as updates are now fetched and stored directly in fetchAndStoreSingleProject

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
