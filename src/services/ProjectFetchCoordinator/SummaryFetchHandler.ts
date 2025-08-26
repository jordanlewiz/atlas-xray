import { db } from '../DatabaseService';
import { fetchProjectsSummary } from '../FetchProjectsSummary';
import type { ProjectSummary } from '../../types';

/**
 * Handles fetching project summaries for new projects
 * Only fetches summaries for projects that don't already exist
 */
export class SummaryFetchHandler {
  /**
   * Handle project summary fetching for the given project keys
   * @param projectKeys Array of project keys to check/fetch
   * @returns Result indicating success/failure
   */
  static async handle(projectKeys: string[]): Promise<{ success: boolean; fetchedCount: number }> {
    try {
      console.log(`[SummaryHandler] 🔍 Checking existing summaries for ${projectKeys.length} projects...`);
      
      // Get existing summaries from database
      const existingSummaries = await db.getProjectSummaries();
      const newForSummaries = this.filterNewProjects(projectKeys, existingSummaries);
      
      if (newForSummaries.length > 0) {
        console.log(`[SummaryHandler] 📦 Fetching summaries for ${newForSummaries.length} new projects`);
        
        // Fetch summaries for new projects
        await fetchProjectsSummary.getProjectSummaries(newForSummaries);
        
        console.log(`[SummaryHandler] ✅ Successfully fetched summaries for ${newForSummaries.length} projects`);
        return { success: true, fetchedCount: newForSummaries.length };
      } else {
        console.log(`[SummaryHandler] ✅ All ${projectKeys.length} projects already have summaries`);
        return { success: true, fetchedCount: 0 };
      }
    } catch (error) {
      console.error('[SummaryHandler] ❌ Failed to handle project summaries:', error);
      return { success: false, fetchedCount: 0 };
    }
  }

  /**
   * Filter project keys to only include those that don't have summaries
   * @param projectKeys All project keys to check
   * @param existingSummaries Existing summaries in database
   * @returns Array of project keys that need summaries fetched
   */
  private static filterNewProjects(projectKeys: string[], existingSummaries: ProjectSummary[]): string[] {
    const existingKeys = new Set(existingSummaries.map(s => s.projectKey));
    const newKeys = projectKeys.filter(key => !existingKeys.has(key));
    
    console.log(`[SummaryHandler] 🔍 Found ${existingSummaries.length} existing summaries, ${newKeys.length} new projects need summaries`);
    
    return newKeys;
  }
}
