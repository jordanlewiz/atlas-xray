import { db, storeProjectUpdate } from '../utils/database';
import { analyzeUpdateQuality } from '../utils/localModelManager';

/**
 * Simple Update Fetcher - No bullshit, just fetch and store
 */
export class SimpleUpdateFetcher {
  private static instance: SimpleUpdateFetcher;
  private isProcessing = false;

  static getInstance(): SimpleUpdateFetcher {
    if (!SimpleUpdateFetcher.instance) {
      SimpleUpdateFetcher.instance = new SimpleUpdateFetcher();
    }
    return SimpleUpdateFetcher.instance;
  }

  /**
   * Fetch and store updates for a project, then analyze them
   */
  async fetchAndStoreUpdates(projectKey: string): Promise<void> {
    if (this.isProcessing) {
      console.log(`[SimpleUpdateFetcher] Already processing updates for ${projectKey}, skipping`);
      return;
    }

    this.isProcessing = true;
    console.log(`[SimpleUpdateFetcher] 🚀 Fetching updates for ${projectKey}`);

    try {
      // Import Apollo client and query
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      const { PROJECT_UPDATES_QUERY } = await import('../graphql/projectUpdatesQuery');

      // Fetch updates from GraphQL
      const { data } = await apolloClient.query({
        query: gql`${PROJECT_UPDATES_QUERY}`,
        variables: { key: projectKey, isUpdatesTab: true },
        fetchPolicy: 'network-only'
      });

      if (data?.project?.updates?.edges) {
        const nodes = data.project.updates.edges.map((edge: any) => edge.node).filter(Boolean);
        console.log(`[SimpleUpdateFetcher] 📥 Found ${nodes.length} updates for ${projectKey}`);

        // Store each update and analyze it immediately
        for (const node of nodes) {
          try {
            // Create the update object
            const update = {
              uuid: node.uuid || node.id || `update_${Date.now()}_${Math.random()}`, // Use UUID from GraphQL
              projectKey: node.project?.key || projectKey,
              creationDate: node.creationDate ? new Date(node.creationDate).toISOString() : new Date().toISOString(),
              state: node.newState?.projectStateValue,
              missedUpdate: !!node.missedUpdate,
              targetDate: node.newTargetDate,
              newDueDate: node.newDueDate?.label,
              oldDueDate: node.oldDueDate?.label,
              oldState: node.oldState?.projectStateValue,
              summary: node.summary || '',
              details: node.notes ? JSON.stringify(node.notes) : undefined,
              analyzed: false
            };

            // Store the update
            await storeProjectUpdate(update);
            console.log(`[SimpleUpdateFetcher] ✅ Stored update for ${projectKey}`);

            // Analyze the update immediately if it has a summary
            if (update.summary && update.summary.trim()) {
              try {
                const analysisResult = await analyzeUpdateQuality(update.summary);
                
                // Update the stored update with analysis results
                const analyzedUpdate = {
                  ...update,
                  updateQuality: analysisResult.score,
                  qualityLevel: analysisResult.quality,
                  qualitySummary: analysisResult.summary,
                  qualityMissingInfo: analysisResult.missingInfo || [],
                  qualityRecommendations: analysisResult.recommendations || [],
                  analyzed: true,
                  analysisDate: new Date().toISOString()
                };

                await storeProjectUpdate(analyzedUpdate);
                console.log(`[SimpleUpdateFetcher] 🧠 Analyzed update for ${projectKey}: ${analysisResult.score}/100`);
              } catch (analysisError) {
                console.error(`[SimpleUpdateFetcher] ❌ Analysis failed for ${projectKey}:`, analysisError);
                
                // Mark as analyzed but with error
                const errorUpdate = {
                  ...update,
                  updateQuality: 0,
                  qualityLevel: 'poor' as const,
                  qualitySummary: 'Analysis failed',
                  analyzed: true,
                  analysisDate: new Date().toISOString()
                };
                await storeProjectUpdate(errorUpdate);
              }
            } else {
              console.log(`[SimpleUpdateFetcher] ⏭️ Skipping analysis for ${projectKey}: no summary`);
            }

          } catch (updateError) {
            console.error(`[SimpleUpdateFetcher] ❌ Failed to store update for ${projectKey}:`, updateError);
          }
        }

        console.log(`[SimpleUpdateFetcher] ✅ Completed processing ${nodes.length} updates for ${projectKey}`);
      } else {
        console.log(`[SimpleUpdateFetcher] ℹ️ No updates found for ${projectKey}`);
      }

    } catch (error) {
      console.error(`[SimpleUpdateFetcher] ❌ Failed to fetch updates for ${projectKey}:`, error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get count of updates available for a project (estimate)
   */
  async getUpdatesAvailableCount(projectKey: string): Promise<number> {
    try {
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      const { PROJECT_UPDATES_QUERY } = await import('../graphql/projectUpdatesQuery');

      const { data } = await apolloClient.query({
        query: gql`${PROJECT_UPDATES_QUERY}`,
        variables: { key: projectKey, isUpdatesTab: true },
        fetchPolicy: 'cache-first'
      });

      return data?.project?.updates?.edges?.length || 0;
    } catch (error) {
      console.error(`[SimpleUpdateFetcher] Failed to get updates count for ${projectKey}:`, error);
      return 0;
    }
  }
}

export const simpleUpdateFetcher = SimpleUpdateFetcher.getInstance();
