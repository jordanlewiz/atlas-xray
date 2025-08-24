import { db } from './DatabaseService';

/**
 * Project Updates Service
 * 
 * Responsible for fetching and storing project updates from the server.
 * This service handles:
 * - Fetching updates for specific projects
 * - Storing updates in the database
 * - Avoiding duplicate updates
 * - Integration with the analysis system
 * - Rate limiting and performance optimization
 */
export class ProjectUpdatesService {
  private static instance: ProjectUpdatesService;
  private isProcessing = false;

  static getInstance(): ProjectUpdatesService {
    if (!ProjectUpdatesService.instance) {
      ProjectUpdatesService.instance = new ProjectUpdatesService();
    }
    return ProjectUpdatesService.instance;
  }

  /**
   * Fetch and store updates for a project, then analyze them
   */
  async fetchAndStoreUpdates(projectKey: string): Promise<void> {
    if (this.isProcessing) {
      console.log(`[ProjectUpdatesService] Already processing updates for ${projectKey}, skipping`);
      return;
    }

    this.isProcessing = true;
    console.log(`[ProjectUpdatesService] 🚀 Fetching updates for ${projectKey}`);

    try {
      // Import Apollo client and query
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      const { PROJECT_UPDATES_QUERY } = await import('../graphql/projectUpdatesQuery');

      // Fetch updates from GraphQL with rate limiting
      const { withRateLimit } = await import('../utils/rateLimitManager');
      
      const { data } = await withRateLimit(async () => {
        return apolloClient.query({
          query: gql`${PROJECT_UPDATES_QUERY}`,
          variables: { key: projectKey, isUpdatesTab: true },
          fetchPolicy: 'network-only'
        });
      });

      if (data?.project?.updates?.edges) {
        const nodes = data.project.updates.edges.map((edge: any) => edge.node).filter(Boolean);
        console.log(`[ProjectUpdatesService] 📥 Found ${nodes.length} updates for ${projectKey}`);

        // Check what updates we already have to avoid duplicates
        const existingUpdates = await db.projectUpdates.where('projectKey').equals(projectKey).toArray();
        const existingUuids = new Set(existingUpdates.map(u => u.uuid));
        
        // Store each new update and analyze it immediately
        for (const node of nodes) {
          const uuid = node.uuid || node.id || `update_${Date.now()}_${Math.random()}`;
          
          // Skip if we already have this update
          if (existingUuids.has(uuid)) {
            continue;
          }
          
          try {
            // Create the update object
            const update = {
              uuid: uuid,
              projectKey: node.project?.key || projectKey,
              creationDate: node.creationDate ? new Date(node.creationDate).toISOString() : new Date().toISOString(),
              state: node.newState?.projectStateValue,
              missedUpdate: !!node.missedUpdate,
              targetDate: node.newTargetDate,
              newDueDate: node.newDueDate?.label,
              oldDueDate: node.oldDueDate?.label,
              oldState: node.oldState?.projectStateValue,
              summary: node.summary || '',
              details: node.notes ? JSON.stringify(node.notes) : undefined
            };

            // Store the update
            await db.storeProjectUpdate(update);

            // Analysis is now handled automatically by DatabaseService.storeProjectUpdate()
            // No need for manual analysis here

          } catch (updateError) {
            console.error(`[ProjectUpdatesService] ❌ Failed to store update for ${projectKey}:`, updateError);
          }
        }

        console.log(`[ProjectUpdatesService] ✅ Completed processing ${nodes.length} updates for ${projectKey}`);
      } else {
        console.log(`[ProjectUpdatesService] ℹ️ No updates found for ${projectKey}`);
      }

    } catch (error) {
      console.error(`[ProjectUpdatesService] ❌ Failed to fetch updates for ${projectKey}:`, error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get updates count for a specific project
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
        const nodes = data.project.updates.edges.map((edge: any) => edge.node).filter(Boolean);
        return nodes.length;
      }
      return 0;

    } catch (error) {
      console.error(`[ProjectUpdatesService] Failed to get updates count for ${projectKey}:`, error);
      return 0;
    }
  }

  /**
   * Reset the processing state (useful for testing or manual refresh)
   */
  resetProcessingState(): void {
    this.isProcessing = false;
    console.log('[ProjectUpdatesService] Processing state reset');
  }

  /**
   * Check if the service is currently processing updates
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

// Export singleton instance
export const projectUpdatesService = ProjectUpdatesService.getInstance();
