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
 * - Only stores minimal project list data (key, name, archived status)
 * - Does NOT store project summaries (use FetchProjectsSummary for that)
 * - Uses DatabaseService as pure data repository
 * - ALWAYS fetches fresh data from API (no caching)
 * - Clears existing data before storing new data
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
   * Get project list - always fetch fresh data from API
   * This ensures we get the latest project list every time
   */
  async getProjectList(): Promise<string[]> {
    try {
      console.log('[FetchProjectsList] 🔍 Getting project list...');
      console.log('[FetchProjectsList] 🔄 Always fetching fresh project list from API...');
      return await this.fetchFromAPI();
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

      // Determine TQL filter based on page context and URL parameters
      const currentUrl = window.location.href;
      let tqlFilter = '(archived = false)'; // Default filter

      // First, check if there's a TQL parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlTql = urlParams.get('tql');
      
      if (urlTql) {
        // Use the TQL from URL parameters (this is the correct approach)
        tqlFilter = decodeURIComponent(urlTql);
        console.log(`[FetchProjectsList] 🎯 Using TQL from URL: ${tqlFilter}`);
      } else if (currentUrl.includes('/browse/')) {
        // Fallback: single project context
        const projectKeyMatch = currentUrl.match(/\/browse\/([A-Z]{2,}-\d+)/);
        if (projectKeyMatch) {
          tqlFilter = `(key = "${projectKeyMatch[1]}")`;
          console.log(`[FetchProjectsList] 🎯 Single project context: ${projectKeyMatch[1]}`);
        }
      } else if (currentUrl.includes('/projects')) {
        console.log('[FetchProjectsList] 📋 Projects list context - using default filter');
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
        skipTableTql: false // Never skip TQL - always use the filter
      };

      console.log('[FetchProjectsList] 📤 GraphQL query variables:', queryVariables);
      console.log(`[FetchProjectsList] 🎯 TQL Filter: ${tqlFilter}`);
      console.log(`[FetchProjectsList] 📊 Expected: Should return ~25 projects (filtered by label)`);

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

      // Clear existing project list data before storing new data
      console.log('[FetchProjectsList] 🗑️ Clearing existing project list data...');
      try {
        await db.clearProjectList();
        console.log('[FetchProjectsList] ✅ Cleared existing project list data');
      } catch (error) {
        console.error('[FetchProjectsList] ❌ Failed to clear project list data:', error);
        // Continue anyway - we'll overwrite the data
      }

      // Store minimal project list data in DB
      for (const project of projects) {
        await db.storeProjectList({
          projectKey: project.key,
          name: project.name,
          archived: project.archived,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }

      console.log(`[FetchProjectsList] ✅ Stored ${projects.length} project list entries in DB`);
      
      // Return project keys
      return projects.map((p: ProjectNode) => p.key);

    } catch (error) {
      console.error('[FetchProjectsList] ❌ Error fetching from API:', error);
      throw error;
    }
  }
}

export const fetchProjectsList = FetchProjectsList.getInstance();
