import { apolloClient } from './apolloClient';
import { DIRECTORY_VIEW_PROJECT_QUERY } from '../graphql/DirectoryViewProjectQuery';
import { db } from './DatabaseService';
import { fetchMultipleProjectDependencies } from './projectDependencyFetcher';
import { gql } from '@apollo/client';
import { bootstrapService } from './bootstrapService';

interface ProjectNode {
  key: string;
  name?: string;
  archived?: boolean;
  dependencies?: {
    edges: Array<{
      node: {
        id: string;
        linkType: string;
        outgoingProject: {
          key: string;
          name?: string;
        };
      };
    }>;
  };
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
 * Simple Project List Fetcher Service
 * Fetches the list of visible projects on page load and URL changes
 */
export class SimpleProjectListFetcher {
  private static instance: SimpleProjectListFetcher;
  private hasRun = false;
  private currentUrl = '';
  private urlChangeListener: (() => void) | null = null;

  private constructor() {
    this.setupUrlChangeListener();
  }

  public static getInstance(): SimpleProjectListFetcher {
    if (!SimpleProjectListFetcher.instance) {
      SimpleProjectListFetcher.instance = new SimpleProjectListFetcher();
    }
    return SimpleProjectListFetcher.instance;
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

    console.log('[AtlasXray] 🔗 URL change listener setup complete with multiple detection methods');
  }

  /**
   * Handle URL changes and trigger refetch if needed
   */
  private async handleUrlChange(): Promise<void> {
    const newUrl = window.location.href;
    
    console.log(`[AtlasXray] 🔍 Checking URL change:`);
    console.log(`[AtlasXray] 🔍 Current stored URL: ${this.currentUrl}`);
    console.log(`[AtlasXray] 🔍 New URL: ${newUrl}`);
    console.log(`[AtlasXray] 🔍 URLs are different: ${newUrl !== this.currentUrl}`);
    
    if (newUrl !== this.currentUrl) {
      console.log(`[AtlasXray] 🔄 URL changed from: ${this.currentUrl}`);
      console.log(`[AtlasXray] 🔄 URL changed to: ${newUrl}`);
      
      this.currentUrl = newUrl;
      
      // Check if this is still a projects page with TQL parameters
      const hasProjects = newUrl.includes('/projects');
      const hasTql = newUrl.includes('tql=');
      
      console.log(`[AtlasXray] 🔍 URL analysis:`);
      console.log(`[AtlasXray] 🔍 - Contains '/projects': ${hasProjects}`);
      console.log(`[AtlasXray] 🔍 - Contains 'tql=': ${hasTql}`);
      
      if (hasProjects && hasTql) {
        console.log('[AtlasXray] 🚀 TQL filter change detected - refetching projects...');
        
        // Reset hasRun flag to allow refetch
        this.hasRun = false;
        console.log('[AtlasXray] 🔄 Reset hasRun flag to allow refetch');
        
        // Trigger refetch with new TQL
        try {
          await this.fetchProjectsOnPageLoad();
        } catch (error) {
          console.error('[AtlasXray] ❌ Error refetching projects after URL change:', error);
        }
      } else {
        console.log('[AtlasXray] ⏭️ URL change not relevant for project fetching');
        console.log(`[AtlasXray] ⏭️ - Missing '/projects': ${!hasProjects}`);
        console.log(`[AtlasXray] ⏭️ - Missing 'tql=': ${!hasTql}`);
      }
    } else {
      console.log('[AtlasXray] ⏭️ No URL change detected');
    }
  }

  /**
   * Cleanup listeners when needed
   */
  public cleanup(): void {
    if (this.urlChangeListener) {
      window.removeEventListener('popstate', this.urlChangeListener);
      this.urlChangeListener = null;
    }
  }

