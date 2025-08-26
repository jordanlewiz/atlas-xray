import { apolloClient } from './apolloClient';
import { PROJECT_VIEW_ASIDE_QUERY } from '../graphql/projectViewAsideQuery';
import { db } from './DatabaseService';
import { bootstrapService } from './bootstrapService';
import { gql } from '@apollo/client';

interface ProjectSummary {
  key: string;
  name?: string;
  status?: string;
  team?: string;
  owner?: string;
  archived?: boolean;
  dependencies?: {
    edges: Array<{
      node: {
        id: string;
        linkType: string;
        outgoingProject: {
          key: string;
          name?: string;
        };
      };
    }>;
  };
}

/**
 * FetchProjectsSummary Service
 * 
 * SINGLE RESPONSIBILITY: Fetch and store project summaries and dependencies
 * - COMPLETELY INDEPENDENT from FetchProjectsList
 * - Does NOT fetch project list (use FetchProjectsList for that)
 * - Does NOT fetch project updates (use FetchProjectsUpdates for that)
 * - Does NOT fetch full project details (use FetchProjectsFullDetails for that)
 * - Only handles project summaries and dependencies
 * - Uses DatabaseService as pure data repository
 * - Checks DB first before fetching
 * - Uses 24-hour freshness threshold
 */
export class FetchProjectsSummary {
  private static instance: FetchProjectsSummary;

  private constructor() {}

  public static getInstance(): FetchProjectsSummary {
    if (!FetchProjectsSummary.instance) {
      FetchProjectsSummary.instance = new FetchProjectsSummary();
    }
    return FetchProjectsSummary.instance;
  }

  /**
   * Check if project summaries need refresh (24-hour threshold)
   */
  private async needsRefresh(projectKeys: string[]): Promise<string[]> {
    try {
      const projectsNeedingRefresh: string[] = [];

      for (const projectKey of projectKeys) {
        // Check if project summary exists and is fresh
        const projectSummary = await db.getProjectSummary(projectKey);
        if (!projectSummary) {
          projectsNeedingRefresh.push(projectKey);
          continue;
        }

        // Check if dependencies exist and are fresh
        const dependencies = await db.getProjectDependencies(projectKey);
        if (dependencies.length === 0) {
          projectsNeedingRefresh.push(projectKey);
          continue;
        }

        // Check if dependencies are older than 24 hours
        const now = Date.now();
        const refreshThreshold = 24 * 60 * 60 * 1000; // 24 hours
        
        const hasStaleDependencies = dependencies.some(dep => {
          if (!dep.lastUpdated) return true;
          const lastUpdated = new Date(dep.lastUpdated).getTime();
          return (now - lastUpdated) > refreshThreshold;
        });

        if (hasStaleDependencies) {
          projectsNeedingRefresh.push(projectKey);
        }
      }

      if (projectsNeedingRefresh.length > 0) {
        console.log(`[FetchProjectsSummary] 🔄 ${projectsNeedingRefresh.length} projects need refresh`);
      } else {
        console.log('[FetchProjectsSummary] ✅ All project summaries are fresh');
      }

      return projectsNeedingRefresh;
    } catch (error) {
      console.error('[FetchProjectsSummary] ❌ Error checking refresh status:', error);
      return projectKeys; // Refresh all on error
    }
  }

  /**
   * Get project summaries - either from DB (if fresh) or fetch from API
   */
  async getProjectSummaries(projectKeys: string[]): Promise<void> {
    try {
      console.log(`[FetchProjectsSummary] 🔍 Getting summaries for ${projectKeys.length} projects...`);

      // Check which projects need refresh
      const projectsNeedingRefresh = await this.needsRefresh(projectKeys);
      
      if (projectsNeedingRefresh.length === 0) {
        console.log('[FetchProjectsSummary] ✅ All project summaries are fresh, using DB data');
        return;
      }

      console.log(`[FetchProjectsSummary] 🔄 Fetching summaries for ${projectsNeedingRefresh.length} projects from API...`);
      await this.fetchFromAPI(projectsNeedingRefresh);

    } catch (error) {
      console.error('[FetchProjectsSummary] ❌ Error getting project summaries:', error);
      throw error;
    }
  }

  /**
   * Fetch project summaries from GraphQL API
   */
  private async fetchFromAPI(projectKeys: string[]): Promise<void> {
    try {
      console.log(`[FetchProjectsSummary] 🚀 Fetching summaries for ${projectKeys.length} projects...`);

      // Get workspace context
      const workspaces = bootstrapService.getWorkspaces();
      if (!workspaces || workspaces.length === 0) {
        throw new Error('No workspaces available');
      }

      const workspaceUuid = workspaces[0].uuid;

      // Fetch each project summary individually (GraphQL limitation)
      for (const projectKey of projectKeys) {
        try {
          console.log(`[FetchProjectsSummary] 📥 Fetching summary for ${projectKey}...`);
          
          const response = await apolloClient.query({
            query: gql`${PROJECT_VIEW_ASIDE_QUERY}`,
            variables: {
              key: projectKey,
              workspaceUuid: workspaceUuid
            },
            fetchPolicy: 'cache-first'
          });

          if (response.errors && response.errors.length > 0) {
            console.error(`[FetchProjectsSummary] ❌ GraphQL errors for ${projectKey}:`, response.errors);
            continue;
          }

          const projectData = response.data?.project;
          if (!projectData) {
            console.warn(`[FetchProjectsSummary] ⚠️ No data for project ${projectKey}`);
            continue;
          }

          // Update project summary with summary data
          await db.storeProjectSummary({
            projectKey: projectData.key,
            name: projectData.name,
            status: projectData.status?.name,
            team: projectData.team?.name,
            owner: projectData.owner?.displayName,
            archived: projectData.archived,
            lastUpdated: new Date().toISOString(),
            raw: projectData
          });

          // Store dependencies if they exist
          if (projectData.dependencies?.edges && projectData.dependencies.edges.length > 0) {
            const dependencies = projectData.dependencies.edges.map((edge: any) => ({
              id: edge.node.id,
              sourceProjectKey: projectKey,
              targetProjectKey: edge.node.outgoingProject.key,
              sourceProjectName: projectData.name,
              targetProjectName: edge.node.outgoingProject.name,
              linkType: edge.node.linkType,
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              raw: edge.node
            }));

            await db.storeProjectDependencies(projectKey, dependencies);
            console.log(`[FetchProjectsSummary] ✅ Stored ${dependencies.length} dependencies for ${projectKey}`);
          } else {
            console.log(`[FetchProjectsSummary] ℹ️ No dependencies for ${projectKey}`);
          }

        } catch (error) {
          console.error(`[FetchProjectsSummary] ❌ Error fetching summary for ${projectKey}:`, error);
          // Continue with other projects
        }
      }

      console.log(`[FetchProjectsSummary] ✅ Completed fetching summaries for ${projectKeys.length} projects`);

    } catch (error) {
      console.error('[FetchProjectsSummary] ❌ Error fetching from API:', error);
      throw error;
    }
  }
}

export const fetchProjectsSummary = FetchProjectsSummary.getInstance();
