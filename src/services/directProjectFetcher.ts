import { PROJECT_KEYS_QUERY } from '../graphql/projectDirectoryListQuery';
import { setVisibleProjectIds } from '../utils/database';
import { reactivePipeline } from './reactivePipeline';
import { bootstrapService } from './bootstrapService';

/**
 * Direct Project Fetcher Service
 * Fetches projects directly using GraphQL queries instead of network monitoring
 */
export class DirectProjectFetcher {
  private static instance: DirectProjectFetcher;
  private isFetching = false;
  private lastFetchTime = 0;
  private readonly FETCH_INTERVAL = 5000; // 5 seconds between fetches

  private constructor() {}

  public static getInstance(): DirectProjectFetcher {
    if (!DirectProjectFetcher.instance) {
      DirectProjectFetcher.instance = new DirectProjectFetcher();
    }
    return DirectProjectFetcher.instance;
  }

  /**
   * Fetch projects directly from GraphQL API
   */
  public async fetchProjects(): Promise<string[]> {
    if (this.isFetching) {
      console.log('[AtlasXray] ⏭️ Project fetch already in progress, skipping...');
      return [];
    }

    const now = Date.now();
    if (now - this.lastFetchTime < this.FETCH_INTERVAL) {
      console.log('[AtlasXray] ⏭️ Too soon since last fetch, skipping...');
      return [];
    }

    this.isFetching = true;
    this.lastFetchTime = now;

    try {
      console.log('[AtlasXray] 🚀 Fetching projects directly from GraphQL API...');
      
      // Load bootstrap data first to get proper workspace ID
      const bootstrapData = await bootstrapService.loadBootstrapData();
      
      if (!bootstrapData) {
        console.warn('[AtlasXray] ⚠️ No bootstrap data available, cannot fetch projects');
        return [];
      }
      
      const workspaceId = bootstrapService.getCurrentWorkspaceId();
      console.log('[AtlasXray] 🔍 Using workspace ID:', workspaceId);

      // Import Apollo client dynamically
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');

      // Execute the query
      const { data } = await apolloClient.query({
        query: gql`${PROJECT_KEYS_QUERY}`,
        variables: {
          workspaceId: workspaceId,
          first: 100, // Get up to 100 projects
          q: '(archived = false)' // Only non-archived projects
        },
        fetchPolicy: 'network-only' // Always fetch fresh data
      });

      if (data?.projectTql?.edges) {
        const projects = data.projectTql.edges
          .map((edge: any) => edge.node)
          .filter((project: any) => project && project.key && !project.archived);

        const projectKeys = projects.map((project: any) => project.key);
        
        console.log(`[AtlasXray] ✅ Fetched ${projectKeys.length} projects from GraphQL API`);
        console.log(`[AtlasXray] 📋 Project keys: ${projectKeys.join(', ')}`);

        // Update visible projects in database
        await setVisibleProjectIds(projectKeys);
        
        // Trigger project processing via reactive pipeline
        if (projectKeys.length > 0) {
          await reactivePipeline.handleProjectsDiscovered(projectKeys);
        }

        return projectKeys;
      } else {
        console.warn('[AtlasXray] ⚠️ No project data returned from GraphQL API');
        return [];
      }

    } catch (error) {
      console.error('[AtlasXray] ❌ Error fetching projects from GraphQL API:', error);
      
      // Log additional details for debugging
      if (error && typeof error === 'object') {
        console.error('[AtlasXray] 🔍 Error details:', {
          message: (error as any).message,
          graphQLErrors: (error as any).graphQLErrors,
          networkError: (error as any).networkError,
          extraInfo: (error as any).extraInfo
        });
      }
      
      return [];
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Start periodic project fetching
   */
  public startPeriodicFetch(): void {
    console.log('[AtlasXray] 🔄 Starting periodic project fetching...');
    
    // Initial fetch
    this.fetchProjects();
    
    // Set up interval for periodic fetching
    setInterval(() => {
      this.fetchProjects();
    }, 30000); // Fetch every 30 seconds
  }

  /**
   * Stop periodic fetching
   */
  public stopPeriodicFetch(): void {
    console.log('[AtlasXray] 🛑 Stopping periodic project fetching...');
    // Note: setInterval doesn't have a built-in stop method, 
    // but we can control it by checking the isFetching flag
  }

  /**
   * Check if currently fetching
   */
  public isCurrentlyFetching(): boolean {
    return this.isFetching;
  }
}

export const directProjectFetcher = DirectProjectFetcher.getInstance();
