/**
 * Pure Data Repository Service
 * 
 * RESPONSIBILITY: Data persistence and retrieval only
 * - NO business logic
 * - NO API calls
 * - NO data transformation
 * - Pure CRUD operations for all project data
 * - Single source of truth for all services
 */

import Dexie, { Table } from 'dexie';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface ProjectList {
  projectKey: string; // Primary key
  name?: string;
  archived?: boolean;
  lastUpdated?: string;
  createdAt?: string;
}

export interface ProjectSummary {
  projectKey: string; // Primary key
  name?: string;
  status?: string;
  team?: string;
  owner?: string;
  lastUpdated?: string;
  archived?: boolean;
  createdAt?: string;
  raw?: any; // Full GraphQL response for backward compatibility
}

export interface ProjectUpdate {
  uuid: string; // Primary key from GraphQL
  projectKey: string;
  creationDate: string;
  state?: string;
  missedUpdate: boolean;
  targetDate?: string;
  newDueDate?: string;
  oldDueDate?: string;
  oldState?: string;
  summary?: string;
  details?: string;
  raw?: any; // Full GraphQL response for backward compatibility
  
  // Analysis fields - populated when update is analyzed
  updateQuality?: number;
  qualityLevel?: 'excellent' | 'good' | 'fair' | 'poor';
  qualitySummary?: string;
  qualityMissingInfo?: string[];
  qualityRecommendations?: string[];
  analyzed?: boolean;
  analysisDate?: string;
}

export interface ProjectDependency {
  id: string;                    // Primary key - dependency ID from GraphQL
  sourceProjectKey: string;      // Project that has the dependency
  targetProjectKey: string;      // Project that is depended upon
  linkType: string;              // Type of dependency relationship
  raw?: any;                     // Full GraphQL response for debugging
}

// ============================================================================
// MAIN DATABASE CLASS
// ============================================================================

export class DatabaseService extends Dexie {
  // Core tables
  projectList!: Table<ProjectList>;
  projectSummaries!: Table<ProjectSummary>;
  projectUpdates!: Table<ProjectUpdate>;
  projectDependencies!: Table<ProjectDependency>;

  constructor() {
    const dbName = 'AtlasXrayDB';
    super(dbName);
    
    this.version(3).stores({
      projectList: 'projectKey',
      projectSummaries: 'projectKey',
      projectUpdates: 'uuid, projectKey, creationDate, updateQuality, analyzed',
      projectDependencies: 'id, sourceProjectKey, targetProjectKey',
    });
  }

  // ============================================================================
  // PROJECT LIST OPERATIONS
  // ============================================================================

