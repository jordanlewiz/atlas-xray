import { apolloClient } from './apolloClient';
import { PROJECT_VIEW_ASIDE_QUERY } from '../graphql/projectViewAsideQuery';
import { gql } from '@apollo/client';

export interface ProjectDependencyNode {
  id: string;
  key: string;
  name?: string;
  state?: {
    value: string;
    label?: string;
  };
}

export interface ProjectDependencyEdge {
  id: string;
  linkType: string;
  dependencyId: string;
  sourceProject: ProjectDependencyNode;
  targetProject: ProjectDependencyNode;
}

export interface ProjectDependenciesResponse {
  project: {
    key: string;
    dependencies: {
      edges: Array<{
        node: {
          id: string;
          linkType: string;
          dependencyId: string;
          outgoingProject: ProjectDependencyNode;
          incomingProject: {
            id: string;
          };
        };
      }>;
    };
  };
}

/**
 * Fetches project dependencies using the projectViewAsideQuery
 * This provides more detailed dependency information including linkType
 */
export async function fetchProjectDependencies(projectKey: string): Promise<ProjectDependencyEdge[]> {
  try {
    console.log(`[ProjectDependencyFetcher] Fetching dependencies for project: ${projectKey}`);
    
    // Parse the GraphQL query string into a proper document
    const parsedQuery = gql`${PROJECT_VIEW_ASIDE_QUERY}`;
    
    const response = await apolloClient.query({
      query: parsedQuery,
      variables: {
        key: projectKey,
        trackViewEvent: null,
        workspaceId: null,
        areMilestonesEnabled: true,
        cloudId: null,
        isNavRefreshEnabled: true
      },
      fetchPolicy: 'cache-first'
    });

    const data = response.data as ProjectDependenciesResponse;
    
    if (!data.project || !data.project.dependencies) {
      console.log(`[ProjectDependencyFetcher] No dependencies found for project: ${projectKey}`);
      return [];
    }

    // Transform the GraphQL response into our internal format
    const dependencies: ProjectDependencyEdge[] = data.project.dependencies.edges.map(edge => {
      const { node } = edge;
      
      return {
        id: node.id,
        linkType: node.linkType,
        dependencyId: node.dependencyId,
        sourceProject: {
          id: node.incomingProject.id,
          key: projectKey, // The current project is the source
          name: data.project.key // We'll need to fetch the actual name separately if needed
        },
        targetProject: {
          id: node.outgoingProject.id,
          key: node.outgoingProject.key,
          name: node.outgoingProject.key, // We'll need to fetch the actual name separately if needed
          state: node.outgoingProject.state
        }
      };
    });

    console.log(`[ProjectDependencyFetcher] Found ${dependencies.length} dependencies for project: ${projectKey}`);
    console.log(`[ProjectDependencyFetcher] Link types:`, dependencies.map(d => d.linkType));
    
    return dependencies;
    
  } catch (error) {
    console.error(`[ProjectDependencyFetcher] Error fetching dependencies for project ${projectKey}:`, error);
    throw error;
  }
}

/**
 * Fetches dependencies for multiple projects
 */
export async function fetchMultipleProjectDependencies(projectKeys: string[]): Promise<Map<string, ProjectDependencyEdge[]>> {
  const results = new Map<string, ProjectDependencyEdge[]>();
  
  try {
    console.log(`[ProjectDependencyFetcher] Fetching dependencies for ${projectKeys.length} projects`);
    
    // Fetch dependencies for each project in parallel
    const promises = projectKeys.map(async (projectKey) => {
      try {
        const dependencies = await fetchProjectDependencies(projectKey);
        return { projectKey, dependencies };
      } catch (error) {
        console.warn(`[ProjectDependencyFetcher] Failed to fetch dependencies for ${projectKey}:`, error);
        return { projectKey, dependencies: [] };
      }
    });
    
    const resultsArray = await Promise.all(promises);
    
    resultsArray.forEach(({ projectKey, dependencies }) => {
      results.set(projectKey, dependencies);
    });
    
    console.log(`[ProjectDependencyFetcher] Successfully fetched dependencies for ${results.size} projects`);
    
  } catch (error) {
    console.error('[ProjectDependencyFetcher] Error fetching multiple project dependencies:', error);
    throw error;
  }
  
  return results;
}

/**
 * Gets all unique link types from the dependencies
 */
export function getUniqueLinkTypes(dependencies: ProjectDependencyEdge[]): string[] {
  const linkTypes = new Set<string>();
  dependencies.forEach(dep => linkTypes.add(dep.linkType));
  return Array.from(linkTypes);
}

/**
 * Groups dependencies by link type
 */
export function groupDependenciesByLinkType(dependencies: ProjectDependencyEdge[]): Map<string, ProjectDependencyEdge[]> {
  const grouped = new Map<string, ProjectDependencyEdge[]>();
  
  dependencies.forEach(dep => {
    if (!grouped.has(dep.linkType)) {
      grouped.set(dep.linkType, []);
    }
    grouped.get(dep.linkType)!.push(dep);
  });
  
  return grouped;
}

