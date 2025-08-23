import { DIRECTORY_VIEW_PROJECT_QUERY } from '../graphql/DirectoryViewProjectQuery';
import { DIRECTORY_VIEW_PROJECT_PAGINATION_QUERY } from '../graphql/DirectoryTableViewProjectPaginationQuery';
import { setVisibleProjectIds } from '../utils/database';
import { reactivePipeline } from './reactivePipeline';
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

interface DirectoryViewResponse {
  projectTql: ProjectTqlResponse;
}

/**
 * Directory Project Fetcher Service
 * Uses Atlassian's actual GraphQL queries with proper pagination
 */
export class DirectoryProjectFetcher {
  private static instance: DirectoryProjectFetcher;
  private isFetching = false;
  private lastFetchTime = 0;
  private readonly FETCH_COOLDOWN = 1000; // 1 second between fetches

  private constructor() {}

  public static getInstance(): DirectoryProjectFetcher {
    if (!DirectoryProjectFetcher.instance) {
      DirectoryProjectFetcher.instance = new DirectoryProjectFetcher();
    }
    return DirectoryProjectFetcher.instance;
  }

  /**
   * Fetch all visible projects using pagination
   */
  public async fetchAllProjects(): Promise<string[]> {
    const now = Date.now();
    if (this.isFetching || (now - this.lastFetchTime) < this.FETCH_COOLDOWN) {
      console.log('[AtlasXray] ⏭️ Skipping fetch - too soon or already fetching');
      return [];
    }

    this.isFetching = true;
    this.lastFetchTime = now;

    try {
      console.log('[AtlasXray] 🚀 Starting directory project fetch with pagination...');
      
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

      // Step 1: Fetch first 50 projects using DirectoryViewProjectQuery
      console.log('[AtlasXray] 📥 Fetching first 50 projects...');
      const firstBatch = await this.fetchProjectBatch(apolloClient, gql, {
        first: 50,
        workspaceUuid: workspaceId,
        after: undefined, // First batch
        tql: '(archived = false)'
      });

      if (!firstBatch) {
        console.warn('[AtlasXray] ⚠️ Failed to fetch first batch of projects');
        return [];
      }

      let allProjects = firstBatch.projects;
      let hasNextPage = firstBatch.hasNextPage;
      let endCursor = firstBatch.endCursor;
      const totalCount = firstBatch.totalCount;

      console.log(`[AtlasXray] ✅ First batch: ${allProjects.length} projects (Total: ${totalCount})`);

      // Step 2: Continue fetching until we have all projects
      let batchNumber = 2;
      while (hasNextPage && allProjects.length < totalCount) {
        console.log(`[AtlasXray] 📥 Fetching batch ${batchNumber} (after cursor: ${endCursor?.substring(0, 20)}...)`);
        
        const nextBatch = await this.fetchProjectBatch(apolloClient, gql, {
          first: 25, // Pagination query uses 25
          workspaceUuid: workspaceId,
          after: endCursor,
          tql: '(archived = false)'
        });

        if (!nextBatch) {
          console.warn(`[AtlasXray] ⚠️ Failed to fetch batch ${batchNumber}`);
          break;
        }

        allProjects = allProjects.concat(nextBatch.projects);
        hasNextPage = nextBatch.hasNextPage;
        endCursor = nextBatch.endCursor;
        batchNumber++;

        console.log(`[AtlasXray] ✅ Batch ${batchNumber - 1}: ${nextBatch.projects.length} projects (Total so far: ${allProjects.length}/${totalCount})`);

        // Small delay between batches to be respectful
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const projectKeys = allProjects.map(p => p.key);
      
      console.log(`[AtlasXray] 🎯 Directory fetch complete: ${projectKeys.length}/${totalCount} projects fetched`);
      console.log(`[AtlasXray] 📋 Project keys: ${projectKeys.join(', ')}`);

      // Update visible projects in database (lightweight - just IDs)
      await setVisibleProjectIds(projectKeys);
      
      console.log(`[AtlasXray] ✅ Visible projects tracked: ${projectKeys.length} project IDs stored`);
      console.log(`[AtlasXray] 💡 Heavy data (projectView + updates) will be fetched when modal opens`);
      
      // Note: We're NOT calling reactivePipeline.handleProjectsDiscovered() here
      // This will be called when the modal opens instead, for better performance

      return projectKeys;

    } catch (error) {
      console.error('[AtlasXray] ❌ Error fetching projects from directory GraphQL:', error);
      
      // Log additional details for debugging
      if (error && typeof error === 'object') {
        console.error('[AtlasXray] 🔍 Error details:', {
          message: (error as any).message,
          graphQLErrors: (error as any).graphQLErrors,
          networkError: (error as any).networkError
        });
      }
      
      return [];
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Fetch a single batch of projects
   */
  private async fetchProjectBatch(
    apolloClient: any, 
    gql: any, 
    variables: {
      first: number;
      workspaceUuid: string;
      after?: string;
      tql: string;
    }
  ): Promise<{
    projects: ProjectNode[];
    hasNextPage: boolean;
    endCursor: string;
    totalCount: number;
  } | null> {
    try {
      // Determine which query to use based on whether this is the first batch
      const isFirstBatch = !variables.after;
      const query = isFirstBatch ? DIRECTORY_VIEW_PROJECT_QUERY : DIRECTORY_VIEW_PROJECT_PAGINATION_QUERY;
      
      console.log(`[AtlasXray] 🔍 Using ${isFirstBatch ? 'DirectoryViewProjectQuery' : 'DirectoryTableViewProjectPaginationQuery'}`);

      // Prepare variables for the query - only include essential variables
      const queryVariables: any = {
        first: variables.first,
        workspaceUuid: variables.workspaceUuid,
        tql: variables.tql,
        // Required boolean flags for DirectoryViewProjectQuery
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
        skipTableTql: false
      };

      // Add pagination-specific variables only when needed
      if (variables.after) {
        queryVariables.after = variables.after;
        queryVariables.directoryViewUuid = null;
      }

      console.log('[AtlasXray] 🔍 Query variables:', {
        first: queryVariables.first,
        workspaceUuid: queryVariables.workspaceUuid?.substring(0, 20) + '...',
        tql: queryVariables.tql,
        after: queryVariables.after?.substring(0, 20) + '...' || 'none',
        isFirstBatch
      });

      const { data } = await apolloClient.query({
        query: gql`${query}`,
        variables: queryVariables,
        fetchPolicy: 'network-only'
      });

      if (data?.projectTql) {
        const projectTql = data.projectTql as ProjectTqlResponse;
        
        // Extract project keys from edges
        const projects = projectTql.edges
          .map(edge => edge.node)
          .filter(project => project && project.key && !project.archived);

        return {
          projects,
          hasNextPage: projectTql.pageInfo.hasNextPage,
          endCursor: projectTql.pageInfo.endCursor,
          totalCount: projectTql.count
        };
      } else {
        console.warn('[AtlasXray] ⚠️ No projectTql data returned from GraphQL API');
        return null;
      }

    } catch (error) {
      console.error('[AtlasXray] ❌ Error fetching project batch:', error);
      return null;
    }
  }

  /**
   * Start periodic project fetching
   */
  public startPeriodicFetch(): void {
    console.log('[AtlasXray] 🔄 Starting periodic directory project fetching...');
    
    // Initial fetch
    this.fetchAllProjects();
    
    // Set up periodic fetching every 30 seconds
    setInterval(() => {
      this.fetchAllProjects();
    }, 30000);
  }
}

export const directoryProjectFetcher = DirectoryProjectFetcher.getInstance();
