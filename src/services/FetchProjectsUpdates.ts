import { apolloClient } from './apolloClient';
import { PROJECT_UPDATES_QUERY } from '../graphql/projectUpdatesQuery';
import { db } from './DatabaseService';
import { bootstrapService } from './bootstrapService';
import { gql } from '@apollo/client';

interface ProjectUpdate {
  id: string;
  summary?: string;
  state?: string;
  content?: string;
  creationDate: string;
  targetDate?: string;
  newTargetDate?: string;
  oldTargetDate?: string;
  oldState?: string;
}

interface ProjectUpdatesResponse {
  project: {
    updates: {
      edges: Array<{
        node: ProjectUpdate;
      }>;
    };
  };
}

/**
 * FetchProjectsUpdates Service
 * 
 * SINGLE RESPONSIBILITY: Fetch and store project updates only
 * - Does NOT fetch project list (use FetchProjectsList for that)
 * - Does NOT fetch project summaries (use FetchProjectsSummary for that)
 * - Does NOT fetch full project details (use FetchProjectsFullDetails for that)
 * - Only handles project updates and timeline data
 * - Checks DB first before fetching
 * - Only fetches if NO updates exist (doesn't re-fetch existing updates)
 */
export class FetchProjectsUpdates {
  private static instance: FetchProjectsUpdates;

  private constructor() {}

  public static getInstance(): FetchProjectsUpdates {
    if (!FetchProjectsUpdates.instance) {
      FetchProjectsUpdates.instance = new FetchProjectsUpdates();
    }
    return FetchProjectsUpdates.instance;
  }

  /**
   * Check if project updates need refresh - only fetch if no updates exist
   */
  private async needsRefresh(projectKeys: string[]): Promise<string[]> {
    try {
      const projectsNeedingRefresh: string[] = [];

      for (const projectKey of projectKeys) {
        // Check if project updates exist at all
        const updates = await db.getProjectUpdatesByKey(projectKey);
        if (updates.length === 0) {
          // Only fetch if we have NO updates for this project
          projectsNeedingRefresh.push(projectKey);
        }
        // If updates already exist, don't re-fetch them
      }

      if (projectsNeedingRefresh.length > 0) {
        console.log(`[FetchProjectsUpdates] 🔄 ${projectsNeedingRefresh.length} projects need initial update fetch`);
      } else {
        console.log('[FetchProjectsUpdates] ✅ All projects already have updates stored');
      }

      return projectsNeedingRefresh;
    } catch (error) {
      console.error('[FetchProjectsUpdates] ❌ Error checking refresh status:', error);
      return projectKeys; // Fetch all on error
    }
  }

  /**
   * Get project updates - either from DB (if fresh) or fetch from API
   */
  async getProjectUpdates(projectKeys: string[]): Promise<void> {
    try {
      console.log(`[FetchProjectsUpdates] 🔍 Getting updates for ${projectKeys.length} projects...`);

      // Check which projects need refresh
      const projectsNeedingRefresh = await this.needsRefresh(projectKeys);
      
      if (projectsNeedingRefresh.length === 0) {
        console.log('[FetchProjectsUpdates] ✅ All project updates are fresh, using DB data');
        return;
      }

      console.log(`[FetchProjectsUpdates] 🔄 Fetching updates for ${projectsNeedingRefresh.length} projects from API...`);
      await this.fetchFromAPI(projectsNeedingRefresh);

    } catch (error) {
      console.error('[FetchProjectsUpdates] ❌ Error getting project updates:', error);
      throw error;
    }
  }

  /**
   * Fetch project updates from GraphQL API
   */
  private async fetchFromAPI(projectKeys: string[]): Promise<void> {
    try {
      console.log(`[FetchProjectsUpdates] 🚀 Fetching updates for ${projectKeys.length} projects...`);

      // Get workspace context
      const workspaces = bootstrapService.getWorkspaces();
      if (!workspaces || workspaces.length === 0) {
        throw new Error('No workspaces available');
      }

      const workspaceUuid = workspaces[0].uuid;

      // Fetch updates for each project individually
      for (const projectKey of projectKeys) {
        try {
          console.log(`[FetchProjectsUpdates] 📥 Fetching updates for ${projectKey}...`);
          
          const response = await apolloClient.query({
            query: gql`${PROJECT_UPDATES_QUERY}`,
            variables: {
              key: projectKey,
              workspaceUuid: workspaceUuid,
              isUpdatesTab: true  // Required Boolean! variable
            },
            fetchPolicy: 'cache-first'
          });

          if (response.errors && response.errors.length > 0) {
            console.error(`[FetchProjectsUpdates] ❌ GraphQL errors for ${projectKey}:`, response.errors);
            continue;
          }

          const projectData = response.data?.project;
          if (!projectData?.updates?.edges) {
            console.warn(`[FetchProjectsUpdates] ⚠️ No updates for project ${projectKey}`);
            continue;
          }

          // Process and store updates
          const updates = projectData.updates.edges.map((edge: any) => {
            const update = edge.node;
            
            // Handle missing oldDueDate for the first update
            let oldDueDate = update.oldDueDate?.tooltip;
            let newDueDate = update.newDueDate?.tooltip;
            
            // If this is the first update and oldDueDate is missing, try to use project's target date as fallback
            if (!oldDueDate && update.newDueDate?.tooltip) {
              // For the first update, if we have a newDueDate but no oldDueDate,
              // use the project's target date as a fallback to prevent "N/A" in Date Range Days
              const projectTargetDate = projectData.targetDate;
              if (projectTargetDate) {
                oldDueDate = projectTargetDate;
                console.log(`[FetchProjectsUpdates] 🔍 Using project target date as oldDueDate fallback for ${projectKey}: ${oldDueDate}`);
              } else {
                // If no project target date, use the newDueDate as fallback
                oldDueDate = update.newDueDate.tooltip;
                console.log(`[FetchProjectsUpdates] 🔍 Using newDueDate as oldDueDate fallback for ${projectKey}: ${oldDueDate}`);
              }
            }
            
            return {
              uuid: update.id,
              projectKey: projectKey,
              creationDate: update.creationDate,
              state: update.newState?.value,  // Fixed: use newState.value instead of state.name
              summary: update.summary,
              details: update.content,
              targetDate: update.targetDate,
              newDueDate: newDueDate,  // Use processed newDueDate
              oldDueDate: oldDueDate,  // Use processed oldDueDate (may be inferred)
              oldState: update.oldState?.projectStateValue,  // Fixed: use oldState.projectStateValue instead of oldState
              missedUpdate: update.missedUpdate || false, // Use actual missedUpdate value from API
              analyzed: false, // Will be analyzed by AnalysisService later
              raw: update
            };
          });

          // Store updates in DB
          for (const update of updates) {
            await db.storeProjectUpdate(update);
          }

          console.log(`[FetchProjectsUpdates] ✅ Stored ${updates.length} updates for ${projectKey}`);

        } catch (error) {
          console.error(`[FetchProjectsUpdates] ❌ Error fetching updates for ${projectKey}:`, error);
          // Continue with other projects
        }
      }

      console.log(`[FetchProjectsUpdates] ✅ Completed fetching updates for ${projectKeys.length} projects`);

    } catch (error) {
      console.error('[FetchProjectsUpdates] ❌ Error fetching from API:', error);
      throw error;
    }
  }
}

export const fetchProjectsUpdates = FetchProjectsUpdates.getInstance();
