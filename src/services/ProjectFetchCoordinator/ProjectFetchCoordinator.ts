import { SummaryFetchHandler } from './SummaryFetchHandler';
import { UpdateFetchHandler } from './UpdateFetchHandler';

/**
 * Main coordinator for fetching project data
 * Ensures proper sequencing: summaries must complete before updates start
 * 
 * This is the main business logic file - easy to read and understand!
 */
export class ProjectFetchCoordinator {
  /**
   * Handle new projects by sequentially fetching their data
   * STEP 1: Project summaries (required first)
   * STEP 2: Project updates (only after summaries complete)
   * 
   * @param projectKeys Array of project keys to fetch data for
   */
  static async handleNewProjects(projectKeys: string[]): Promise<void> {
    console.log(`[Coordinator] 🚀 Starting sequential fetch for ${projectKeys.length} projects`);
    
    // STEP 1: Handle project summaries first
    console.log('[Coordinator] 📋 Step 1: Processing project summaries...');
    const summaryResult = await SummaryFetchHandler.handle(projectKeys);
    
    if (!summaryResult.success) {
      console.log('[Coordinator] ❌ Summary fetch failed, skipping updates');
      return;
    }
    
    console.log(`[Coordinator] ✅ Step 1 complete: ${summaryResult.fetchedCount} summaries processed`);
    
    // STEP 2: Only proceed to updates after summaries are complete
    console.log('[Coordinator] 📈 Step 2: Processing project updates...');
    const updateResult = await UpdateFetchHandler.handle(projectKeys);
    
    if (updateResult.success) {
      console.log(`[Coordinator] ✅ Step 2 complete: ${updateResult.fetchedCount} updates processed`);
      console.log(`[Coordinator] 🎉 All data fetching complete for ${projectKeys.length} projects`);
    } else {
      console.log('[Coordinator] ❌ Update fetch failed, but summaries were successful');
    }
  }
}
