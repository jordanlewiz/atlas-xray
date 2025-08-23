import {
  db,
  setVisibleProjectIds,
  getVisibleProjectIds
} from '../utils/database';

/**
 * 🚀 REACTIVE PIPELINE SERVICE
 * 
 * This service implements a bulletproof reactive system:
 * 1. DOM Scanner detects projects → adds to visibleProjects table
 * 2. visibleProjects change → triggers projectView fetch
 * 3. projectView added → triggers projectUpdates fetch
 * 4. projectUpdate added → triggers analysis
 * 5. Analysis complete → triggers UI updates
 * 
 * All actions are event-driven and decoupled for maximum reliability.
 */
export class ReactivePipeline {
  private static instance: ReactivePipeline;
  private isInitialized = false;
  // 🚀 BULK OPERATION SCHEDULING
  private readonly BULK_FETCH_DELAY = 500; // Wait 0.5 seconds to batch operations
  private lastUpdateRequestTime = 0; // For rate limiting update requests

  static getInstance(): ReactivePipeline {
    if (!ReactivePipeline.instance) {
      ReactivePipeline.instance = new ReactivePipeline();
    }
    return ReactivePipeline.instance;
  }

  private constructor() {

  }

  /**
   * Initialize the reactive pipeline
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[AtlasXray] 🚀 Initializing Reactive Pipeline...');

    // Database watchers are no longer needed with useLiveQuery

    // Setup DOM mutation observer for detecting new projects
    this.setupDOMWatcher();

    // Do initial scan to set project count
    await this.scanForNewProjects();

    // 🎯 AUTO-FETCH UPDATES ON PAGE LOAD: Fetch updates for all visible projects
    await this.autoFetchUpdatesForVisibleProjects();

    this.isInitialized = true;
    console.log('[AtlasXray] ✅ Reactive Pipeline initialized');
  }

  /**
   * Setup DOM mutation observer to detect new projects on the page
   */
  private setupDOMWatcher(): void {
    if (typeof window === 'undefined') return;

    // 🎯 DETECT PAGE NAVIGATION: Listen for URL changes
    let currentUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log(`[AtlasXray] 🔄 URL changed to: ${currentUrl}`);
        // Force immediate scan on navigation
        this.scanForNewProjects();
      }
    });

    // Watch for URL changes in the document
    urlObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 🎯 DETECT DOM CHANGES: Listen for content changes
    const domObserver = new MutationObserver((mutations) => {
      let hasNewProjects = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          hasNewProjects = true;
        }
      });

      if (hasNewProjects) {
        // Debounce project scanning
        this.debounceProjectScan();
      }
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('[AtlasXray] 👀 DOM and URL watchers active');
  }

  private scanTimeout: NodeJS.Timeout | null = null;

  /**
   * Debounced project scanning to avoid excessive scans
   */
  private debounceProjectScan(): void {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }

    this.scanTimeout = setTimeout(() => {
      this.scanForNewProjects();
    }, 1000); // Scan 1 second after last DOM change
  }

  /**
   * Scan the DOM for new projects and update visibleProjects table
   */
  private async scanForNewProjects(): Promise<void> {
    try {
      console.log('[AtlasXray] 🔍 Scanning DOM for new projects...');

      // Use the same project detection logic as the original scanner
      const projectLinks = document.querySelectorAll('a[href*="/project/"]');
      const projectKeys: string[] = [];

      // 🎯 PRESERVE DOM ORDER: Track position on page
      for (const link of projectLinks) {
        const href = link.getAttribute('href');
        if (!href) continue;

        const projectKeyMatch = href.match(/\/project\/([A-Z0-9-]+)/);
        if (!projectKeyMatch) continue;

        const projectKey = projectKeyMatch[1];
        projectKeys.push(projectKey);
        console.log(`[AtlasXray] 📍 Added project: ${projectKey}`);
      }

      if (projectKeys.length > 0) {
        // 🎯 CLEAR OLD PROJECTS: Always start fresh for current page
        await setVisibleProjectIds(projectKeys);
        console.log(`[AtlasXray] 🧹 Cleared old visible projects and added ${projectKeys.length} new ones`);

        // 🔄 UPDATE PIPELINE STATE: Update the total project count for UI display
        await this.updatePipelineState(projectKeys.length);

        // 🎯 AUTO-FETCH UPDATES: Fetch updates for newly discovered projects
        console.log(`[AtlasXray] 🚀 Auto-fetching updates for ${projectKeys.length} newly discovered projects...`);
        
        try {
          const result = await this.fetchAndStoreProjectUpdatesBulk(projectKeys);
          console.log(`[AtlasXray] ✅ Auto-fetch for new projects complete: ${result.fetched} updates fetched, ${result.skipped} skipped`);
        } catch (error) {
          console.error('[AtlasXray] ❌ Auto-fetch updates for new projects failed:', error);
        }
      } else {
        console.log('[AtlasXray] ⚠️ No projects found in DOM');
        await this.updatePipelineState(0);
      }

    } catch (error) {
      console.error('[AtlasXray] ❌ Error scanning for projects:', error);
    }
  }

  /**
   * Fetch project view data from GraphQL API (bulk operation)
   */
  private async fetchProjectViewsBulk(projectKeys: string[]): Promise<void> {
    if (projectKeys.length === 0) return;
    
    try {
      console.log(`[AtlasXray] 🚀 Bulk fetching project views for ${projectKeys.length} projects...`);
      
      const result = await this.fetchAndStoreProjectsBulk(projectKeys);
      
      if (result.fetched > 0) {
        console.log(`[AtlasXray] ✅ Bulk project fetch complete: ${result.fetched} fetched, ${result.skipped} skipped`);
      } else if (result.skipped > 0) {
        console.log(`[AtlasXray] ⏭️ All ${result.skipped} projects already exist in database`);
      }
      
    } catch (error) {
      console.error(`[AtlasXray] ❌ Bulk project fetch failed:`, error);
      throw error;
    }
  }


  
  /**
   * Lazy load project updates (called when modal opens)
   */
  async lazyLoadProjectUpdates(projectKey: string): Promise<void> {
    console.log(`[AtlasXray] 📥 Lazy loading updates for ${projectKey}...`);
    
    try {
      const result = await this.fetchAndStoreProjectUpdatesBulk([projectKey]);
      console.log(`[AtlasXray] ✅ Updates loaded for ${projectKey}: ${result.fetched} fetched, ${result.skipped} skipped`);
    } catch (error) {
      console.error(`[AtlasXray] ❌ Failed to load updates for ${projectKey}:`, error);
      throw error;
    }
  }

  /**
   * Analyze a project update using local AI
   */
  private async analyzeUpdate(update: any): Promise<void> {
    try {
      console.log(`[AtlasXray] 🚀 Starting analysis for update ${update.id}:`, {
        id: update.id,
        summary: update.summary?.substring(0, 50) + '...',
        details: update.details?.substring(0, 50) + '...',
        analyzed: update.analyzed
      });
      
      // Import dynamically to avoid circular dependencies
      const { analyzeUpdateQuality } = await import('../utils/localModelManager');
      const { db } = await import('../utils/database');
      
      // Get the update text for analysis
      const updateText = update.summary || update.details || 'No update text available';
      console.log(`[AtlasXray] 📝 Analyzing text: "${updateText.substring(0, 100)}..."`);
      
      // Run local language model analysis
      console.log(`[AtlasXray] 🤖 Running local model analysis...`);
      const qualityResult = await analyzeUpdateQuality(updateText);
      console.log(`[AtlasXray] 📊 Analysis result:`, qualityResult);
      
      // Store the analysis results in the database
      console.log(`[AtlasXray] 💾 Updating database for update ${update.id}...`);
      await db.projectUpdates.update(update.id, {
        analyzed: 1, // This will trigger the 'updating' hook
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
        console.log(`[AtlasXray] 🔄 Applying fallback analysis for update ${update.id}...`);
        const { db } = await import('../utils/database');
        await db.projectUpdates.update(update.id, {
          analyzed: 1,
          analysisDate: new Date().toISOString(),
          updateQuality: 0,
          qualityLevel: 'poor',
          qualitySummary: 'Analysis failed - fallback to basic analysis'
        });
        console.log(`[AtlasXray] ✅ Fallback analysis applied for update ${update.id}`);
      } catch (dbError) {
        console.error(`[AtlasXray] ❌ Failed to update database for update ${update.id}:`, dbError);
      }
    }
  }











  /**
   * Handle projects discovered via GraphQL network monitoring
   */
  public async handleProjectsDiscovered(projectKeys: string[]): Promise<void> {
    try {
      if (projectKeys.length === 0) return;
      
      console.log(`[AtlasXray] 🎯 GraphQL detected ${projectKeys.length} projects: ${projectKeys.join(', ')}`);
      
      // Add to visible projects list
      await setVisibleProjectIds(projectKeys);
      console.log(`[AtlasXray] ✅ Added ${projectKeys.length} projects to visible projects`);
      
      // Fetch project metadata and updates
      await this.fetchAndStoreProjectsBulk(projectKeys);
      
    } catch (error) {
      console.error('[AtlasXray] ❌ Error handling GraphQL-discovered projects:', error);
    }
  }

  /**
   * Get current visible projects from database
   */
  async getVisibleProjects(): Promise<string[]> {
    return await getVisibleProjectIds();
  }

  /**
   * Update the pipeline state with the current project count
   */
  private async updatePipelineState(projectsOnPage: number): Promise<void> {
    try {
      // Just log the update - we no longer need to maintain separate pipeline state
      console.log(`[AtlasXray] 📊 Pipeline state updated: ${projectsOnPage} projects found on page`);
      

      
    } catch (error) {
      console.error('[AtlasXray] ❌ Failed to update pipeline state:', error);
    }
  }

  /**
   * 🚀 BULK OPERATIONS: Fetch multiple projects efficiently (moved from projectPipeline)
   */
  public async fetchAndStoreProjectsBulk(projectKeys: string[]): Promise<{ fetched: number; skipped: number }> {
    try {
      if (projectKeys.length === 0) {
        return { fetched: 0, skipped: 0 };
      }

      console.log(`[AtlasXray] 🚀 Bulk fetching ${projectKeys.length} projects...`);
      
      // Import dependencies
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      const { PROJECT_VIEW_QUERY } = await import('../graphql/projectViewQuery');
      const { bootstrapService } = await import('./bootstrapService');
      
      // 🎯 SINGLE QUERY: Get all existing projects at once
      const existingProjects = await db.projectView
        .where('projectKey')
        .anyOf(projectKeys)
        .toArray();
      
      const existingKeys = new Set(existingProjects.map(p => p.projectKey));
      const missingKeys = projectKeys.filter(key => !existingKeys.has(key));
      
      if (missingKeys.length === 0) {
        console.log(`[AtlasXray] ⏭️ All ${projectKeys.length} projects already exist in database`);
        return { fetched: 0, skipped: projectKeys.length };
      }
      
      console.log(`[AtlasXray] 📥 Fetching ${missingKeys.length} new projects, skipping ${existingKeys.size} existing`);
      
      // 🚀 BULK FETCH: Fetch all missing projects in parallel
      // Load bootstrap data to get proper workspace context
      const bootstrapData = await bootstrapService.loadBootstrapData();
      if (!bootstrapData) {
        console.error(`[AtlasXray] ❌ No bootstrap data available for bulk fetch`);
        return { fetched: 0, skipped: existingKeys.size };
      }
      
      const workspaceId = bootstrapService.getCurrentWorkspaceId();
      if (!workspaceId) {
        console.error(`[AtlasXray] ❌ No workspace ID available for bulk fetch`);
        return { fetched: 0, skipped: existingKeys.size };
      }
      
      // Fetch all missing projects in parallel with rate limiting
      const fetchPromises = missingKeys.map(async (projectKey, index) => {
        // Small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, index * 100));
        
        try {
          const { data } = await apolloClient.query({
            query: gql`${PROJECT_VIEW_QUERY}`,
            variables: {
              key: projectKey.trim(),
              trackViewEvent: "DIRECT",
              workspaceId: workspaceId,
              onboardingKeyFilter: "PROJECT_SPOTLIGHT",
              areMilestonesEnabled: false,
              cloudId: bootstrapData.cloudIds[0] || null, // Use first cloud ID from bootstrap
              isNavRefreshEnabled: true
            }
          });
          
          if (data?.project) {
            // Store project view
            await db.projectView.put({
              projectKey: projectKey,
              raw: data.project
            });
            console.log(`[AtlasXray] ✅ Stored project view for ${projectKey}`);
            
            // 🐛 DEBUG: Verify the project was actually stored
            const storedProject = await db.projectView.get(projectKey);
            const totalProjects = await db.projectView.count();
            console.log(`[AtlasXray] 🔍 Debug - Stored project:`, storedProject);
            console.log(`[AtlasXray] 🔍 Debug - Total projects in DB: ${totalProjects}`);
            
            // 🎯 IMMEDIATE UPDATE FETCH: Fetch updates right after storing project view
            // This implements the logic we agreed on: "Watch Database for projects being stored, then fetch the updates"
            try {
              console.log(`[AtlasXray] 🔄 Project ${projectKey} stored, immediately fetching updates...`);
              const updateResult = await this.fetchAndStoreProjectUpdatesBulk([projectKey]);
              console.log(`[AtlasXray] ✅ Updates fetched for ${projectKey}: ${updateResult.fetched} fetched, ${updateResult.skipped} skipped`);
            } catch (updateError) {
              console.error(`[AtlasXray] ❌ Failed to fetch updates for ${projectKey}:`, updateError);
            }
            
            return true;
          } else {
            console.warn(`[AtlasXray] ⚠️ No project data returned for ${projectKey}`);
            return false;
          }
        } catch (error) {
          console.error(`[AtlasXray] ❌ Failed to fetch project ${projectKey}:`, error);
          return false;
        }
      });
      
      const results = await Promise.all(fetchPromises);
      const successful = results.filter(r => r === true).length;
      
      console.log(`[AtlasXray] ✅ Bulk fetch complete: ${successful} fetched, ${existingKeys.size} skipped`);
      
      return { fetched: successful, skipped: existingKeys.size };
      
    } catch (error) {
      console.error(`[AtlasXray] ❌ Bulk fetch failed:`, error);
      return { fetched: 0, skipped: 0 };
    }
  }

  /**
   * 🚀 BULK OPERATIONS: Fetch updates for multiple projects efficiently (moved from projectPipeline)
   */
  public async fetchAndStoreProjectUpdatesBulk(projectKeys: string[]): Promise<{ fetched: number; skipped: number }> {
    try {
      if (projectKeys.length === 0) {
        return { fetched: 0, skipped: 0 };
      }

      console.log(`[AtlasXray] 🚀 Bulk fetching updates for ${projectKeys.length} projects...`);
      
      // Import dependencies
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      const { PROJECT_UPDATES_QUERY } = await import('../graphql/projectUpdatesQuery');
      const { upsertProjectUpdates } = await import('../utils/database');
      
      // 🎯 SINGLE QUERY: Get all existing updates for these projects
      const existingUpdates = await db.projectUpdates
        .where('projectKey')
        .anyOf(projectKeys)
        .toArray();
      
      // Group existing updates by project
      const updatesByProject = new Map<string, any[]>();
      existingUpdates.forEach(update => {
        if (!updatesByProject.has(update.projectKey)) {
          updatesByProject.set(update.projectKey, []);
        }
        updatesByProject.get(update.projectKey)!.push(update);
      });
      
      // Determine which projects need updates fetched
      const projectsNeedingUpdates = projectKeys.filter(key => {
        const existing = updatesByProject.get(key) || [];
        return existing.length === 0; // Fetch if no updates exist
      });
      
      if (projectsNeedingUpdates.length === 0) {
        console.log(`[AtlasXray] ⏭️ All ${projectKeys.length} projects already have updates in database`);
        return { fetched: 0, skipped: projectKeys.length };
      }
      
      console.log(`[AtlasXray] 📥 Fetching updates for ${projectsNeedingUpdates.length} projects, skipping ${projectKeys.length - projectsNeedingUpdates.length} existing`);
      
      // 🚀 BULK FETCH: Fetch updates for all projects that need them
      let totalUpdatesFetched = 0;
      
      for (const projectKey of projectsNeedingUpdates) {
        try {
          // Rate limiting for update requests
          const now = Date.now();
          const timeSinceLastRequest = now - (this.lastUpdateRequestTime || 0);
          const minInterval = 1000 / 3; // 3 requests per second max
          
          if (timeSinceLastRequest < minInterval) {
            const delay = minInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          this.lastUpdateRequestTime = Date.now();
          
          const { data } = await apolloClient.query({
            query: gql`${PROJECT_UPDATES_QUERY}`,
            variables: { key: projectKey, isUpdatesTab: true }
          });
          
          if (data?.project?.updates?.edges) {
            const nodes = data.project.updates.edges.map((edge: any) => edge.node).filter(Boolean);
            if (nodes.length > 0) {
              await upsertProjectUpdates(nodes);
              totalUpdatesFetched += nodes.length;
              console.log(`[AtlasXray] ✅ Stored ${nodes.length} updates for ${projectKey}`);
              
              // 🎯 ANALYZE NEW UPDATES: Run quality analysis on newly stored updates
              for (const node of nodes) {
                try {
                  const updateId = node.id ?? node.uuid;
                  if (updateId) {
                    // Get the stored update from database to analyze
                    const storedUpdate = await db.projectUpdates.get(updateId);
                    console.log(`[AtlasXray] 🔍 Checking update ${updateId} for analysis:`, {
                      exists: !!storedUpdate,
                      analyzed: storedUpdate?.analyzed,
                      needsAnalysis: storedUpdate && storedUpdate.analyzed === 0
                    });
                    
                    if (storedUpdate && storedUpdate.analyzed === 0) {
                      console.log(`[AtlasXray] 🤖 Analyzing newly stored update ${updateId}...`);
                      await this.analyzeUpdate(storedUpdate);
                      
                      // Verify the update was marked as analyzed
                      const updatedUpdate = await db.projectUpdates.get(updateId);
                      console.log(`[AtlasXray] ✅ Update ${updateId} analysis complete:`, {
                        analyzed: updatedUpdate?.analyzed,
                        analysisDate: updatedUpdate?.analysisDate,
                        qualityLevel: updatedUpdate?.qualityLevel
                      });
                    } else if (storedUpdate) {
                      console.log(`[AtlasXray] ⏭️ Update ${updateId} already analyzed (${storedUpdate.analyzed})`);
                    }
                  }
                } catch (analysisError) {
                  console.error(`[AtlasXray] ❌ Failed to analyze update ${node.id}:`, analysisError);
                }
              }
            }
          }
          
          // Small delay between projects
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`[AtlasXray] ❌ Failed to fetch updates for ${projectKey}:`, error);
        }
      }
      
      console.log(`[AtlasXray] ✅ Bulk updates fetch complete: ${totalUpdatesFetched} updates fetched for ${projectsNeedingUpdates.length} projects`);
      
      return { fetched: totalUpdatesFetched, skipped: projectKeys.length - projectsNeedingUpdates.length };
      
    } catch (error) {
      console.error(`[AtlasXray] ❌ Bulk updates fetch failed:`, error);
      return { fetched: 0, skipped: 0 };
    }
  }

  /**
   * 🎯 AUTO-FETCH UPDATES ON PAGE LOAD: Fetch updates for all visible projects
   */
  private async autoFetchUpdatesForVisibleProjects(): Promise<void> {
    try {
      const visibleProjects = await this.getVisibleProjects();
      if (visibleProjects.length === 0) {
        console.log('[AtlasXray] ⏭️ No visible projects to fetch updates for');
        return;
      }

      const projectKeys = visibleProjects;
      console.log(`[AtlasXray] 🚀 Auto-fetching updates for ${projectKeys.length} visible projects on page load...`);
      
      // Fetch updates for all visible projects
      const result = await this.fetchAndStoreProjectUpdatesBulk(projectKeys);
      
      console.log(`[AtlasXray] ✅ Auto-fetch complete: ${result.fetched} updates fetched, ${result.skipped} skipped`);
      
    } catch (error) {
      console.error('[AtlasXray] ❌ Auto-fetch updates failed:', error);
    }
  }

  /**
   * Manual trigger for project scanning (for testing/debugging)
   */
  async triggerProjectScan(): Promise<void> {
    await this.scanForNewProjects();
  }
}

// Export singleton instance
export const reactivePipeline = ReactivePipeline.getInstance();
