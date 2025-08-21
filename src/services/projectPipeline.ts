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
      // Wait for DOM to be ready if needed
      if (document.readyState !== 'complete') {
        console.log(`[AtlasXray] 🔍 DOM not ready (${document.readyState}), waiting...`);
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(undefined);
          } else {
            window.addEventListener('load', resolve, { once: true });
          }
        });
        console.log(`[AtlasXray] 🔍 DOM now ready, proceeding with scan...`);
      }
      // Debug: Log current page info
      console.log(`[AtlasXray] 🔍 Scanning page: ${window.location.href}`);
      console.log(`[AtlasXray] 🔍 Page title: ${document.title}`);
      console.log(`[AtlasXray] 🔍 Document ready state: ${document.readyState}`);
      console.log(`[AtlasXray] 🔍 Body children count: ${document.body?.children?.length || 'N/A'}`);
      
      const projectLinks = document.querySelectorAll('a[href*="/project/"]');
      console.log(`[AtlasXray] 🔍 Found ${projectLinks.length} links with "/project/" in href`);
      
      // Debug: Log all links on the page to see what's available
      const allLinks = document.querySelectorAll('a[href]');
      console.log(`[AtlasXray] 🔍 Total links on page: ${allLinks.length}`);
      
      // Show first few links for debugging
      allLinks.forEach((link, index) => {
        if (index < 5) { // Only show first 5 to avoid spam
          const href = link.getAttribute('href');
          console.log(`[AtlasXray] 🔗 Link ${index + 1}: ${href}`);
        }
      });
      
      // Debug: Check if we're in a shadow DOM or iframe
      console.log(`[AtlasXray] 🔍 Current frame: ${window.location !== window.parent.location ? 'iframe' : 'main'}`);
      console.log(`[AtlasXray] 🔍 Shadow roots: ${document.querySelectorAll('*').length} total elements`);
      
      // Also check for project-related elements that might not be links
      const projectElements = document.querySelectorAll('[data-testid*="project"], [class*="project"], [id*="project"]');
      console.log(`[AtlasXray] 🔍 Found ${projectElements.length} project-related elements`);
      
      // Check for text content that might contain project IDs
      const pageText = document.body?.innerText || '';
      const projectIdMatches = pageText.match(/[A-Z]+-\d+/g);
      if (projectIdMatches) {
        console.log(`[AtlasXray] 🔍 Found project IDs in page text:`, projectIdMatches.slice(0, 10));
      }
      
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
      
      // Fallback: If no project links found, try to extract from page content
      if (uniqueProjectIds.length === 0) {
        console.log(`[AtlasXray] 🔍 No project IDs found in primary scan, trying fallbacks...`);
        
        // Wait a bit more for dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`[AtlasXray] 🔍 Retrying scan after delay...`);
        
        // Retry the primary scan
        const retryProjectLinks = document.querySelectorAll('a[href*="/project/"]');
        console.log(`[AtlasXray] 🔍 Retry: Found ${retryProjectLinks.length} links with "/project/" in href`);
        
        if (retryProjectLinks.length > 0) {
          retryProjectLinks.forEach((link, index) => {
            if (index < 5) {
              const href = link.getAttribute('href');
              console.log(`[AtlasXray] 🔗 Retry Link ${index + 1}: ${href}`);
              if (href) {
                let match = href.match(/\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/);
                if (match && match[3] && match[3].trim()) {
                  console.log(`[AtlasXray] ✅ Retry: Matched project (full pattern): ${match[3]}`);
                  uniqueProjectIds.push(match[3].trim());
                } else {
                  match = href.match(/\/project\/([A-Z]+-\d+)/);
                  if (match && match[1] && match[1].trim()) {
                    console.log(`[AtlasXray] ✅ Retry: Matched project (simple pattern): ${match[1]}`);
                    uniqueProjectIds.push(match[1].trim());
                  }
                }
              }
            }
          });
        }
        console.log(`[AtlasXray] 🔍 No project links found, trying fallback scanning...`);
        
        // Look for project IDs in various page elements
        const fallbackSelectors = [
          '[data-testid*="project"]',
          '[class*="project"]',
          '[id*="project"]',
          '.project-item',
          '.project-card',
          '.project-name'
        ];
        
        for (const selector of fallbackSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            console.log(`[AtlasXray] 🔍 Found ${elements.length} elements with selector: ${selector}`);
            
            // Extract text content and look for project IDs
            elements.forEach((element, index) => {
              if (index < 5) { // Limit to first 5 to avoid spam
                const text = element.textContent || '';
                const matches = text.match(/[A-Z]+-\d+/g);
                if (matches) {
                  console.log(`[AtlasXray] 🔍 Element ${index + 1} contains project IDs:`, matches);
                  matches.forEach(id => {
                    if (!uniqueProjectIds.includes(id)) {
                      uniqueProjectIds.push(id);
                    }
                  });
                }
              }
            });
          }
        }
        
        // Additional fallback: Look for any links that might contain project IDs
        if (uniqueProjectIds.length === 0) {
          console.log(`[AtlasXray] 🔍 Trying to find any links with project IDs...`);
          const allLinks = document.querySelectorAll('a[href]');
          
          allLinks.forEach((link, index) => {
            if (index < 20) { // Check first 20 links
              const href = link.getAttribute('href');
              if (href) {
                // Look for project ID pattern in href
                const projectMatch = href.match(/\/project\/([A-Z]+-\d+)/);
                if (projectMatch && projectMatch[1]) {
                  const projectId = projectMatch[1].trim();
                  console.log(`[AtlasXray] 🔍 Found project ID in href: ${projectId} from ${href}`);
                  if (!uniqueProjectIds.includes(projectId)) {
                    uniqueProjectIds.push(projectId);
                  }
                }
              }
            }
          });
        }
      }
      
      console.log(`[AtlasXray] 🔍 Final project IDs found:`, uniqueProjectIds);
      
      // Store the actual project IDs for later use
      this.updateState({
        projectsOnPage: uniqueProjectIds.length,
        projectIds: uniqueProjectIds, // Store the actual IDs
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
