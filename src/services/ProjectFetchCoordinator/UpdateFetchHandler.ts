import { db } from '../DatabaseService';
import { fetchProjectsUpdates } from '../FetchProjectsUpdates';
import type { ProjectUpdate } from '../../types';

/**
 * Handles fetching project updates for projects that need refresh
 * Only fetches updates for projects that don't exist or are stale
 */
export class UpdateFetchHandler {
  // Update refresh threshold: 1 hour (more frequent than summaries)
  private static readonly UPDATE_REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

  /**
   * Handle project update fetching for the given project keys
   * @param projectKeys Array of project keys to check/fetch
   * @returns Result indicating success/failure
   */
  static async handle(projectKeys: string[]): Promise<{ success: boolean; fetchedCount: number }> {
    try {
      console.log(`[UpdateHandler] 🔍 Checking existing updates for ${projectKeys.length} projects...`);
      
      // Get existing updates from database
      const existingUpdates = await db.getProjectUpdates();
      const projectsNeedingRefresh = this.findProjectsNeedingRefresh(projectKeys, existingUpdates);
      
      if (projectsNeedingRefresh.length > 0) {
        console.log(`[UpdateHandler] 📈 Fetching updates for ${projectsNeedingRefresh.length} projects (new or stale)`);
        
        // Fetch updates for projects that need refresh
        await fetchProjectsUpdates.getProjectUpdates(projectsNeedingRefresh);
        
        console.log(`[UpdateHandler] ✅ Successfully fetched updates for ${projectsNeedingRefresh.length} projects`);
        return { success: true, fetchedCount: projectsNeedingRefresh.length };
      } else {
        console.log(`[UpdateHandler] ✅ All ${projectKeys.length} projects have fresh updates`);
        return { success: true, fetchedCount: 0 };
      }
    } catch (error) {
      console.error('[UpdateHandler] ❌ Failed to handle project updates:', error);
      return { success: false, fetchedCount: 0 };
    }
  }

  /**
   * Find projects that need update refresh (either new or stale)
   * @param projectKeys All project keys to check
   * @param existingUpdates Existing updates in database
   * @returns Array of project keys that need updates fetched
   */
  private static findProjectsNeedingRefresh(projectKeys: string[], existingUpdates: ProjectUpdate[]): string[] {
    const now = Date.now();
    const projectsNeedingRefresh: string[] = [];
    
    for (const projectKey of projectKeys) {
      const projectUpdates = existingUpdates.filter(u => u.projectKey === projectKey);
      
      if (projectUpdates.length === 0) {
        // No updates exist for this project
        projectsNeedingRefresh.push(projectKey);
        continue;
      }
      
      // Check if updates are stale (older than threshold)
      const latestUpdate = Math.max(...projectUpdates.map(u => new Date(u.creationDate).getTime()));
      const isStale = (now - latestUpdate) > this.UPDATE_REFRESH_THRESHOLD;
      
      if (isStale) {
        projectsNeedingRefresh.push(projectKey);
      }
    }
    
    const freshCount = projectKeys.length - projectsNeedingRefresh.length;
    console.log(`[UpdateHandler] 🔍 Found ${existingUpdates.length} existing updates, ${projectsNeedingRefresh.length} projects need refresh, ${freshCount} are fresh`);
    
    return projectsNeedingRefresh;
  }
}
