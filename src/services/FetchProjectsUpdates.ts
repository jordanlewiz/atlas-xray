import { apolloClient } from './apolloClient';
import { PROJECT_UPDATES_QUERY } from '../graphql/projectUpdatesQuery';
import { db } from './DatabaseService';
import { bootstrapService } from './bootstrapService';
import { gql } from '@apollo/client';
import { dateParsingService } from './DateParsingService';
import { log, setFilePrefix } from '../utils/logger';

// Set file-level prefix for all logging in this file
setFilePrefix('[FetchProjectsUpdates]');

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
        log.info(`🔄 ${projectsNeedingRefresh.length} projects need initial update fetch`);
      } else {
        log.info('✅ All projects already have updates stored');
      }

      return projectsNeedingRefresh;
    } catch (error) {
      log.error('❌ Error checking refresh status:', String(error));
      return projectKeys; // Fetch all on error
    }
  }

  /**
   * Get project updates - either from DB (if fresh) or fetch from API
   */
  async getProjectUpdates(projectKeys: string[]): Promise<void> {
    try {
      log.info(`🔍 Getting updates for ${projectKeys.length} projects...`);

      // Check which projects need refresh
      const projectsNeedingRefresh = await this.needsRefresh(projectKeys);
      
      if (projectsNeedingRefresh.length === 0) {
        log.info('✅ All project updates are fresh, using DB data');
        return;
      }

      log.info(`🔄 Fetching updates for ${projectsNeedingRefresh.length} projects from API...`);
      await this.fetchFromAPI(projectsNeedingRefresh);

    } catch (error) {
      log.error('❌ Error getting project updates:', String(error));
      throw error;
    }
  }

  /**
   * Fetch project updates from GraphQL API
   */
  private async fetchFromAPI(projectKeys: string[]): Promise<void> {
    try {
      log.info(`🚀 Fetching updates for ${projectKeys.length} projects...`);

      // Get workspace context
      const workspaces = bootstrapService.getWorkspaces();
      if (!workspaces || workspaces.length === 0) {
        throw new Error('No workspaces available');
      }

      const workspaceUuid = workspaces[0].uuid;

      // Fetch updates for each project individually
      for (const projectKey of projectKeys) {
        try {
          log.debug(`📥 Fetching updates for ${projectKey}...`);
          
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
            log.error(`❌ GraphQL errors for ${projectKey}:`, JSON.stringify(response.errors));
            continue;
          }

          const projectData = response.data?.project;
          if (!projectData?.updates?.edges) {
            log.warn(`⚠️ No updates for project ${projectKey}`);
            continue;
          }

          // Process and store updates
          const updates = projectData.updates.edges.map((edge: any) => {
            const update = edge.node;
            
            // Parse dates using DateParsingService
            // Note: newTargetDate is a direct string, newDueDate.tooltip has the formatted version
            const newDueDateParsed = dateParsingService.parseDate(update.newTargetDate || update.newDueDate?.tooltip);
            const oldDueDateParsed = dateParsingService.parseDate(update.oldTargetDate || update.oldDueDate?.tooltip);
            
            if (newDueDateParsed.dueDate) {
              log.debug(`Parsed newTargetDate for ${projectKey}: ${newDueDateParsed.dueDate} -> ${newDueDateParsed.dueDateParsed}`);
            }
            if (oldDueDateParsed.dueDate) {
              log.debug(`Parsed oldTargetDate for ${projectKey}: ${oldDueDateParsed.dueDate} -> ${oldDueDateParsed.dueDateParsed}`);
            }
            
            // Log creator extraction (non-PII)
            if (update.creator?.pii?.name) {
              log.debug(`✅ Creator extracted for ${projectKey} (PII data available)`);
            } else {
              log.warn(`⚠️ No creator data for ${projectKey}`);
            }
            
            return {
              uuid: update.id,
              projectKey: projectKey,
              creationDate: update.creationDate,
              state: update.newState?.value,  // Fixed: use newState.value instead of state.name
              summary: update.summary,
              details: update.content,
              oldState: update.oldState?.projectStateValue,  // Fixed: use oldState.projectStateValue instead of oldState
              missedUpdate: update.missedUpdate || false, // Use actual missedUpdate value from API
              analyzed: false, // Will be analyzed by AnalysisService later
              
              // NEW: Clear target date fields for consistent handling
              newTargetDate: update.newTargetDate || update.newDueDate?.tooltip,           // Use direct value or tooltip
              newTargetDateParsed: newDueDateParsed.dueDateParsed,                      // Parsed new target date
              oldTargetDate: update.oldTargetDate || update.oldDueDate?.tooltip,         // Use direct value or tooltip
              oldTargetDateParsed: oldDueDateParsed.dueDateParsed,                      // Parsed old target date
              
              // NEW: Creator information for easy access
              creatorName: update.creator?.pii?.name,                                    // Creator's name (e.g., "Arnab Dey")
              
              raw: update
            };
          });

          // Store updates in DB
          for (const update of updates) {
            await db.storeProjectUpdate(update);
          }

          log.info(`✅ Stored ${updates.length} updates for ${projectKey}`);

        } catch (error) {
          log.error(`❌ Error fetching updates for ${projectKey}:`, String(error));
          // Continue with other projects
        }
      }

      log.info(`✅ Completed fetching updates for ${projectKeys.length} projects`);

    } catch (error) {
      log.error('❌ Error fetching from API:', String(error));
      throw error;
    }
  }
}

export const fetchProjectsUpdates = FetchProjectsUpdates.getInstance();
