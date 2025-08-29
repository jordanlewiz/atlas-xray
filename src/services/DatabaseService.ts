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
  oldState?: string;
  summary?: string;
  details?: string;
  raw?: any; // Full GraphQL response for backward compatibility
  
  // NEW: Clear target date fields for consistent date handling
  newTargetDate?: string;                 // New target date (e.g., "October to December")
  newTargetDateParsed?: string;           // Parsed ISO date (e.g., "2024-12-01")
  oldTargetDate?: string;                 // Previous target date (e.g., "September")
  oldTargetDateParsed?: string;           // Parsed ISO date (e.g., "2024-09-01")
  
  // NEW: Creator information for easy access
  creatorName?: string;                   // Creator's name (e.g., "Arnab Dey")
  
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
    // Use extension version for database naming - fresh DB every install
    const extensionVersion = DatabaseService.getExtensionVersion();
    const dbName = `AtlasXrayDB_${extensionVersion}`;
    
    super(dbName);
    
    // Always start with version 1 - no migrations needed.
    // RATIONALE: The database name includes the extension version, so a fresh DB is created for each extension install.
    // This means schema migrations are not required, and the schema version is always set to 1.
    // If schema evolution becomes necessary in the future, consider using a composite versioning scheme (e.g., extensionVersion.schemaVersion).
    this.version(1).stores({
      projectList: 'projectKey',
      projectSummaries: 'projectKey',
      projectUpdates: 'uuid, projectKey, creationDate, updateQuality, analyzed, newTargetDate, newTargetDateParsed, oldTargetDate, oldTargetDateParsed, creatorName',
      projectDependencies: 'id, sourceProjectKey, targetProjectKey',
    });
    
    console.log(`[DatabaseService] 🗄️ Using database: ${dbName} (Extension: ${extensionVersion})`);
  }

  /**
   * Get the current extension version from manifest
   * Falls back to 'dev' if not available (for development/testing)
   */
  private static getExtensionVersion(): string {
    try {
      // Try to get version from Chrome extension manifest
      const chrome = (globalThis as any).chrome;
      if (
        chrome &&
        chrome.runtime &&
        typeof chrome.runtime.getManifest === 'function'
      ) {
        const manifest = chrome.runtime.getManifest();
        return manifest.version || 'unknown';
      }
      
      // Fallback for non-Chrome environments (testing, development)
      return 'dev';
    } catch (error) {
      console.warn('[DatabaseService] Could not get extension version, using "dev":', error);
      return 'dev';
    }
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
      
      if (count > 0) {
        await this.projectList.clear();
        
        // Verify the clear operation
        const newCount = await this.projectList.count();
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
      await this.projectDependencies.bulkPut(dependencies);
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
      

    } catch (error) {
      console.error(`[DatabaseService] ❌ Failed to clear dependencies for ${projectKey}:`, error);
      throw error;
    }
  }

  /**
   * Clear all project updates (for testing/fresh start)
   */
  async clearProjectUpdates(): Promise<void> {
    try {
      await this.projectUpdates.clear();
      console.log('[DatabaseService] ✅ Cleared all project updates');
    } catch (error) {
      console.error('[DatabaseService] ❌ Failed to clear project updates:', error);
      throw error;
    }
  }

  // ============================================================================
  // DATABASE MANAGEMENT UTILITIES
  // ============================================================================

  /**
   * Get the current database name
   */
  getDatabaseName(): string {
    return this.name;
  }

  /**
   * Get the current extension version used for this database
   */
  getExtensionVersion(): string {
    return DatabaseService.getExtensionVersion();
  }

  /**
   * List all AtlasXray databases (for cleanup purposes)
   */
  static async listAllDatabases(): Promise<string[]> {
    try {
      const allDatabases = await Dexie.getDatabaseNames();
      return allDatabases.filter(name => name.startsWith('AtlasXrayDB_'));
    } catch (error) {
      console.error('[DatabaseService] Failed to list databases:', error);
      return [];
    }
  }

  /**
   * Clean up old databases (keep only current version)
   * Uses concurrent deletion for better performance
   */
  static async cleanupOldDatabases(): Promise<void> {
    try {
      const currentVersion = DatabaseService.getExtensionVersion();
      const currentDbName = `AtlasXrayDB_${currentVersion}`;
      const allDatabases = await DatabaseService.listAllDatabases();
      
      // Filter out current database and create concurrent deletion promises
      const deletionPromises = allDatabases
        .filter(dbName => dbName !== currentDbName)
        .map(dbName =>
          Dexie.delete(dbName)
            .then(() => {
              console.log(`[DatabaseService] 🧹 Cleaned up old database: ${dbName}`);
              return { dbName, status: 'fulfilled' as const };
            })
            .catch(error => {
              console.warn(`[DatabaseService] Failed to clean up database ${dbName}:`, error);
              return { dbName, status: 'rejected' as const, reason: error };
            })
        );
      
      // Execute all deletions concurrently
      const results = await Promise.allSettled(deletionPromises);
      
      // Count successful deletions
      const cleanedCount = results.filter(r => r.status === 'fulfilled').length;
      const failedCount = results.filter(r => r.status === 'rejected').length;
      
      if (cleanedCount > 0) {
        console.log(`[DatabaseService] 🧹 Cleaned up ${cleanedCount} old database(s)`);
      }
      if (failedCount > 0) {
        console.warn(`[DatabaseService] ⚠️ Failed to clean up ${failedCount} database(s)`);
      }
      if (cleanedCount === 0 && failedCount === 0) {
        console.log(`[DatabaseService] ✨ No old databases to clean up`);
      }
    } catch (error) {
      console.error('[DatabaseService] Failed to clean up old databases:', error);
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
export const clearProjectUpdates = () => databaseService.clearProjectUpdates();
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
export async function initializeDatabase(cleanupOldDatabases: boolean = false): Promise<void> {
  try {
    // Check if we're in content script or background script
    const isContentScript = typeof window !== 'undefined' && (
      window.location.href.includes('http://') || 
      window.location.href.includes('https://') 
    ) && !window.location.href.includes('chrome-extension://') && !window.location.href.includes('moz-extension://');
    
    await databaseService.open();
    
    // Optionally clean up old databases (useful for background script)
    if (cleanupOldDatabases) {
      await DatabaseService.cleanupOldDatabases();
    }
    
  } catch (error) {
    console.error('[DatabaseService] ❌ Failed to initialize database:', error);
    throw error;
  }
}