  /**
   * Store a project list entry
   */
  async storeProjectList(projectList: ProjectList): Promise<void> {
    try {
      await this.projectList.put(projectList);
      console.log(`[DatabaseService] ✅ Stored project list entry for ${projectList.projectKey}`);
    } catch (error) {
      console.error(`[DatabaseService] ❌ Failed to store project list entry for ${projectList.projectKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all project list entries
   */
  async getProjectList(): Promise<ProjectList[]> {
    try {
      return await this.projectList.toArray();
    } catch (error) {
      console.error('[DatabaseService] Failed to get project list:', error);
      return [];
    }
  }

  /**
   * Get project list entry by key
   */
  async getProjectListEntry(projectKey: string): Promise<ProjectList | undefined> {
    try {
      return await this.projectList.get(projectKey);
    } catch (error) {
      console.error(`[DatabaseService] Failed to get project list entry for ${projectKey}:`, error);
      return undefined;
    }
  }

  /**
   * Count project list entries
   */
  async countProjectList(): Promise<number> {
    try {
      return await this.projectList.count();
    } catch (error) {
      console.error('[DatabaseService] Failed to count project list entries:', error);
      return 0;
    }
  }

  /**
   * Clear all project list entries
   */
  async clearProjectList(): Promise<void> {
    try {
      // First check if the table exists and has data
      const count = await this.projectList.count();
      console.log(`[DatabaseService] 🔍 Found ${count} existing project list entries to clear`);
      
      if (count > 0) {
        await this.projectList.clear();
        console.log('[DatabaseService] ✅ Cleared all project list entries');
        
        // Verify the clear operation
        const newCount = await this.projectList.count();
        console.log(`[DatabaseService] 🔍 Verification: ${newCount} entries remaining`);
      } else {
        console.log('[DatabaseService] ℹ️ No project list entries to clear');
      }
    } catch (error) {
      console.error('[DatabaseService] Failed to clear project list entries:', error);
      throw error;
    }
  }

  // ============================================================================
  // PROJECT SUMMARY OPERATIONS
  // ============================================================================

  /**
   * Store a project summary
   */
  async storeProjectSummary(projectSummary: ProjectSummary): Promise<void> {
    try {
      await this.projectSummaries.put(projectSummary);
      console.log(`[DatabaseService] ✅ Stored project summary for ${projectSummary.projectKey}`);
    } catch (error) {
      console.error(`[DatabaseService] ❌ Failed to store project summary for ${projectSummary.projectKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all project views
   */
  async getProjectSummaries(): Promise<ProjectSummary[]> {
    try {
      return await this.projectSummaries.toArray();
    } catch (error) {
      console.error('[DatabaseService] Failed to get project summaries:', error);
      return [];
    }
  }

  /**
   * Get project view by key
   */
  async getProjectSummary(projectKey: string): Promise<ProjectSummary | undefined> {
    try {
      return await this.projectSummaries.get(projectKey);
    } catch (error) {
      console.error(`[DatabaseService] Failed to get project summary for ${projectKey}:`, error);
      return undefined;
    }
  }

  /**
   * Count project views
   */
  async countProjectSummaries(): Promise<number> {
    try {
      return await this.projectSummaries.count();
    } catch (error) {
      console.error('[DatabaseService] Failed to count project summaries:', error);
      return 0;
    }
  }

  // ============================================================================
  // PROJECT UPDATE OPERATIONS
  // ============================================================================

  /**
   * Store a project update
   */
  async storeProjectUpdate(update: ProjectUpdate): Promise<void> {
    try {
      await this.projectUpdates.put(update);
      console.log(`[DatabaseService] ✅ Stored update ${update.uuid} for ${update.projectKey}`);
    } catch (error) {
      console.error(`[DatabaseService] ❌ Failed to store update ${update.uuid}:`, error);
      throw error;
    }
  }

  /**
   * Get all project updates
   */
  async getProjectUpdates(): Promise<ProjectUpdate[]> {
    try {
      return await this.projectUpdates.toArray();
    } catch (error) {
      console.error('[DatabaseService] Failed to get project updates:', error);
      return [];
    }
  }

  /**
   * Get updates for a specific project
   */
  async getProjectUpdatesByKey(projectKey: string): Promise<ProjectUpdate[]> {
    try {
      return await this.projectUpdates.where('projectKey').equals(projectKey).toArray();
    } catch (error) {
      console.error(`[DatabaseService] Failed to get updates for ${projectKey}:`, error);
      return [];
    }
  }

  /**
   * Count project updates
   */
  async countProjectUpdates(): Promise<number> {
    try {
      return await this.projectUpdates.count();
    } catch (error) {
      console.error('[DatabaseService] Failed to count project updates:', error);
      return 0;
    }
  }

  // ============================================================================
  // PROJECT DEPENDENCIES OPERATIONS
  // ============================================================================

  /**
   * Store project dependencies
   */
  async storeProjectDependencies(
    sourceProjectKey: string, 
    dependencies: ProjectDependency[]
  ): Promise<void> {
    try {
      console.log(`[DatabaseService] 📦 Storing ${dependencies.length} dependencies for project ${sourceProjectKey}`);
      
      // Add debugging to see what we're actually storing
      console.log(`[DatabaseService] 🔍 Dependencies to store:`, dependencies);
      
      await this.projectDependencies.bulkPut(dependencies);
      console.log(`[DatabaseService] ✅ Stored ${dependencies.length} dependencies for project ${sourceProjectKey}`);
    } catch (error) {
      console.error(`[DatabaseService] ❌ Failed to store dependencies for project ${sourceProjectKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all dependencies for a project
   */
  async getProjectDependencies(projectKey: string): Promise<ProjectDependency[]> {
    try {
      return await this.projectDependencies
        .where('sourceProjectKey')
        .equals(projectKey)
        .toArray();
    } catch (error) {
      console.error(`[DatabaseService] Failed to get dependencies for ${projectKey}:`, error);
      return [];
    }
  }

  /**
   * Get all projects that depend on a specific project
   */
  async getProjectsDependingOn(projectKey: string): Promise<ProjectDependency[]> {
    try {
      return await this.projectDependencies
        .where('targetProjectKey')
        .equals(projectKey)
        .toArray();
      } catch (error) {
        console.error(`[DatabaseService] Failed to get projects depending on ${projectKey}:`, error);
        return [];
      }
  }

  /**
   * Get all project dependencies (for overview)
   */
  async getAllProjectDependencies(): Promise<ProjectDependency[]> {
    try {
      return await this.projectDependencies.toArray();
    } catch (error) {
      console.error('[DatabaseService] Failed to get all project dependencies:', error);
      return [];
    }
  }

  /**
   * Clear dependencies for a project (when project is deleted/archived)
   */
  async clearProjectDependencies(projectKey: string): Promise<void> {
    try {
      await this.projectDependencies
        .where('sourceProjectKey')
        .equals(projectKey)
        .delete();
      
      await this.projectDependencies
        .where('targetProjectKey')
        .equals(projectKey)
        .delete();
      
      console.log(`[DatabaseService] ✅ Cleared dependencies for ${projectKey}`);
    } catch (error) {
      console.error(`[DatabaseService] ❌ Failed to clear dependencies for ${projectKey}:`, error);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE & EXPORTS
// ============================================================================

export const databaseService = new DatabaseService();

// Convenience exports for services
export const db = databaseService;
export const analysisDB = databaseService;

// Core function exports for services
export const storeProjectList = (projectList: ProjectList) => databaseService.storeProjectList(projectList);
export const getProjectList = () => databaseService.getProjectList();
export const countProjectList = () => databaseService.countProjectList();
export const clearProjectList = () => databaseService.clearProjectList();
export const storeProjectSummary = (projectSummary: ProjectSummary) => databaseService.storeProjectSummary(projectSummary);
export const storeProjectUpdate = (update: ProjectUpdate) => databaseService.storeProjectUpdate(update);
export const getProjectSummary = (projectKey: string) => databaseService.getProjectSummary(projectKey);
export const getProjectSummaries = () => databaseService.getProjectSummaries();
export const countProjectSummaries = () => databaseService.countProjectSummaries();

// Dependency function exports for services
export const storeProjectDependencies = (sourceProjectKey: string, dependencies: any[]) => databaseService.storeProjectDependencies(sourceProjectKey, dependencies);
export const getProjectDependencies = (projectKey: string) => databaseService.getProjectDependencies(projectKey);
export const getProjectsDependingOn = (projectKey: string) => databaseService.getProjectsDependingOn(projectKey);
export const getAllProjectDependencies = () => databaseService.getAllProjectDependencies();
export const clearProjectDependencies = (projectKey: string) => databaseService.clearProjectDependencies(projectKey);

// Initialize database
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('[DatabaseService] 🔧 Starting database initialization...');
    
    // Check if we're in content script or background script
    const isContentScript = typeof window !== 'undefined' && (
      window.location.href.includes('http://') || 
      window.location.href.includes('https://') 
    ) && !window.location.href.includes('chrome-extension://') && !window.location.href.includes('moz-extension://');
    
    console.log(`[DatabaseService] 📍 Context: ${isContentScript ? 'Content Script' : 'Background Script'}`);
    
    await databaseService.open();
    console.log('[DatabaseService] ✅ Database opened successfully');
    
    console.log('[DatabaseService] 📊 Database initialized successfully');
    
  } catch (error) {
    console.error('[DatabaseService] ❌ Failed to initialize database:', error);
    throw error;
  }
}


