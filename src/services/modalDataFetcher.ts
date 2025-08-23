import { PROJECT_UPDATES_QUERY } from '../graphql/projectUpdatesQuery';
import { upsertProjectUpdates } from '../utils/database';
import { bootstrapService } from './bootstrapService';
import { getVisibleProjectIds } from '../utils/database';

/**
 * Modal Data Fetcher Service
 * Only runs when modal opens - fetches project updates and triggers analysis
 */
export class ModalDataFetcher {
  private static instance: ModalDataFetcher;
  private isFetching = false;

  private constructor() {}

  public static getInstance(): ModalDataFetcher {
    if (!ModalDataFetcher.instance) {
      ModalDataFetcher.instance = new ModalDataFetcher();
    }
    return ModalDataFetcher.instance;
  }

  /**
   * Fetch project updates when modal opens
   */
  public async fetchProjectUpdatesForModal(): Promise<{ fetched: number; analyzed: number }> {
    if (this.isFetching) {
      console.log('[AtlasXray] ⏭️ Already fetching project updates for modal');
      return { fetched: 0, analyzed: 0 };
    }

    this.isFetching = true;

    try {
      console.log('[AtlasXray] 🚀 Modal opened - fetching project updates...');
      
      // Get visible project keys from database
      const visibleProjectKeys = await getVisibleProjectIds();
      
      if (visibleProjectKeys.length === 0) {
        console.warn('[AtlasXray] ⚠️ No visible projects to fetch updates for');
        return { fetched: 0, analyzed: 0 };
      }

      console.log(`[AtlasXray] 📥 Fetching updates for ${visibleProjectKeys.length} visible projects...`);

      // Import Apollo client dynamically
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');

      let totalUpdatesFetched = 0;
      let totalUpdatesAnalyzed = 0;

      // Fetch updates for each project
      for (const projectKey of visibleProjectKeys) {
        try {
          // Rate limiting - small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));

          const { data } = await apolloClient.query({
            query: gql`${PROJECT_UPDATES_QUERY}`,
            variables: { key: projectKey, isUpdatesTab: true }
          });

          if (data?.project?.updates?.edges) {
            const nodes = data.project.updates.edges.map((edge: any) => edge.node).filter(Boolean);
            
            if (nodes.length > 0) {
              // Store updates in database
              await upsertProjectUpdates(nodes);
              totalUpdatesFetched += nodes.length;
              
              console.log(`[AtlasXray] ✅ Stored ${nodes.length} updates for ${projectKey}`);
              
              // Analyze each update
              for (const node of nodes) {
                try {
                  const updateId = node.id ?? node.uuid;
                  if (updateId) {
                    // Get the stored update from database to analyze
                    const { db } = await import('../utils/database');
                    const storedUpdate = await db.projectUpdates.get(updateId);
                    
                    if (storedUpdate && storedUpdate.analyzed === 0) {
                      console.log(`[AtlasXray] 🤖 Analyzing newly stored update ${updateId}...`);
                      await this.analyzeUpdate(storedUpdate);
                      totalUpdatesAnalyzed++;
                    }
                  }
                } catch (analysisError) {
                  console.error(`[AtlasXray] ❌ Failed to analyze update ${node.id}:`, analysisError);
                }
              }
            }
          }
        } catch (error) {
          console.error(`[AtlasXray] ❌ Failed to fetch updates for ${projectKey}:`, error);
        }
      }

      console.log(`[AtlasXray] ✅ Modal data fetch complete: ${totalUpdatesFetched} updates fetched, ${totalUpdatesAnalyzed} analyzed`);
      
      return { fetched: totalUpdatesFetched, analyzed: totalUpdatesAnalyzed };

    } catch (error) {
      console.error('[AtlasXray] ❌ Error fetching modal data:', error);
      return { fetched: 0, analyzed: 0 };
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Analyze a project update using local AI
   */
  private async analyzeUpdate(update: any): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { analyzeUpdateQuality } = await import('../utils/localModelManager');
      const { db } = await import('../utils/database');
      
      // Get the update text for analysis
      const updateText = update.summary || update.details || 'No update text available';
      
      // Run local language model analysis
      const qualityResult = await analyzeUpdateQuality(updateText);
      
      // Store the analysis results in the database
      await db.projectUpdates.update(update.id, {
        analyzed: 1,
        analysisDate: new Date().toISOString(),
        updateQuality: qualityResult.score,
        qualityLevel: qualityResult.quality,
        qualitySummary: qualityResult.summary,
        qualityRecommendations: JSON.stringify(qualityResult.recommendations),
        qualityMissingInfo: JSON.stringify(qualityResult.missingInfo)
      });
      
      console.log(`[AtlasXray] ✅ Update ${update.id} analyzed: ${qualityResult.quality} quality (${qualityResult.score}/100)`);
      
    } catch (error) {
      console.error(`[AtlasXray] ❌ Failed to analyze update ${update.id}:`, error);
      
      // Fallback: mark as analyzed but with error
      try {
        const { db } = await import('../utils/database');
        await db.projectUpdates.update(update.id, {
          analyzed: 1,
          analysisDate: new Date().toISOString(),
          updateQuality: 0,
          qualityLevel: 'poor',
          qualitySummary: 'Analysis failed - fallback to basic analysis'
        });
      } catch (dbError) {
        console.error(`[AtlasXray] ❌ Failed to update database for update ${update.id}:`, dbError);
      }
    }
  }
}

export const modalDataFetcher = ModalDataFetcher.getInstance();
