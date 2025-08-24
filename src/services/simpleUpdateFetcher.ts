import { db, storeProjectUpdate } from '../utils/database';
import { analyzeUpdateQuality } from './AnalysisService';

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
      // Import rate limiting utilities
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
        console.log(`[SimpleUpdateFetcher] 📥 Found ${nodes.length} updates for ${projectKey}`);

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
            await storeProjectUpdate(update);

            // Analyze the update immediately if it has a summary
            if (update.summary && update.summary.trim()) {
              try {
                const analysisResult = await analyzeUpdateQuality(update.summary);
                
                // Update the stored update with analysis results
                const analyzedUpdate = {
                  ...update,
                  updateQuality: analysisResult.overallScore,
                  qualityLevel: analysisResult.qualityLevel,
                  qualitySummary: analysisResult.summary,
                  qualityMissingInfo: analysisResult.missingInfo || [],
                  qualityRecommendations: analysisResult.recommendations || [],
                  analysisDate: new Date().toISOString()
                };

                // Store the updated record
                await db.projectUpdates.put(analyzedUpdate);
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
                
                try {
                  await db.projectUpdates.put(errorUpdate);
                } catch (dbError) {
                  console.error(`[SimpleUpdateFetcher] ❌ Failed to store error update for ${projectKey}:`, dbError);
                }
              }
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
