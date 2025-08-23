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
   * Get the current workspace ID (for projectTql queries)
   */
  public getCurrentWorkspaceId(): string | null {
    if (!this.bootstrapData) {
      console.warn('[AtlasXray] ⚠️ No bootstrap data available for workspace ID lookup');
      return null;
    }

    const url = window.location.href;
    console.log('[AtlasXray] 🔍 Looking for workspace ID in URL:', url);
    
    // Method 1: Try to match section ID from path (/s/{sectionId}/)
    const sectionMatch = url.match(/\/s\/([a-f0-9\-]+)/);
    if (sectionMatch) {
      const sectionId = sectionMatch[1];
      console.log('[AtlasXray] 🔍 Found section ID in path:', sectionId);
      
      // Find workspace that matches the section ID
      const workspace = this.bootstrapData.workspaces.find(w => 
        w.cloudId === sectionId || w.uuid === sectionId || w.id === sectionId
      );
      
      if (workspace) {
        console.log('[AtlasXray] 🎯 Found matching workspace by section ID:', workspace.name, workspace.uuid);
        return workspace.uuid; // Use UUID for GraphQL queries
      }
    }

    // Method 2: Try to match cloudId from URL parameter (?cloudId={cloudId})
    const urlParams = new URLSearchParams(window.location.search);
    const cloudIdParam = urlParams.get('cloudId');
    if (cloudIdParam) {
      console.log('[AtlasXray] 🔍 Found cloudId parameter:', cloudIdParam);
      
      // Find workspace that matches the cloudId parameter
      const workspace = this.bootstrapData.workspaces.find(w => 
        w.cloudId === cloudIdParam || w.uuid === cloudIdParam || w.id === cloudIdParam
      );
      
      if (workspace) {
        console.log('[AtlasXray] 🎯 Found matching workspace by cloudId parameter:', workspace.name, workspace.uuid);
        return workspace.uuid; // Use UUID for GraphQL queries
      }
    }

    // Method 3: Try to match organization ID from path (/o/{orgId}/)
    const orgMatch = url.match(/\/o\/([a-f0-9\-]+)/);
    if (orgMatch) {
      const orgId = orgMatch[1];
      console.log('[AtlasXray] 🔍 Found org ID in path:', orgId);
      
      // Find workspace that matches the org ID
      const workspace = this.bootstrapData.workspaces.find(w => 
        w.cloudId === orgId || w.uuid === orgId || w.id === orgId
      );
      
      if (workspace) {
        console.log('[AtlasXray] 🎯 Found matching workspace by org ID:', workspace.name, workspace.uuid);
        return workspace.uuid; // Use UUID for GraphQL queries
      }
    }

    // Fallback: Use first workspace
    if (this.bootstrapData.workspaces.length > 0) {
      const firstWorkspace = this.bootstrapData.workspaces[0];
      console.log('[AtlasXray] 🔄 Using first workspace as fallback:', firstWorkspace.name, firstWorkspace.uuid);
      console.log('[AtlasXray] 🏗️ Available workspaces:', this.bootstrapData.workspaces.map(w => ({
        name: w.name,
        uuid: w.uuid,
        cloudId: w.cloudId,
        id: w.id
      })));
      return firstWorkspace.uuid; // Use UUID for GraphQL queries
    }

    console.error('[AtlasXray] ❌ No workspaces found in bootstrap data');
    return null;
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
