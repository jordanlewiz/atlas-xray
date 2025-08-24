/**
 * Unified Database Service
 * Consolidates all database operations into a single service
 * Ensures updates are automatically analyzed when stored
 */

import Dexie, { Table } from 'dexie';
import { analyzeUpdateQuality } from './AnalysisService';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface ProjectView {
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

export interface StoredAnalysis {
  id?: number;
  projectId: string;
  updateId: string;
  originalText: string;
  analysis: any; // ProjectUpdateAnalysis from AnalysisService
  createdAt: Date;
  updatedAt: Date;
}

export interface MetaData {
  key: string;
  value: string;
  lastUpdated: string;
}

export interface AnalysisSummary {
  projectId: string;
  totalUpdates: number;
  analyzedUpdates: number;
  averageQuality: number;
}

// ============================================================================
// MAIN DATABASE CLASS
// ============================================================================

export class DatabaseService extends Dexie {
  // Core tables
  projectViews!: Table<ProjectView>;
  projectUpdates!: Table<ProjectUpdate>;
  meta!: Table<MetaData>;
  
  // Visible projects tracking
  visibleProjects!: Table<{ id: string; projectKey: string; timestamp: Date }>;
  
  // Analysis tables
  storedAnalyses!: Table<StoredAnalysis>;
  analysisCache!: Table<{ id: string; analysis: any; timestamp: Date }>;

  constructor() {
    super('AtlasXrayDB');
    
    this.version(1).stores({
      // Core tables
      projectViews: 'projectKey',
      projectUpdates: 'uuid, projectKey, creationDate, updateQuality, analyzed',
      meta: 'key',
      
      // Visible projects tracking
      visibleProjects: 'id, projectKey, timestamp',
      
      // Analysis tables
      storedAnalyses: '++id, projectId, updateId, createdAt',
      analysisCache: 'id, timestamp'
    });
  }

  // ============================================================================
  // PROJECT VIEW OPERATIONS
  // ============================================================================

  /**
   * Store a project view
   */
  async storeProjectView(projectView: ProjectView): Promise<void> {
    try {
      await this.projectViews.put(projectView);
      console.log(`[DatabaseService] ✅ Stored project view for ${projectView.projectKey}`);
    } catch (error) {
      console.error(`[DatabaseService] ❌ Failed to store project view for ${projectView.projectKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all project views
   */
  async getProjectViews(): Promise<ProjectView[]> {
    try {
      return await this.projectViews.toArray();
    } catch (error) {
      console.error('[DatabaseService] Failed to get project views:', error);
      return [];
    }
  }

  /**
   * Get project view by key
   */
  async getProjectView(projectKey: string): Promise<ProjectView | undefined> {
    try {
      return await this.projectViews.get(projectKey);
    } catch (error) {
      console.error(`[DatabaseService] Failed to get project view for ${projectKey}:`, error);
      return undefined;
    }
  }

  /**
   * Count project views
   */
  async countProjectViews(): Promise<number> {
    try {
      return await this.projectViews.count();
    } catch (error) {
      console.error('[DatabaseService] Failed to count project views:', error);
      return 0;
    }
  }

  // ============================================================================
  // VISIBLE PROJECTS OPERATIONS
  // ============================================================================

  /**
   * Set visible project IDs (projects currently visible on the page)
   */
  async setVisibleProjectIds(projectKeys: string[]): Promise<void> {
    try {
      // Clear existing visible projects
      await this.visibleProjects.clear();
      
      // Add new visible projects
      const visibleProjects = projectKeys.map(key => ({
        id: `visible_${key}`,
        projectKey: key,
        timestamp: new Date()
      }));
      
      await this.visibleProjects.bulkAdd(visibleProjects);
      console.log(`[DatabaseService] ✅ Set ${projectKeys.length} visible project IDs`);
    } catch (error) {
      console.error('[DatabaseService] Failed to set visible project IDs:', error);
      throw error;
    }
  }

  /**
   * Get visible project IDs
   */
  async getVisibleProjectIds(): Promise<string[]> {
    try {
      const visibleProjects = await this.visibleProjects.toArray();
      return visibleProjects.map(p => p.projectKey);
    } catch (error) {
      console.error('[DatabaseService] Failed to get visible project IDs:', error);
      return [];
    }
  }

  // ============================================================================
  // PROJECT UPDATE OPERATIONS
  // ============================================================================

  /**
   * Store a project update with automatic analysis
   */
  async storeProjectUpdate(update: ProjectUpdate): Promise<void> {
    try {
      // Store the update first
      await this.projectUpdates.put(update);
      console.log(`[DatabaseService] ✅ Stored update ${update.uuid} for ${update.projectKey}`);
      
      // Automatically analyze if it has a summary and hasn't been analyzed
      if (update.summary && update.summary.trim() && !update.analyzed) {
        await this.analyzeUpdate(update);
      }
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
   * Get updates that haven't been analyzed
   */
  async getUnanalyzedUpdates(): Promise<ProjectUpdate[]> {
    try {
      return await this.projectUpdates
        .filter(update => !update.analyzed && update.summary && update.summary.trim())
        .toArray();
    } catch (error) {
      console.error('[DatabaseService] Failed to get unanalyzed updates:', error);
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

  /**
   * Count analyzed updates
   */
  async countAnalyzedUpdates(): Promise<number> {
    try {
      return await this.projectUpdates.filter(update => update.analyzed).count();
    } catch (error) {
      console.error('[DatabaseService] Failed to count analyzed updates:', error);
      return 0;
    }
  }

  /**
   * Count updates with quality scores above threshold
   */
  async countUpdatesWithQuality(threshold: number = 0): Promise<number> {
    try {
      return await this.projectUpdates.where('updateQuality').above(threshold).count();
    } catch (error) {
      console.error('[DatabaseService] Failed to count updates with quality:', error);
      return 0;
    }
  }

  /**
   * Get total updates available count (from metadata)
   */
  async getTotalUpdatesAvailableCount(): Promise<number> {
    try {
      const countStr = await this.getMetaData('totalUpdatesAvailable');
      return countStr ? parseInt(countStr, 10) : 0;
    } catch (error) {
      console.error('[DatabaseService] Failed to get total updates available count:', error);
      return 0;
    }
  }

  /**
   * Set total updates available count (from server)
   */
  async setTotalUpdatesAvailableCount(count: number): Promise<void> {
    try {
      await this.storeMetaData('totalUpdatesAvailable', count.toString());
    } catch (error) {
      console.error('[DatabaseService] Failed to set total updates available count:', error);
      throw error;
    }
  }

  /**
   * Get project image (placeholder for now)
   */
  async getProjectImage(projectKey: string): Promise<string | null> {
    try {
      // For now, return null - this can be enhanced later
      return null;
    } catch (error) {
      console.error(`[DatabaseService] Failed to get project image for ${projectKey}:`, error);
      return null;
    }
  }

  /**
   * Get all project summaries for analysis
   */
  async getAllProjectSummaries(): Promise<Array<{ projectKey: string; summary: string }>> {
    try {
      const updates = await this.projectUpdates
        .where('summary')
        .above('')
        .toArray();
      
      return updates.map(update => ({
        projectKey: update.projectKey,
        summary: update.summary || ''
      }));
    } catch (error) {
      console.error('[DatabaseService] Failed to get all project summaries:', error);
      return [];
    }
  }

  /**
   * Get analysis by project ID and update ID
   */
  async getAnalysis(projectId: string, updateId: string): Promise<StoredAnalysis | undefined> {
    try {
      return await this.storedAnalyses
        .where(['projectId', 'updateId'])
        .equals([projectId, updateId])
        .first();
    } catch (error) {
      console.error(`[DatabaseService] Failed to get analysis for ${projectId}/${updateId}:`, error);
      return undefined;
    }
  }

  // ============================================================================
  // ANALYSIS OPERATIONS
  // ============================================================================

  /**
   * Analyze a project update and store results
   */
  async analyzeUpdate(update: ProjectUpdate): Promise<void> {
    try {
      if (!update.summary || update.summary.trim().length === 0) {
        console.log(`[DatabaseService] ⚠️ Skipping analysis for update ${update.uuid} - no summary`);
        return;
      }

      if (update.analyzed) {
        console.log(`[DatabaseService] ⚠️ Update ${update.uuid} already analyzed`);
        return;
      }

      console.log(`[DatabaseService] 🔍 Analyzing update ${update.uuid} for ${update.projectKey}`);
      
      // Perform analysis using the unified AnalysisService
      const analysisResult = await analyzeUpdateQuality(update.summary);
      
      // Update the stored update with analysis results
      const analyzedUpdate: ProjectUpdate = {
        ...update,
        updateQuality: analysisResult.overallScore,
        qualityLevel: analysisResult.qualityLevel,
        qualitySummary: analysisResult.summary,
        qualityMissingInfo: analysisResult.missingInfo || [],
        qualityRecommendations: analysisResult.recommendations || [],
        analyzed: true,
        analysisDate: new Date().toISOString()
      };

      // Store the updated record
      await this.projectUpdates.put(analyzedUpdate);
      
      // Also store in the analysis table for detailed results
      await this.storeAnalysis(update.projectKey, update.uuid, update.summary, analysisResult);
      
      console.log(`[DatabaseService] ✅ Analysis complete for update ${update.uuid} - Quality: ${analysisResult.overallScore}%`);
      
    } catch (error) {
      console.error(`[DatabaseService] ❌ Analysis failed for update ${update.uuid}:`, error);
      
      // Mark as analyzed but with error
      const errorUpdate: ProjectUpdate = {
        ...update,
        updateQuality: 0,
        qualityLevel: 'poor',
        qualitySummary: 'Analysis failed',
        analyzed: true,
        analysisDate: new Date().toISOString()
      };
      
      try {
        await this.projectUpdates.put(errorUpdate);
      } catch (dbError) {
        console.error(`[DatabaseService] ❌ Failed to store error update for ${update.uuid}:`, dbError);
      }
    }
  }

  /**
   * Store analysis results in the analysis table
   */
  async storeAnalysis(
    projectId: string, 
    updateId: string, 
    originalText: string, 
    analysis: any
  ): Promise<number> {
    try {
      const id = await this.storedAnalyses.add({
        projectId,
        updateId,
        originalText,
        analysis,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`[DatabaseService] ✅ Stored analysis for update ${updateId}`);
      return id;
    } catch (error) {
      console.error(`[DatabaseService] ❌ Failed to store analysis for update ${updateId}:`, error);
      throw error;
    }
  }



  /**
   * Get all analyses for a project
   */
  async getProjectAnalyses(projectId: string): Promise<StoredAnalysis[]> {
    try {
      return await this.storedAnalyses
        .where('projectId')
        .equals(projectId)
        .toArray();
    } catch (error) {
      console.error(`[DatabaseService] Failed to get analyses for ${projectId}:`, error);
      return [];
    }
  }

  /**
   * Clear expired analysis cache
   */
  async clearExpiredCache(): Promise<void> {
    try {
      const cacheExpiryHours = 24;
      const expiryTime = new Date(Date.now() - (cacheExpiryHours * 60 * 60 * 1000));
      
      const expiredEntries = await this.analysisCache
        .where('timestamp')
        .below(expiryTime)
        .toArray();
      
      if (expiredEntries.length > 0) {
        await this.analysisCache.bulkDelete(expiredEntries.map(entry => entry.id));
        console.log(`[DatabaseService] 🗑️ Cleared ${expiredEntries.length} expired cache entries`);
      }
    } catch (error) {
      console.error('[DatabaseService] Failed to clear expired cache:', error);
    }
  }

  // ============================================================================
  // META DATA OPERATIONS
  // ============================================================================

  /**
   * Store metadata
   */
  async storeMetaData(key: string, value: string): Promise<void> {
    try {
      await this.meta.put({
        key,
        value,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error(`[DatabaseService] Failed to store metadata for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get metadata
   */
  async getMetaData(key: string): Promise<string | undefined> {
    try {
      const meta = await this.meta.get(key);
      return meta?.value;
    } catch (error) {
      console.error(`[DatabaseService] Failed to get metadata for ${key}:`, error);
      return undefined;
    }
  }

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    projectViews: number;
    projectUpdates: number;
    analyzedUpdates: number;
    totalAnalyses: number;
    cacheEntries: number;
  }> {
    try {
      const [
        projectViews,
        projectUpdates,
        analyzedUpdates,
        totalAnalyses,
        cacheEntries
      ] = await Promise.all([
        this.countProjectViews(),
        this.countProjectUpdates(),
        this.countAnalyzedUpdates(),
        this.storedAnalyses.count(),
        this.analysisCache.count()
      ]);

      return {
        projectViews,
        projectUpdates,
        analyzedUpdates,
        totalAnalyses,
        cacheEntries
      };
    } catch (error) {
      console.error('[DatabaseService] Failed to get database stats:', error);
      return {
        projectViews: 0,
        projectUpdates: 0,
        analyzedUpdates: 0,
        totalAnalyses: 0,
        cacheEntries: 0
      };
    }
  }

  /**
   * Export all data for backup
   */
  async exportData(): Promise<any> {
    try {
      const [
        projectViews,
        projectUpdates,
        storedAnalyses,
        analysisCache,
        meta
      ] = await Promise.all([
        this.getProjectViews(),
        this.getProjectUpdates(),
        this.storedAnalyses.toArray(),
        this.analysisCache.toArray(),
        this.meta.toArray()
      ]);

      return {
        projectViews,
        projectUpdates,
        storedAnalyses,
        analysisCache,
        meta,
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('[DatabaseService] Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Import data from backup
   */
  async importData(data: any): Promise<void> {
    try {
      await this.transaction('rw', [
        this.projectViews,
        this.projectUpdates,
        this.storedAnalyses,
        this.analysisCache,
        this.meta
      ], async () => {
        // Clear existing data
        await Promise.all([
          this.projectViews.clear(),
          this.projectUpdates.clear(),
          this.storedAnalyses.clear(),
          this.analysisCache.clear(),
          this.meta.clear()
        ]);

        // Import data
        if (data.projectViews) {
          await this.projectViews.bulkAdd(data.projectViews);
        }
        if (data.projectUpdates) {
          await this.projectUpdates.bulkAdd(data.projectUpdates);
        }
        if (data.storedAnalyses) {
          await this.storedAnalyses.bulkAdd(data.storedAnalyses);
        }
        if (data.analysisCache) {
          await this.analysisCache.bulkAdd(data.analysisCache);
        }
        if (data.meta) {
          await this.meta.bulkAdd(data.meta);
        }
      });

      console.log('[DatabaseService] ✅ Data import completed successfully');
    } catch (error) {
      console.error('[DatabaseService] ❌ Failed to import data:', error);
      throw error;
    }
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        this.projectViews.clear(),
        this.projectUpdates.clear(),
        this.storedAnalyses.clear(),
        this.analysisCache.clear(),
        this.meta.clear()
      ]);
      
      console.log('[DatabaseService] ✅ All data cleared');
    } catch (error) {
      console.error('[DatabaseService] ❌ Failed to clear data:', error);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE & EXPORTS
// ============================================================================

export const databaseService = new DatabaseService();

// Convenience functions for backward compatibility
export const db = databaseService;
export const analysisDB = databaseService;

// Legacy function exports for backward compatibility
export const setVisibleProjectIds = (projectKeys: string[]) => databaseService.setVisibleProjectIds(projectKeys);
export const getVisibleProjectIds = () => databaseService.getVisibleProjectIds();
export const getTotalUpdatesAvailableCount = () => databaseService.getTotalUpdatesAvailableCount();
export const setTotalUpdatesAvailableCount = (count: number) => databaseService.setTotalUpdatesAvailableCount(count);
export const storeProjectView = (projectView: ProjectView) => databaseService.storeProjectView(projectView);
export const storeProjectUpdate = (update: ProjectUpdate) => databaseService.storeProjectUpdate(update);
export const getProjectImage = (projectKey: string) => databaseService.getProjectImage(projectKey);

// Initialize database
export async function initializeDatabase(): Promise<void> {
  try {
    await databaseService.open();
    console.log('[DatabaseService] ✅ Database initialized successfully');
    
    // Clear expired cache on startup
    await databaseService.clearExpiredCache();
    
    // Log database stats
    const stats = await databaseService.getDatabaseStats();
    console.log('[DatabaseService] 📊 Database stats:', stats);
    
  } catch (error) {
    console.error('[DatabaseService] ❌ Failed to initialize database:', error);
    throw error;
  }
}


