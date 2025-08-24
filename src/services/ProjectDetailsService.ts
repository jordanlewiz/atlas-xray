import { db } from './DatabaseService';
import { bootstrapService } from './bootstrapService';

/**
 * Project Details Service
 * 
 * Responsible for fetching detailed project information and metadata.
 * This service handles:
 * - Detailed project view data using ProjectViewQuery
 * - Project metadata storage in the database
 * - Batch processing of multiple projects
 * - Rate limiting and performance optimization
 * - Integration with the bootstrap service for workspace context
 */
export class ProjectDetailsService {
  private static instance: ProjectDetailsService;

  static getInstance(): ProjectDetailsService {
    if (!ProjectDetailsService.instance) {
      ProjectDetailsService.instance = new ProjectDetailsService();
    }
    return ProjectDetailsService.instance;
  }

  /**
   * Fetch detailed project view data for a specific project
   */
  async fetchProjectView(projectKey: string): Promise<void> {
    try {
      console.log(`[ProjectDetailsService] 🚀 Fetching detailed view for ${projectKey}`);

      // Import dependencies
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');
      const { PROJECT_VIEW_QUERY } = await import('../graphql/projectViewQuery');

      // Get workspace ID
      const workspaceId = bootstrapService.getCurrentWorkspaceId();
      if (!workspaceId) {
        console.error(`[ProjectDetailsService] ❌ No workspace ID available for ${projectKey}`);
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
        console.log(`[ProjectDetailsService] ✅ Stored detailed view for ${projectKey}`);
      } else {
        console.warn(`[ProjectDetailsService] ⚠️ No project data returned for ${projectKey}`);
      }

    } catch (error) {
      console.error(`[ProjectDetailsService] ❌ Failed to fetch project view for ${projectKey}:`, error);
    }
  }

  /**
   * Fetch detailed project views for multiple projects
   */
  async fetchProjectViews(projectKeys: string[]): Promise<void> {
    console.log(`[ProjectDetailsService] 🚀 Fetching detailed views for ${projectKeys.length} projects`);

    for (let i = 0; i < projectKeys.length; i++) {
      const projectKey = projectKeys[i];
      console.log(`[ProjectDetailsService] 📊 Fetching project ${i + 1}/${projectKeys.length}: ${projectKey}`);
      
      await this.fetchProjectView(projectKey);
      
      // Small delay between requests to be respectful
      if (i < projectKeys.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`[ProjectDetailsService] ✅ Completed fetching ${projectKeys.length} detailed project views`);
  }

  /**
   * Get project details from the database
   */
  async getProjectDetails(projectKey: string): Promise<any> {
    try {
      return await db.getProjectView(projectKey);
    } catch (error) {
      console.error(`[ProjectDetailsService] Failed to get project details for ${projectKey}:`, error);
      return null;
    }
  }

  /**
   * Check if project details exist in the database
   */
  async hasProjectDetails(projectKey: string): Promise<boolean> {
    try {
      const details = await db.getProjectView(projectKey);
      return !!details;
    } catch (error) {
      return false;
    }
  }

  /**
   * Refresh project details for a specific project
   */
  async refreshProjectDetails(projectKey: string): Promise<void> {
    console.log(`[ProjectDetailsService] 🔄 Refreshing details for ${projectKey}`);
    await this.fetchProjectView(projectKey);
  }
}

// Export singleton instance
export const projectDetailsService = ProjectDetailsService.getInstance();
