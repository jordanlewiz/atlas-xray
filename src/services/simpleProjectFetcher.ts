import { db } from './DatabaseService';
import { bootstrapService } from './bootstrapService';

/**
 * Simple Project Fetcher Service
 * Fetches detailed project view data using ProjectViewQuery
 * (Triggered on modal events, not page load)
 */
export class SimpleProjectFetcher {
  private static instance: SimpleProjectFetcher;

  static getInstance(): SimpleProjectFetcher {
    if (!SimpleProjectFetcher.instance) {
      SimpleProjectFetcher.instance = new SimpleProjectFetcher();
    }
    return SimpleProjectFetcher.instance;
  }

  /**
   * Fetch detailed project view data for a specific project
   */
  async fetchProjectView(projectKey: string): Promise<void> {
    try {
      console.log(`[SimpleProjectFetcher] 🚀 Fetching detailed view for ${projectKey}`);

      // Import dependencies
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      const { PROJECT_VIEW_QUERY } = await import('../graphql/projectViewQuery');

      // Get workspace ID
      const workspaceId = bootstrapService.getCurrentWorkspaceId();
      if (!workspaceId) {
        console.error(`[SimpleProjectFetcher] ❌ No workspace ID available for ${projectKey}`);
        return;
      }

      // Import rate limiting utilities
      const { withRateLimit } = await import('../utils/rateLimitManager');
      
      // Fetch detailed project view with rate limiting
      const { data } = await withRateLimit(async () => {
        return apolloClient.query({
          query: gql`${PROJECT_VIEW_QUERY}`,
          variables: {
            key: projectKey,
            workspaceUuid: workspaceId
          },
          fetchPolicy: 'network-only'
        });
      });

      if (data?.project) {
        // Store the detailed project view
        const projectView = {
          projectKey: projectKey,
          name: data.project.name,
          status: data.project.status?.name,
          team: data.project.team?.name,
          owner: data.project.owner?.displayName,
          lastUpdated: data.project.lastUpdated,
          archived: data.project.archived,
          createdAt: data.project.createdAt
        };

        await db.storeProjectView(projectView);
        console.log(`[SimpleProjectFetcher] ✅ Stored detailed view for ${projectKey}`);
      } else {
        console.warn(`[SimpleProjectFetcher] ⚠️ No project data returned for ${projectKey}`);
      }

    } catch (error) {
      console.error(`[SimpleProjectFetcher] ❌ Failed to fetch project view for ${projectKey}:`, error);
    }
  }

  /**
   * Fetch detailed project views for multiple projects
   */
  async fetchProjectViews(projectKeys: string[]): Promise<void> {
    console.log(`[SimpleProjectFetcher] 🚀 Fetching detailed views for ${projectKeys.length} projects`);

    for (let i = 0; i < projectKeys.length; i++) {
      const projectKey = projectKeys[i];
      console.log(`[SimpleProjectFetcher] 📊 Fetching project ${i + 1}/${projectKeys.length}: ${projectKey}`);
      
      await this.fetchProjectView(projectKey);
      
      // Small delay between requests to be respectful
      if (i < projectKeys.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`[SimpleProjectFetcher] ✅ Completed fetching ${projectKeys.length} detailed project views`);
  }
}

export const simpleProjectFetcher = SimpleProjectFetcher.getInstance();
