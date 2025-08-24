import { DIRECTORY_VIEW_PROJECT_QUERY } from '../graphql/DirectoryViewProjectQuery';
import { db } from './DatabaseService';
import { bootstrapService } from './bootstrapService';

interface ProjectNode {
  key: string;
  name: string;
  archived: boolean;
  __typename: string;
}

interface ProjectEdge {
  node: ProjectNode;
  cursor: string;
}

interface ProjectTqlResponse {
  count: number;
  edges: ProjectEdge[];
  pageInfo: {
    endCursor: string;
    hasNextPage: boolean;
  };
}

/**
 * Project Discovery Service
 * 
 * Responsible for discovering and fetching visible projects from the current page.
 * This service handles:
 * - Project discovery on page load
 * - URL change detection and project re-discovery
 * - Integration with the database for project storage
 * - Rate limiting and performance optimization
 */
export class ProjectDiscoveryService {
  private static instance: ProjectDiscoveryService;
  private hasRun = false;
  private currentUrl = '';
  private urlChangeListener: (() => void) | null = null;

  private constructor() {
    this.setupUrlChangeListener();
  }

  public static getInstance(): ProjectDiscoveryService {
    if (!ProjectDiscoveryService.instance) {
      ProjectDiscoveryService.instance = new ProjectDiscoveryService();
    }
    return ProjectDiscoveryService.instance;
  }

  /**
   * Setup URL change listener to detect navigation
   */
  private setupUrlChangeListener(): void {
    // Store initial URL
    this.currentUrl = window.location.href;
    console.log(`[AtlasXray] 🔗 Initial URL stored: ${this.currentUrl}`);

    // Listen for popstate events (back/forward navigation)
    this.urlChangeListener = () => {
      console.log('[AtlasXray] 🔙 Popstate event detected');
      this.handleUrlChange();
    };
    window.addEventListener('popstate', this.urlChangeListener);

    // Also intercept pushState/replaceState for programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      console.log('[AtlasXray] 🔄 pushState intercepted:', args);
      originalPushState.apply(history, args);
      setTimeout(() => this.handleUrlChange(), 100); // Small delay for DOM updates
    };

    history.replaceState = (...args) => {
      console.log('[AtlasXray] 🔄 replaceState intercepted:', args);
      originalReplaceState.apply(history, args);
      setTimeout(() => this.handleUrlChange(), 100); // Small delay for DOM updates
    };

