import { bootstrapService } from './bootstrapService';

/**
 * Simple Total Updates Counter Service
 * Counts total updates available from server for visible projects
 * (Shows count while fetching, so users know how many more are coming)
 */
export class SimpleTotalUpdatesCounter {
  private static instance: SimpleTotalUpdatesCounter;
  private isCounting = false;

  static getInstance(): SimpleTotalUpdatesCounter {
    if (!SimpleTotalUpdatesCounter.instance) {
      SimpleTotalUpdatesCounter.instance = new SimpleTotalUpdatesCounter();
    }
    return SimpleTotalUpdatesCounter.instance;
  }

  /**
   * Get total count of updates available from server for visible projects
   */
  async getTotalUpdatesAvailableCount(): Promise<number> {
    if (this.isCounting) {
      console.log('[SimpleTotalUpdatesCounter] Already counting, returning cached result');
      return 0;
    }

    this.isCounting = true;
    console.log('[SimpleTotalUpdatesCounter] 🚀 Counting total updates available from server...');

    try {
      // Import dependencies
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      const { PROJECT_STATUS_HISTORY_QUERY } = await import('../graphql/projectStatusHistoryQuery');

      // Get visible project IDs
      const { getVisibleProjectIds } = await import('../utils/database');
      const visibleProjectIds = await getVisibleProjectIds();
      
      if (visibleProjectIds.length === 0) {
        console.log('[SimpleTotalUpdatesCounter] No visible projects found');
        return 0;
      }

      // Import rate limiting utilities
      const { withRateLimit } = await import('../utils/rateLimitManager');
      
      // Process all projects concurrently for better performance with rate limiting
      const projectQueries = visibleProjectIds.map(async (projectKey) => {
        try {
          const { data } = await withRateLimit(async () => {
            return apolloClient.query({
              query: gql`${PROJECT_STATUS_HISTORY_QUERY}`,
              variables: { projectKey: projectKey },
              fetchPolicy: 'cache-first' // Use cache to avoid repeated API calls
            });
          });

          if (data?.project?.updates?.edges) {
            // Only count updates that haven't been missed (missedUpdate = false)
            const nonMissedUpdates = data.project.updates.edges.filter(
              (edge: any) => !edge.node.missedUpdate
            );
            return nonMissedUpdates.length;
          }
          return 0;
        } catch (error) {
          console.warn(`[SimpleTotalUpdatesCounter] Failed to count updates for ${projectKey}:`, error);
          // Return 0 for failed projects to continue processing
          return 0;
        }
      });

      // Wait for all queries to complete and sum the results
      const updateCounts = await Promise.all(projectQueries);
      const totalUpdates = updateCounts.reduce((sum, count) => sum + count, 0);

      console.log(`[SimpleTotalUpdatesCounter] ✅ Total updates available: ${totalUpdates}`);
      
      // Store the count in database for reactive UI updates
      const { setTotalUpdatesAvailableCount } = await import('../utils/database');
      await setTotalUpdatesAvailableCount(totalUpdates);
      
      return totalUpdates;

    } catch (error) {
      console.error('[SimpleTotalUpdatesCounter] ❌ Failed to get total updates count:', error);
      return 0;
    } finally {
      this.isCounting = false;
    }
  }

  /**
   * Get count for a specific project
   */
  async getProjectUpdatesCount(projectKey: string): Promise<number> {
    try {
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      const { PROJECT_UPDATES_QUERY } = await import('../graphql/projectUpdatesQuery');

            const { data } = await apolloClient.query({
        query: gql`${PROJECT_UPDATES_QUERY}`,
        variables: { key: projectKey, isUpdatesTab: true },
        fetchPolicy: 'cache-first'
      });

      if (data?.project?.updates?.edges) {
        return data.project.updates.edges.length;
      }
      return 0;
    } catch (error) {
      console.error(`[SimpleTotalUpdatesCounter] Failed to get count for ${projectKey}:`, error);
      return 0;
    }
  }
}

export const simpleTotalUpdatesCounter = SimpleTotalUpdatesCounter.getInstance();
