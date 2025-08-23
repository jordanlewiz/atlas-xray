import { DIRECTORY_VIEW_PROJECT_QUERY } from '../graphql/DirectoryViewProjectQuery';
import { setVisibleProjectIds } from '../utils/database';
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
 * Simple Project Fetcher Service
 * Fetches projects on page load and URL changes
 */
export class SimpleProjectFetcher {
  private static instance: SimpleProjectFetcher;
  private hasRun = false;
  private currentUrl = '';
  private urlChangeListener: (() => void) | null = null;

  private constructor() {
    this.setupUrlChangeListener();
  }

  public static getInstance(): SimpleProjectFetcher {
    if (!SimpleProjectFetcher.instance) {
      SimpleProjectFetcher.instance = new SimpleProjectFetcher();
    }
    return SimpleProjectFetcher.instance;
  }

  /**
   * Setup URL change listener to detect navigation
   */
  private setupUrlChangeListener(): void {
    // Store initial URL
    this.currentUrl = window.location.href;

    // Listen for popstate events (back/forward navigation)
    this.urlChangeListener = () => {
      this.handleUrlChange();
    };
    window.addEventListener('popstate', this.urlChangeListener);

    // Also intercept pushState/replaceState for programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      setTimeout(() => this.handleUrlChange(), 100); // Small delay for DOM updates
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      setTimeout(() => this.handleUrlChange(), 100); // Small delay for DOM updates
    };

    console.log('[AtlasXray] 🔗 URL change listener setup complete');
  }

  /**
   * Handle URL changes and trigger refetch if needed
   */
  private async handleUrlChange(): Promise<void> {
    const newUrl = window.location.href;
    
    if (newUrl !== this.currentUrl) {
      console.log(`[AtlasXray] 🔄 URL changed from: ${this.currentUrl}`);
      console.log(`[AtlasXray] 🔄 URL changed to: ${newUrl}`);
      
      this.currentUrl = newUrl;
      
      // Check if this is still a projects page with TQL parameters
      if (newUrl.includes('/projects') && newUrl.includes('tql=')) {
        console.log('[AtlasXray] 🚀 TQL filter change detected - refetching projects...');
        
        // Reset hasRun flag to allow refetch
        this.hasRun = false;
        
        // Trigger refetch with new TQL
        try {
          await this.fetchProjectsOnPageLoad();
        } catch (error) {
          console.error('[AtlasXray] ❌ Error refetching projects after URL change:', error);
        }
      } else {
        console.log('[AtlasXray] ⏭️ URL change not relevant for project fetching');
      }
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
   * Fetch projects with current page TQL filters
   */
  public async fetchProjectsOnPageLoad(): Promise<string[]> {
    if (this.hasRun) {
      console.log('[AtlasXray] ⏭️ Project fetch already run for current URL');
      return [];
    }

    this.hasRun = true;

    try {
      console.log('[AtlasXray] 🚀 Fetching projects on page load...');
      
      // Load bootstrap data first to get proper workspace ID
      const bootstrapData = await bootstrapService.loadBootstrapData();
      
      if (bootstrapData) {
        console.log('[AtlasXray] ✅ Bootstrap data loaded');
      } else {
        console.warn('[AtlasXray] ⚠️ No bootstrap data available, using fallback');
      }
      
      const workspaceId = bootstrapService.getCurrentWorkspaceId();
      console.log('[AtlasXray] 🔍 Using workspace ID:', workspaceId);

      // Import Apollo client dynamically
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');

      // 🎯 EXTRACT TQL FROM URL: Use the exact same filters as the current page
      const urlParams = new URLSearchParams(window.location.search);
      const pageTql = urlParams.get('tql');
      
      // Use page TQL if available, otherwise fallback to basic archived filter
      const tql = pageTql || '(archived = false)';
      
      console.log(`[AtlasXray] 📥 Fetching projects with TQL: ${tql}`);
      console.log(`[AtlasXray] 🔍 URL TQL parameter: ${pageTql || 'none'}`);
      
      const { data } = await apolloClient.query({
        query: gql`${DIRECTORY_VIEW_PROJECT_QUERY}`,
        variables: {
          first: 500, // Request up to 500, but server may return fewer
          workspaceUuid: workspaceId,
          tql: tql, // Dynamic TQL from URL
          // Required boolean flags
          isTableOrSavedView: true,
          isTimelineOrSavedView: false,
          includeContributors: false,
          includeFollowerCount: false,
          includeFollowing: false,
          includeLastUpdated: false,
          includeOwner: false,
          includeRelatedProjects: false,
          includeStatus: false,
          includeTargetDate: false,
          includeTeam: false,
          includeGoals: false,
          includeTags: false,
          includeStartDate: false,
          includedCustomFieldUuids: [],
          skipTableTql: false
        },
        fetchPolicy: 'network-only'
      });

      if (data?.projectTql) {
        const projectTql = data.projectTql as ProjectTqlResponse;
        
        // Extract project keys from edges (these are the visible projects on current page)
        const projects = projectTql.edges
          .map(edge => edge.node)
          .filter(project => project && project.key && !project.archived);

        const projectKeys = projects.map(p => p.key);
        
        console.log(`[AtlasXray] ✅ Fetched ${projectKeys.length} visible projects from current page view`);
        console.log(`[AtlasXray] 📊 Total available in workspace: ${projectTql.count}`);
        console.log(`[AtlasXray] 📋 Project keys: ${projectKeys.join(', ')}`);

        // Store visible project IDs in database (lightweight)
        await setVisibleProjectIds(projectKeys);
        
        console.log(`[AtlasXray] ✅ Visible projects tracked: ${projectKeys.length} project IDs stored`);
        console.log(`[AtlasXray] 💡 Heavy data will be fetched when modal opens`);

        return projectKeys;
      } else {
        console.warn('[AtlasXray] ⚠️ No project data returned from GraphQL API');
        return [];
      }

    } catch (error) {
      console.error('[AtlasXray] ❌ Error fetching projects on page load:', error);
      
      // Log additional details for debugging
      if (error && typeof error === 'object') {
        console.error('[AtlasXray] 🔍 Error details:', {
          message: (error as any).message,
          graphQLErrors: (error as any).graphQLErrors,
          networkError: (error as any).networkError
        });
      }
      
      return [];
    }
  }
}

export const simpleProjectFetcher = SimpleProjectFetcher.getInstance();