  /**
   * Fetch projects on page load
   */
  async fetchProjectsOnPageLoad(): Promise<void> {
    try {
      console.log('[SimpleProjectListFetcher] 🚀 Starting project fetch on page load...');
      
      // Get the current workspace UUID from bootstrap service
      const workspaces = bootstrapService.getWorkspaces();
      console.log('[SimpleProjectListFetcher] 🔍 Available workspaces:', workspaces);
      
      if (!workspaces || workspaces.length === 0) {
        console.warn('[SimpleProjectListFetcher] ⚠️ No workspaces available, skipping project fetch');
        return;
      }
      
      // Use the first available workspace for now
      const workspaceUuid = workspaces[0].uuid;
      console.log('[SimpleProjectListFetcher] 🏗️ Using workspace UUID:', workspaceUuid);
      console.log('[SimpleProjectListFetcher] 🏗️ Workspace details:', workspaces[0]);
      
      // Log the query variables we're about to send
      const queryVariables = {
        first: 100,
        after: null,
        workspaceUuid: workspaceUuid,
        tql: '(archived = false)',
        isTableOrSavedView: true,
        isTimelineOrSavedView: false,
        includeContributors: false,
        includeFollowerCount: false,
        includeFollowing: false,
        includeLastUpdated: false,
        includeOwner: false,
        includeRelatedProjects: true,
        includeStatus: false,
        includeTargetDate: false,
        includeTeam: false,
        includeGoals: false,
        includeTags: false,
        includeStartDate: false,
        includedCustomFieldUuids: [],
        skipTableTql: false
      };
      
      console.log('[SimpleProjectListFetcher] 📤 GraphQL query variables:', queryVariables);
      
      // Parse the GraphQL query string into a proper document
      const parsedQuery = gql`${DIRECTORY_VIEW_PROJECT_QUERY}`;
      
      const response = await apolloClient.query({
        query: parsedQuery,
        variables: queryVariables,
        fetchPolicy: 'cache-first'
      });
      
      console.log('[SimpleProjectListFetcher] 📥 GraphQL response received:', response);

      // Check if we have the expected response structure
      if (!response.data || !response.data.projectTql || !response.data.projectTql.edges) {
        console.warn('[SimpleProjectListFetcher] ⚠️ Unexpected response structure:', response.data);
        return;
      }

      const projects = response.data.projectTql.edges.map((edge: any) => edge.node);
      console.log(`[SimpleProjectListFetcher] 📦 Found ${projects.length} projects`);

      // Store project views
      for (const project of projects) {
        await db.storeProjectView({
          projectKey: project.key,
          raw: project
        });
      }

      // 🆕 NEW: Fetch and store dependencies using the new service
      if (projects.length > 0) {
        console.log('[SimpleProjectListFetcher] 🔗 Fetching dependencies for all projects...');
        
        try {
          const projectKeys = projects.map((p: ProjectNode) => p.key);
          const allDependencies = await fetchMultipleProjectDependencies(projectKeys);
          
          // Store dependencies in the database
          for (const [sourceKey, dependencies] of allDependencies) {
            if (dependencies.length > 0) {
              await db.storeProjectDependencies(sourceKey, dependencies.map(dep => ({
                id: dep.id,
                outgoingProject: { 
                  key: dep.targetProject.key, 
                  name: dep.targetProject.name 
                },
                linkType: dep.linkType
              })));
            }
          }
          
          console.log(`[SimpleProjectListFetcher] ✅ Stored dependencies for ${allDependencies.size} projects`);
        } catch (error) {
          console.warn('[SimpleProjectListFetcher] ⚠️ Failed to fetch dependencies:', error);
        }
      }

      console.log('[SimpleProjectListFetcher] ✅ Project fetch on page load completed');
      
    } catch (error) {
      console.error('[SimpleProjectListFetcher] ❌ Failed to fetch projects on page load:', error);
      throw error;
    }
  }
}

export const simpleProjectListFetcher = SimpleProjectListFetcher.getInstance();