    // Also try MutationObserver for DOM-based navigation detection
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== this.currentUrl) {
        console.log('[AtlasXray] 🔍 MutationObserver detected URL change');
        this.handleUrlChange();
      }
    });

    // Observe URL changes in the address bar or document
    observer.observe(document, { 
      subtree: true, 
      childList: true,
      attributes: true,
      attributeFilter: ['href']
    });

    // Polling fallback (every 10 seconds) - reduced frequency for better performance
    setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== this.currentUrl) {
        console.log('[AtlasXray] 🕒 Polling detected URL change');
        this.handleUrlChange();
      }
    }, 10000);
  }

  /**
   * Handle URL changes by re-discovering projects
   */
  private async handleUrlChange(): Promise<void> {
    const newUrl = window.location.href;
    console.log(`[AtlasXray] 🔄 URL changed from ${this.currentUrl} to ${newUrl}`);
    
    this.currentUrl = newUrl;
    this.hasRun = false; // Reset flag to allow re-discovery
    
    // Wait a bit for DOM to settle, then re-discover projects
    setTimeout(async () => {
      try {
        await this.discoverProjectsOnPage();
      } catch (error) {
        console.error('[AtlasXray] Failed to re-discover projects after URL change:', error);
      }
    }, 500);
  }

  /**
   * Main entry point: discover and fetch projects on page load
   */
  async discoverProjectsOnPage(): Promise<string[]> {
    if (this.hasRun) {
      console.log('[AtlasXray] Project discovery already run for this page, skipping');
      return [];
    }

    console.log('[AtlasXray] 🚀 Starting project discovery on page load...');
    
    try {
      // Get visible project IDs from the current page
      const visibleProjectIds = await this.getVisibleProjectIds();
      
      if (visibleProjectIds.length === 0) {
        console.log('[AtlasXray] No visible projects found on this page');
        this.hasRun = true;
        return [];
      }

      console.log(`[AtlasXray] 📋 Found ${visibleProjectIds.length} visible projects:`, visibleProjectIds);

      // Fetch detailed data for each project
      await this.fetchProjectData(visibleProjectIds);
      
      // Update total updates count
      await this.updateTotalUpdatesCount();
      
      this.hasRun = true;
      console.log('[AtlasXray] ✅ Project discovery completed successfully');
      
      return visibleProjectIds;
      
    } catch (error) {
      console.error('[AtlasXray] ❌ Project discovery failed:', error);
      this.hasRun = true; // Mark as run to prevent infinite retries
      return [];
    }
  }

  /**
   * Get visible project IDs from the current page
   */
  private async getVisibleProjectIds(): Promise<string[]> {
    try {
      // Try to get project IDs from the database first (if we have them cached)
      const cachedProjectIds = await db.getVisibleProjectIds();
      if (cachedProjectIds.length > 0) {
        console.log(`[AtlasXray] 📋 Using cached project IDs: ${cachedProjectIds.length} projects`);
        return cachedProjectIds;
      }

      // Fallback: scan the DOM for project links
      console.log('[AtlasXray] 🔍 Scanning DOM for project links...');
      const projectLinks = document.querySelectorAll('a[href*="/project/"]');
      
      const projectIds: string[] = [];
      projectLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/\/project\/([^\/]+)/);
          if (match && match[1]) {
            const projectKey = match[1];
            if (!projectIds.includes(projectKey)) {
              projectIds.push(projectKey);
            }
          }
        }
      });

      console.log(`[AtlasXray] 🔍 Found ${projectIds.length} project links in DOM`);
      return projectIds;
      
    } catch (error) {
      console.error('[AtlasXray] Failed to get visible project IDs:', error);
      return [];
    }
  }

  /**
   * Fetch detailed data for the discovered projects
   */
  private async fetchProjectData(projectKeys: string[]): Promise<void> {
    console.log(`[AtlasXray] 📥 Fetching detailed data for ${projectKeys.length} projects...`);
    
    try {
      // Import dependencies
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      
      // Process projects in batches to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < projectKeys.length; i += batchSize) {
        const batch = projectKeys.slice(i, i + batchSize);
        console.log(`[AtlasXray] 📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(projectKeys.length / batchSize)}: ${batch.join(', ')}`);
        
        // Process batch concurrently
        const batchPromises = batch.map(async (projectKey) => {
          try {
            await this.fetchSingleProjectData(projectKey, apolloClient, gql);
          } catch (error) {
            console.error(`[AtlasXray] Failed to fetch data for ${projectKey}:`, error);
          }
        });
        
        await Promise.all(batchPromises);
        
        // Small delay between batches to be respectful
        if (i + batchSize < projectKeys.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log(`[AtlasXray] ✅ Completed fetching data for ${projectKeys.length} projects`);
      
    } catch (error) {
      console.error('[AtlasXray] Failed to fetch project data:', error);
    }
  }

  /**
   * Fetch data for a single project
   */
  private async fetchSingleProjectData(projectKey: string, apolloClient: any, gql: any): Promise<void> {
    try {
      // Import rate limiting utilities
      const { withRateLimit } = await import('../utils/rateLimitManager');
      
      const { data } = await withRateLimit(async () => {
        return apolloClient.query({
          query: gql`${DIRECTORY_VIEW_PROJECT_QUERY}`,
          variables: { projectKey },
          fetchPolicy: 'cache-first'
        });
      });

      if (data?.project) {
        // Store the project data
        const projectData = {
          key: projectKey,
          name: data.project.name || 'Unknown Project',
          status: data.project.status?.name || 'unknown',
          archived: data.project.archived || false,
          lastUpdated: data.project.lastUpdated || new Date().toISOString()
        };

        await db.storeProjectView(projectData);
        console.log(`[AtlasXray] ✅ Stored data for project: ${projectKey}`);
        
        // Fetch updates for this project
        await this.fetchProjectUpdates(projectKey);
        
      } else {
        console.warn(`[AtlasXray] ⚠️ No data returned for project: ${projectKey}`);
      }
      
    } catch (error) {
      console.error(`[AtlasXray] Failed to fetch data for project ${projectKey}:`, error);
    }
  }

  /**
   * Fetch updates for a specific project
   */
  private async fetchProjectUpdates(projectKey: string): Promise<void> {
    try {
      // Import the updates fetcher service
      const { ProjectUpdatesService } = await import('./ProjectUpdatesService');
      const updatesService = ProjectUpdatesService.getInstance();
      
      await updatesService.fetchAndStoreUpdates(projectKey);
      
    } catch (error) {
      console.error(`[AtlasXray] Failed to fetch updates for project ${projectKey}:`, error);
    }
  }

  /**
   * Update the total updates count
   */
  private async updateTotalUpdatesCount(): Promise<void> {
    try {
      // Import the updates counter service
      const { UpdatesCounterService } = await import('./UpdatesCounterService');
      const counterService = UpdatesCounterService.getInstance();
      
      await counterService.getTotalUpdatesAvailableCount();
      
    } catch (error) {
      console.error('[AtlasXray] Failed to update total updates count:', error);
    }
  }

  /**
   * Cleanup method for removing event listeners
   */
  public cleanup(): void {
    if (this.urlChangeListener) {
      window.removeEventListener('popstate', this.urlChangeListener);
      this.urlChangeListener = null;
    }
    console.log('[AtlasXray] ProjectDiscoveryService cleanup completed');
  }
}

// Export singleton instance
export const projectDiscoveryService = ProjectDiscoveryService.getInstance();
