import { apolloClient } from './apolloClient';
import { PROJECT_VIEW_QUERY } from '../graphql/projectViewQuery';
import { db } from './DatabaseService';
import { bootstrapService } from './bootstrapService';
import { gql } from '@apollo/client';

interface ProjectFullDetails {
  key: string;
  name?: string;
  status?: string;
  team?: string;
  owner?: string;
  archived?: boolean;
  description?: string;
  startDate?: string;
  targetDate?: string;
  goals?: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  tags?: Array<{
    id: string;
    name: string;
  }>;
  contributors?: Array<{
    id: string;
    displayName: string;
    emailAddress?: string;
  }>;
  followers?: Array<{
    id: string;
    displayName: string;
  }>;
}

/**
 * FetchProjectsFullDetails Service
 * 
 * SINGLE RESPONSIBILITY: Fetch and store comprehensive project details only
 * - Does NOT fetch project list (use FetchProjectsList for that)
 * - Does NOT fetch project summaries (use FetchProjectsSummary for that)
 * - Does NOT fetch project updates (use FetchProjectsUpdates for that)
 * - Only handles full project details and metadata
 * - Uses DatabaseService as pure data repository
 * - Checks DB first before fetching
 * - Uses 24-hour freshness threshold
 */
export class FetchProjectsFullDetails {
  private static instance: FetchProjectsFullDetails;

  private constructor() {}

  public static getInstance(): FetchProjectsFullDetails {
    if (!FetchProjectsFullDetails.instance) {
      FetchProjectsFullDetails.instance = new FetchProjectsFullDetails();
    }
    return FetchProjectsFullDetails.instance;
  }

  /**
   * Check if project full details need refresh (24-hour threshold)
   */
  private async needsRefresh(projectKeys: string[]): Promise<string[]> {
    try {
      const projectsNeedingRefresh: string[] = [];

      for (const projectKey of projectKeys) {
        // Check if project full details exist and are fresh
        const projectView = await db.getProjectView(projectKey);
        if (!projectView) {
          projectsNeedingRefresh.push(projectKey);
          continue;
        }

        // Check if project details are older than 24 hours
        if (!projectView.lastUpdated) {
          projectsNeedingRefresh.push(projectKey);
          continue;
        }

        const now = Date.now();
        const refreshThreshold = 24 * 60 * 60 * 1000; // 24 hours
        const lastUpdated = new Date(projectView.lastUpdated).getTime();
        
        if ((now - lastUpdated) > refreshThreshold) {
          projectsNeedingRefresh.push(projectKey);
        }
      }

      if (projectsNeedingRefresh.length > 0) {
        console.log(`[FetchProjectsFullDetails] 🔄 ${projectsNeedingRefresh.length} projects need full details refresh`);
      } else {
        console.log('[FetchProjectsFullDetails] ✅ All project full details are fresh');
      }

      return projectsNeedingRefresh;
    } catch (error) {
      console.error('[FetchProjectsFullDetails] ❌ Error checking refresh status:', error);
      return projectKeys; // Refresh all on error
    }
  }

  /**
   * Get project full details - either from DB (if fresh) or fetch from API
   */
  async getProjectFullDetails(projectKeys: string[]): Promise<void> {
    try {
      console.log(`[FetchProjectsFullDetails] 🔍 Getting full details for ${projectKeys.length} projects...`);

      // Check which projects need refresh
      const projectsNeedingRefresh = await this.needsRefresh(projectKeys);
      
      if (projectsNeedingRefresh.length === 0) {
        console.log('[FetchProjectsFullDetails] ✅ All project full details are fresh, using DB data');
        return;
      }

      console.log(`[FetchProjectsFullDetails] 🔄 Fetching full details for ${projectsNeedingRefresh.length} projects from API...`);
      await this.fetchFromAPI(projectsNeedingRefresh);

    } catch (error) {
      console.error('[FetchProjectsFullDetails] ❌ Error getting project full details:', error);
      throw error;
    }
  }

  /**
   * Fetch project full details from GraphQL API
   */
  private async fetchFromAPI(projectKeys: string[]): Promise<void> {
    try {
      console.log(`[FetchProjectsFullDetails] 🚀 Fetching full details for ${projectKeys.length} projects...`);

      // Get workspace context
      const workspaces = bootstrapService.getWorkspaces();
      if (!workspaces || workspaces.length === 0) {
        throw new Error('No workspaces available');
      }

      const workspaceUuid = workspaces[0].uuid;

      // Fetch full details for each project individually
      for (const projectKey of projectKeys) {
        try {
          console.log(`[FetchProjectsFullDetails] 📥 Fetching full details for ${projectKey}...`);
          
          const response = await apolloClient.query({
            query: gql`${PROJECT_VIEW_QUERY}`,
            variables: {
              key: projectKey,
              workspaceUuid: workspaceUuid
            },
            fetchPolicy: 'cache-first'
          });

          if (response.errors && response.errors.length > 0) {
            console.error(`[FetchProjectsFullDetails] ❌ GraphQL errors for ${projectKey}:`, response.errors);
            continue;
          }

          const projectData = response.data?.project;
          if (!projectData) {
            console.warn(`[FetchProjectsFullDetails] ⚠️ No data for project ${projectKey}`);
            continue;
          }

          // Update project view with comprehensive data
          await db.storeProjectView({
            projectKey: projectData.key,
            name: projectData.name,
            status: projectData.status?.name,
            team: projectData.team?.name,
            owner: projectData.owner?.displayName,
            archived: projectData.archived,
            lastUpdated: new Date().toISOString(),
            raw: {
              ...projectData,
              // Store additional fields in raw for future use
              description: projectData.description,
              startDate: projectData.startDate,
              targetDate: projectData.targetDate,
              goals: projectData.goals,
              tags: projectData.tags,
              contributors: projectData.contributors,
              followers: projectData.followers
            }
          });

          console.log(`[FetchProjectsFullDetails] ✅ Stored full details for ${projectKey}`);

        } catch (error) {
          console.error(`[FetchProjectsFullDetails] ❌ Error fetching full details for ${projectKey}:`, error);
          // Continue with other projects
        }
      }

      console.log(`[FetchProjectsFullDetails] ✅ Completed fetching full details for ${projectKeys.length} projects`);

    } catch (error) {
      console.error('[FetchProjectsFullDetails] ❌ Error fetching from API:', error);
      throw error;
    }
  }
}

export const fetchProjectsFullDetails = FetchProjectsFullDetails.getInstance();
