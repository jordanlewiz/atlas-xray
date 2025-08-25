import { BOOTSTRAP_QUERY } from '../graphql/bootstrapQuery';

interface WorkspaceSummary {
  id: string;
  uuid: string;
  name: string;
  cloudId: string;
  type: string;
}

interface BootstrapData {
  orgId: string;
  cloudIds: string[];
  workspaces: WorkspaceSummary[];
  userIsOrgAdmin: boolean;
}

/**
 * Bootstrap Service
 * Fetches organization and workspace information using the same query Atlassian uses on page load
 */
export class BootstrapService {
  private static instance: BootstrapService;
  private bootstrapData: BootstrapData | null = null;
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): BootstrapService {
    if (!BootstrapService.instance) {
      BootstrapService.instance = new BootstrapService();
    }
    return BootstrapService.instance;
  }

  /**
   * Load bootstrap data from Atlassian's GraphQL API
   */
  public async loadBootstrapData(): Promise<BootstrapData | null> {
    if (this.isLoaded && this.bootstrapData) {
      console.log('[AtlasXray] 📋 Using cached bootstrap data');
      return this.bootstrapData;
    }

    try {
      console.log('[AtlasXray] 🚀 Loading bootstrap data from GraphQL API...');

      // Get current URL to extract context
      const url = window.location.href;
      const orgMatch = url.match(/\/o\/([a-f0-9\-]+)/);
      const orgId = orgMatch ? orgMatch[1] : null;

      if (!orgId) {
        console.warn('[AtlasXray] ⚠️ Could not extract org ID from URL');
        return null;
      }

      // Import Apollo client dynamically
      const { apolloClient } = await import('./apolloClient');
      const { gql } = await import('@apollo/client');

      // Import rate limiting utilities
      const { withRateLimit } = await import('../utils/rateLimitManager');
      
      // Execute the bootstrap query without variables first with rate limiting
      const { data } = await withRateLimit(async () => {
        return apolloClient.query({
          query: gql`${BOOTSTRAP_QUERY}`,
          variables: {}, // No variables for now
          fetchPolicy: 'network-only' // Always fetch fresh data
        });
      });

      if (data?.bootstrap) {
        this.bootstrapData = {
          orgId: data.bootstrap.orgId,
          cloudIds: data.bootstrap.cloudIds || [],
          workspaces: data.bootstrap.workspaces || [],
          userIsOrgAdmin: data.bootstrap.userIsOrgAdmin || false
        };

        this.isLoaded = true;

        console.log('[AtlasXray] ✅ Bootstrap data loaded successfully');
        console.log('[AtlasXray] 🏢 Org ID:', this.bootstrapData.orgId);
        console.log('[AtlasXray] ☁️ Cloud IDs:', this.bootstrapData.cloudIds);
        console.log('[AtlasXray] 🏗️ Workspaces:', this.bootstrapData.workspaces.length);

        return this.bootstrapData;
      } else {
        console.warn('[AtlasXray] ⚠️ No bootstrap data returned from GraphQL API');
        return null;
      }

    } catch (error) {
      console.error('[AtlasXray] ❌ Error loading bootstrap data:', error);
      
      // Log additional details for debugging
      if (error && typeof error === 'object') {
        console.error('[AtlasXray] 🔍 Bootstrap error details:', {
          message: (error as any).message,
          graphQLErrors: (error as any).graphQLErrors,
          networkError: (error as any).networkError
        });
      }
      
      return null;
    }
  }

  /**
   * Get the organization ID
   */
  public getOrgId(): string | null {
    return this.bootstrapData?.orgId || null;
  }

  /**
   * Get all cloud IDs
   */
  public getCloudIds(): string[] {
    return this.bootstrapData?.cloudIds || [];
  }

  /**
   * Get all workspaces
   */
  public getWorkspaces(): WorkspaceSummary[] {
    return this.bootstrapData?.workspaces || [];
  }

  /**
   * Check if bootstrap data is loaded
   */
  public isBootstrapLoaded(): boolean {
    return this.isLoaded && this.bootstrapData !== null;
  }
}

export const bootstrapService = BootstrapService.getInstance();
