import { apolloClient } from './apolloClient';
import { DIRECTORY_VIEW_PROJECT_QUERY } from '../graphql/DirectoryViewProjectQuery';
import { db } from './DatabaseService';
import { bootstrapService } from './bootstrapService';
import { gql } from '@apollo/client';
import { log, setFilePrefix } from '../utils/logger';

// Set file-level prefix for all logging in this file
setFilePrefix('[FetchProjectsList]');

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
      log.info('Getting project list...');
      log.info('Always fetching fresh project list from API...');
      return await this.fetchFromAPI();
    } catch (error) {
      log.error('Error getting project list:', String(error));
      return [];
    }
  }

  /**
   * Fetch project list from GraphQL API
   */
  private async fetchFromAPI(): Promise<string[]> {
    try {
      log.info('Fetching projects from GraphQL API...');

      // Get workspace context
      const workspaces = bootstrapService.getWorkspaces();
      if (!workspaces || workspaces.length === 0) {
        throw new Error('No workspaces available');
      }

      const workspaceUuid = workspaces[0].uuid;
      log.debug('Using workspace UUID:', workspaceUuid);

      // Determine TQL filter based on page context and URL parameters
      const currentUrl = window.location.href;
      let tqlFilter = '(archived = false)'; // Default filter

      // First, check if there's a TQL parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlTql = urlParams.get('tql');
      
      if (urlTql) {
        // Use the TQL from URL parameters (this is the correct approach)
        tqlFilter = decodeURIComponent(urlTql);
        log.debug(`🎯 Using TQL from URL: ${tqlFilter}`);
      } else if (currentUrl.includes('/browse/')) {
        // Fallback: single project context
        const projectKeyMatch = currentUrl.match(/\/browse\/([A-Z]{2,}-\d+)/);
        if (projectKeyMatch) {
          tqlFilter = `(key = "${projectKeyMatch[1]}")`;
          log.debug(`🎯 Single project context: ${projectKeyMatch[1]}`);
        }
      } else if (currentUrl.includes('/projects')) {
        log.debug('📋 Projects list context - using default filter');
      } else {
        tqlFilter = ''; // No filter for other pages
        log.debug('🌐 Other page context - using permissive filter');
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

      log.debug('GraphQL query variables:', JSON.stringify(queryVariables));
      log.debug(`🎯 TQL Filter: ${tqlFilter}`);
      log.debug(`📊 Expected: Should return ~25 projects (filtered by label)`);

      // Execute GraphQL query
      const parsedQuery = gql`${DIRECTORY_VIEW_PROJECT_QUERY}`;
      const response = await apolloClient.query({
        query: parsedQuery,
        variables: queryVariables,
        fetchPolicy: 'cache-first'
      });

      // Check for errors
      if (response.errors && response.errors.length > 0) {
        log.error('GraphQL errors:', JSON.stringify(response.errors));
        return [];
      }

      if (!response.data?.projectTql?.edges) {
        log.warn('Invalid response structure');
        return [];
      }

      // Extract project data
      const projects = response.data.projectTql.edges.map((edge: any) => edge.node);
      log.info(`📦 Found ${projects.length} projects from API`);

      // Clear existing project list data before storing new data
      log.info('Clearing existing project list data...');
      try {
        await db.clearProjectList();
        log.info('Cleared existing project list data');
      } catch (error) {
        log.error('Failed to clear project list data:', String(error));
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

      log.info(`✅ Stored ${projects.length} project list entries in DB`);
      
      // Return project keys
      return projects.map((p: ProjectNode) => p.key);

    } catch (error) {
      log.error('Error fetching from API:', String(error));
      throw error;
    }
  }
}

export const fetchProjectsList = FetchProjectsList.getInstance();
