import { apolloClient } from './apolloClient';
import { DIRECTORY_VIEW_PROJECT_QUERY } from '../graphql/DirectoryViewProjectQuery';
import { db } from './DatabaseService';
import { bootstrapService } from './bootstrapService';
import { gql } from '@apollo/client';

interface ProjectNode {
  key: string;
  name?: string;
  archived?: boolean;
}

interface ProjectEdge {
  node: ProjectNode;
  cursor: string;
}

interface ProjectTqlResponse {
  count: number;
  edges: ProjectEdge[];
  pageInfo: {
    endCursor: string;
    hasNextPage: boolean;
  };
}

/**
 * FetchProjectsList Service
 * 
 * SINGLE RESPONSIBILITY: Fetch and store basic project list only
 * - Does NOT fetch dependencies
 * - Does NOT fetch project details
 * - Does NOT fetch project updates
 * - Only stores minimal project data (key, name, archived status)
 * - Uses DatabaseService as pure data repository
 * - Checks DB first before fetching
 * - Uses 24-hour freshness threshold
 */
export class FetchProjectsList {
  private static instance: FetchProjectsList;

  private constructor() {}

  public static getInstance(): FetchProjectsList {
    if (!FetchProjectsList.instance) {
      FetchProjectsList.instance = new FetchProjectsList();
    }
    return FetchProjectsList.instance;
  }

  /**
   * Check if projects need refresh (24-hour threshold)
   */
  private async needsRefresh(): Promise<boolean> {
    try {
      const projectCount = await db.getProjectViews().then(views => views.length);
      
      if (projectCount === 0) {
        console.log('[FetchProjectsList] 🔄 No projects in DB, needs refresh');
        return true;
      }

      // Check if any project is older than 24 hours
      const projects = await db.getProjectViews();
      const now = Date.now();
      const refreshThreshold = 24 * 60 * 60 * 1000; // 24 hours
      
      const needsRefresh = projects.some(project => {
        if (!project.lastUpdated) return true;
        const lastUpdated = new Date(project.lastUpdated).getTime();
        return (now - lastUpdated) > refreshThreshold;
      });

      if (needsRefresh) {
        console.log('[FetchProjectsList] 🔄 Some projects are older than 24 hours, needs refresh');
      } else {
        console.log('[FetchProjectsList] ✅ All projects are fresh (less than 24 hours old)');
      }

      return needsRefresh;
    } catch (error) {
      console.error('[FetchProjectsList] ❌ Error checking refresh status:', error);
      return true; // Refresh on error
    }
  }

  /**
   * Get project list - either from DB (if fresh) or fetch from API
   */
  async getProjectList(): Promise<string[]> {
    try {
      console.log('[FetchProjectsList] 🔍 Getting project list...');

      // Check if we need to refresh
      if (await this.needsRefresh()) {
        console.log('[FetchProjectsList] 🔄 Refreshing project list from API...');
        return await this.fetchFromAPI();
      } else {
        console.log('[FetchProjectsList] ✅ Using fresh project list from DB...');
        const projects = await db.getProjectViews();
        return projects.map(p => p.projectKey);
      }
    } catch (error) {
      console.error('[FetchProjectsList] ❌ Error getting project list:', error);
      return [];
    }
  }

  /**
   * Fetch project list from GraphQL API
   */
  private async fetchFromAPI(): Promise<string[]> {
    try {
      console.log('[FetchProjectsList] 🚀 Fetching projects from GraphQL API...');

      // Get workspace context
      const workspaces = bootstrapService.getWorkspaces();
      if (!workspaces || workspaces.length === 0) {
        throw new Error('No workspaces available');
      }

      const workspaceUuid = workspaces[0].uuid;
      console.log('[FetchProjectsList] 🏗️ Using workspace UUID:', workspaceUuid);

      // Determine TQL filter based on page context
      const currentUrl = window.location.href;
      let tqlFilter = '(archived = false)'; // Default filter

      if (currentUrl.includes('/browse/')) {
        const projectKeyMatch = currentUrl.match(/\/browse\/([A-Z]{2,}-\d+)/);
        if (projectKeyMatch) {
          tqlFilter = `(key = "${projectKeyMatch[1]}")`;
          console.log(`[FetchProjectsList] 🎯 Single project context: ${projectKeyMatch[1]}`);
        }
      } else if (currentUrl.includes('/projects')) {
        console.log('[FetchProjectsList] 📋 Projects list context');
      } else {
        tqlFilter = ''; // No filter for other pages
        console.log('[FetchProjectsList] 🌐 Other page context - using permissive filter');
      }

      // GraphQL query variables
      const queryVariables = {
        first: 100,
        after: null,
        workspaceUuid: workspaceUuid,
        tql: tqlFilter,
        isTableOrSavedView: true,
        isTimelineOrSavedView: false,
        includeContributors: false,
        includeFollowerCount: false,
        includeFollowing: false,
        includeLastUpdated: false,
        includeOwner: false,
        includeRelatedProjects: false, // Disabled - this service doesn't handle dependencies
        includeStatus: false,
        includeTargetDate: false,
        includeTeam: false,
        includeGoals: false,
        includeTags: false,
        includeStartDate: false,
        includedCustomFieldUuids: [],
        skipTableTql: tqlFilter === ''
      };

      console.log('[FetchProjectsList] 📤 GraphQL query variables:', queryVariables);

      // Execute GraphQL query
      const parsedQuery = gql`${DIRECTORY_VIEW_PROJECT_QUERY}`;
      const response = await apolloClient.query({
        query: parsedQuery,
        variables: queryVariables,
        fetchPolicy: 'cache-first'
      });

      // Check for errors
      if (response.errors && response.errors.length > 0) {
        console.error('[FetchProjectsList] ❌ GraphQL errors:', response.errors);
        return [];
      }

      if (!response.data?.projectTql?.edges) {
        console.warn('[FetchProjectsList] ⚠️ Invalid response structure');
        return [];
      }

      // Extract project data
      const projects = response.data.projectTql.edges.map((edge: any) => edge.node);
      console.log(`[FetchProjectsList] 📦 Found ${projects.length} projects from API`);

      // Store minimal project data in DB
      for (const project of projects) {
        await db.storeProjectView({
          projectKey: project.key,
          name: project.name,
          archived: project.archived,
          lastUpdated: new Date().toISOString(),
          raw: project
        });
      }

      console.log(`[FetchProjectsList] ✅ Stored ${projects.length} project views in DB`);
      
      // Return project keys
      return projects.map((p: ProjectNode) => p.key);

    } catch (error) {
      console.error('[FetchProjectsList] ❌ Error fetching from API:', error);
      throw error;
    }
  }
}

export const fetchProjectsList = FetchProjectsList.getInstance();
