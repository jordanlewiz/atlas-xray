import { bootstrapService } from './bootstrapService';

/**
 * Updates Counter Service
 * 
 * Responsible for counting total updates available from the server for visible projects.
 * This service provides:
 * - Total updates count across all visible projects
 * - Individual project update counts
 * - Integration with the database for reactive UI updates
 * - Rate limiting and performance optimization
 */
export class UpdatesCounterService {
  private static instance: UpdatesCounterService;
  private isCounting = false;

  static getInstance(): UpdatesCounterService {
    if (!UpdatesCounterService.instance) {
      UpdatesCounterService.instance = new UpdatesCounterService();
    }
    return UpdatesCounterService.instance;
  }

  /**
   * Get total count of updates available from server for visible projects
   */
  async getTotalUpdatesAvailableCount(): Promise<number> {
    if (this.isCounting) {
      console.log('[UpdatesCounterService] Already counting, returning cached result');
      return 0;
    }

    this.isCounting = true;
    console.log('[UpdatesCounterService] 🚀 Counting total updates available from server...');

    try {
      // Import dependencies
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      const { PROJECT_STATUS_HISTORY_QUERY } = await import('../graphql/projectStatusHistoryQuery');

      // Get visible project IDs
      const { getVisibleProjectIds } = await import('./DatabaseService');
      const visibleProjectIds = await getVisibleProjectIds();
      
      if (visibleProjectIds.length === 0) {
        console.log('[UpdatesCounterService] No visible projects found');
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
          console.warn(`[UpdatesCounterService] Failed to count updates for ${projectKey}:`, error);
          // Return 0 for failed projects to continue processing
          return 0;
        }
      });

      // Wait for all queries to complete and sum the results
      const updateCounts = await Promise.all(projectQueries);
      const totalUpdates = updateCounts.reduce((sum, count) => sum + count, 0);

      console.log(`[UpdatesCounterService] ✅ Total updates available: ${totalUpdates}`);
      
      // Store the count in database for reactive UI updates
      const { setTotalUpdatesAvailableCount } = await import('./DatabaseService');
      await setTotalUpdatesAvailableCount(totalUpdates);
      
      return totalUpdates;

    } catch (error) {
      console.error('[UpdatesCounterService] ❌ Failed to get total updates count:', error);
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
      const { PROJECT_STATUS_HISTORY_QUERY } = await import('../graphql/projectStatusHistoryQuery');

      const { data } = await apolloClient.query({
        query: gql`${PROJECT_STATUS_HISTORY_QUERY}`,
        variables: { projectKey: projectKey },
        fetchPolicy: 'cache-first'
      });

      if (data?.project?.updates?.edges) {
        const nonMissedUpdates = data.project.updates.edges.filter(
          (edge: any) => !edge.node.missedUpdate
        );
        return nonMissedUpdates.length;
      }
      return 0;

    } catch (error) {
      console.error(`[UpdatesCounterService] Failed to get count for ${projectKey}:`, error);
      return 0;
    }
  }

  /**
   * Reset the counting state (useful for testing or manual refresh)
   */
  resetCountingState(): void {
    this.isCounting = false;
    console.log('[UpdatesCounterService] Counting state reset');
  }
}

// Export singleton instance
export const updatesCounterService = UpdatesCounterService.getInstance();
