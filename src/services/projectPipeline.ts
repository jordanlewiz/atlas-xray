import { db } from '../utils/database';
import { apolloClient } from './apolloClient';
import { gql } from '@apollo/client';
import { PROJECT_VIEW_QUERY } from '../graphql/projectViewQuery';
import { PROJECT_UPDATES_QUERY } from '../graphql/projectUpdatesQuery';

export interface PipelineState {
  projectsOnPage: number;
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
      const projectLinks = document.querySelectorAll('a[href*="/project/"]');
      console.log(`[AtlasXray] 🔍 Found ${projectLinks.length} links with "/project/" in href`);
      
      const projectIds: string[] = [];
      
      projectLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        if (href) {
          console.log(`[AtlasXray] 🔗 Link ${index + 1}: ${href}`);
          // Use the same regex pattern as before
          let match = href.match(/\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/);
          if (match && match[3] && match[3].trim()) {
            console.log(`[AtlasXray] ✅ Matched project (full pattern): ${match[3]}`);
            projectIds.push(match[3].trim());
          } else {
            // Fallback: try simpler pattern
            match = href.match(/\/project\/([A-Z]+-\d+)/);
            if (match && match[1] && match[1].trim()) {
              console.log(`[AtlasXray] ✅ Matched project (simple pattern): ${match[1]}`);
              projectIds.push(match[1].trim());
            } else {
              console.log(`[AtlasXray] ❌ No match for href: ${href}`);
            }
          }
        }
      });

      const uniqueProjectIds = Array.from(new Set(projectIds)).filter(id => id && id.trim());
      
      console.log(`[AtlasXray] 🔍 Found project IDs:`, uniqueProjectIds);
      
      this.updateState({
        projectsOnPage: uniqueProjectIds.length,
        currentStage: 'idle',
        isProcessing: false,
        lastUpdated: new Date()
      });

      return uniqueProjectIds.length;
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
      const projectLinks = document.querySelectorAll('a[href*="/project/"]');
      const projects: ProjectMatch[] = [];
      
      projectLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          let match = href.match(/\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/);
          if (match && match[3] && match[3].trim()) {
            projects.push({
              projectId: match[3].trim(),
              cloudId: match[1] || 'unknown',
              href: href
            });
          } else {
            match = href.match(/\/project\/([A-Z]+-\d+)/);
            if (match && match[1] && match[1].trim()) {
              projects.push({
                projectId: match[1].trim(),
                cloudId: 'unknown',
                href: href
              });
            }
          }
        }
      });

      // Filter out invalid projects
      const validProjects = projects.filter(p => p.projectId && p.projectId.trim());
      console.log(`[AtlasXray] 📋 Processing ${validProjects.length} valid projects:`, validProjects.map(p => p.projectId));

      // Process projects with rate limiting
      let storedCount = 0;
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
        }
      }

      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        lastUpdated: new Date()
      });

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
            const updates = await this.fetchProjectUpdates(project.key);
            await this.storeProjectUpdates(updates);
            totalUpdates += updates.length;
            
            // Update progress
            this.updateState({
              projectUpdatesStored: totalUpdates,
              lastUpdated: new Date()
            });
          });
        } catch (error) {
          console.error(`Failed to fetch updates for project ${project.key}:`, error);
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
      
      // Stage 1b: Fetch and store projects
      await this.fetchAndStoreProjects();
      
      // Stage 2: Fetch and store updates
      await this.fetchAndStoreUpdates();
      
      // Stage 3: Queue and process analysis
      await this.queueAndProcessAnalysis();
      
      this.updateState({
        isProcessing: false,
        lastUpdated: new Date(),
        error: undefined
      });
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
