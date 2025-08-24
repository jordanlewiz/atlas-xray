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

// REMOVED: StoredAnalysis interface - forbidden by architecture

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
  // Core tables - SIMPLIFIED
  projectViews!: Table<ProjectView>;
  projectUpdates!: Table<ProjectUpdate>;
  meta!: Table<MetaData>;
  
  // Visible projects tracking
  visibleProjects!: Table<{ id: string; projectKey: string; timestamp: Date }>;

  constructor() {
    // Use extension-specific database name to ensure consistency across contexts
    const dbName = typeof chrome !== 'undefined' && chrome.runtime ? 
      `AtlasXrayDB_${chrome.runtime.id}` : 
      'AtlasXrayDB';
    super(dbName);
    
    this.version(1).stores({
      // Core tables
      projectViews: 'projectKey',
      projectUpdates: 'uuid, projectKey, creationDate, updateQuality, analyzed',
      meta: 'key',
      
      // Visible projects tracking
      visibleProjects: 'id, projectKey, timestamp',
      
      // NO ANALYSIS TABLES - Keep it simple!
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
        .filter(update => !update.analyzed && update.summary && update.summary.trim().length > 0)
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
   * Force analysis of all unanalyzed updates
   */
  async analyzeAllUnanalyzedUpdates(): Promise<void> {
    try {
      const unanalyzedUpdates = await this.getUnanalyzedUpdates();
      console.log(`[DatabaseService] 🔍 Found ${unanalyzedUpdates.length} unanalyzed updates`);
      
      if (unanalyzedUpdates.length === 0) {
        console.log('[DatabaseService] ✅ All updates are already analyzed');
        return;
      }

      console.log('[DatabaseService] 🚀 Starting batch analysis of unanalyzed updates...');
      
      // Process updates in smaller batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < unanalyzedUpdates.length; i += batchSize) {
        const batch = unanalyzedUpdates.slice(i, i + batchSize);
        console.log(`[DatabaseService] 📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(unanalyzedUpdates.length/batchSize)} (${batch.length} updates)`);
        
        // Process batch concurrently
        await Promise.all(batch.map(update => this.analyzeUpdate(update)));
        
        // Small delay between batches to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`[DatabaseService] ✅ Completed analysis of ${unanalyzedUpdates.length} updates`);
    } catch (error) {
      console.error('[DatabaseService] ❌ Failed to analyze unanalyzed updates:', error);
    }
  }

  // REMOVED: getAnalysis method - forbidden by architecture
  // Analysis data is stored directly in ProjectUpdate records

  /**
   * Update a project update with quality analysis results
   * This is critical for the UI to display quality indicators
   */
  async updateProjectUpdateQuality(updateUuid: string, qualityResult: any): Promise<void> {
    try {
      const update = await this.projectUpdates.where('uuid').equals(updateUuid).first();
      if (!update) {
        console.error(`[DatabaseService] Update ${updateUuid} not found for quality update`);
        return;
      }

      const updatedUpdate: ProjectUpdate = {
        ...update,
        updateQuality: qualityResult.overallScore,
        qualityLevel: qualityResult.qualityLevel,
        qualitySummary: qualityResult.summary,
        qualityMissingInfo: qualityResult.missingInfo || [],
        qualityRecommendations: qualityResult.recommendations || [],
        analyzed: true,
        analysisDate: new Date().toISOString()
      };

      await this.projectUpdates.put(updatedUpdate);
      console.log(`[DatabaseService] ✅ Updated update ${updateUuid} with quality score: ${qualityResult.overallScore}%`);
    } catch (error) {
      console.error(`[DatabaseService] Failed to update quality for update ${updateUuid}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYSIS OPERATIONS
  // ============================================================================

  /**
   * Analyze a project update and store results
   * Note: AI analysis is deferred to background script due to content script limitations
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

      // Check if we're in a content script context
      // Content scripts run on web pages (http/https), background scripts run in extension context
      const isContentScript = typeof window !== 'undefined' && (
        window.location.href.includes('http://') || 
        window.location.href.includes('https://') 
      ) && !window.location.href.includes('chrome-extension://') && !window.location.href.includes('moz-extension://');

      if (isContentScript) {
        console.log(`[DatabaseService] 🔍 Analyzing update ${update.uuid} directly in content script (AI libraries bundled)`);
        
        // Perform AI analysis directly in content script since libraries are bundled
        try {
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
          
          // Store the updated record - SIMPLE!
          await this.projectUpdates.put(analyzedUpdate);
          
          console.log(`[DatabaseService] ✅ Analysis complete for update ${update.uuid} - Quality: ${analysisResult.overallScore}%`);
          
        } catch (error) {
          console.error(`[DatabaseService] ❌ AI Analysis failed for update ${update.uuid}:`, error);
          
          // Mark as analyzed but with error
          const errorUpdate: ProjectUpdate = {
            ...update,
            updateQuality: 0,
            qualityLevel: 'poor',
            qualitySummary: 'AI Analysis failed',
            analyzed: true,
            analysisDate: new Date().toISOString()
          };
          
          try {
            await this.projectUpdates.put(errorUpdate);
          } catch (dbError) {
            console.error(`[DatabaseService] ❌ Failed to store error update for ${update.uuid}:`, dbError);
          }
        }
        
        return;
      }

      console.log(`[DatabaseService] 🔍 Analyzing update ${update.uuid} for ${update.projectKey}`);
      
      // Perform analysis using the unified AnalysisService (only in background script)
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

      // Store the updated record - SIMPLE!
      await this.projectUpdates.put(analyzedUpdate);
      
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

  // REMOVED: All forbidden analysis table methods
  // Analysis results are stored directly in ProjectUpdate records

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
  }> {
    try {
      const [
        projectViews,
        projectUpdates,
        analyzedUpdates
      ] = await Promise.all([
        this.countProjectViews(),
        this.countProjectUpdates(),
        this.countAnalyzedUpdates()
      ]);

      return {
        projectViews,
        projectUpdates,
        analyzedUpdates
      };
    } catch (error) {
      console.error('[DatabaseService] Failed to get database stats:', error);
      return {
        projectViews: 0,
        projectUpdates: 0,
        analyzedUpdates: 0
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
        meta
      ] = await Promise.all([
        this.getProjectViews(),
        this.getProjectUpdates(),
        this.meta.toArray()
      ]);

      return {
        projectViews,
        projectUpdates,
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
        this.meta
      ], async () => {
        // Clear existing data
        await Promise.all([
          this.projectViews.clear(),
          this.projectUpdates.clear(),
          this.meta.clear()
        ]);

        // Import data
        if (data.projectViews) {
          await this.projectViews.bulkAdd(data.projectViews);
        }
        if (data.projectUpdates) {
          await this.projectUpdates.bulkAdd(data.projectUpdates);
        }
        // REMOVED: Forbidden analysis table imports
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
export const analyzeAllUnanalyzedUpdates = () => databaseService.analyzeAllUnanalyzedUpdates();

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
    
    // NO CACHE TO CLEAR - Keep it simple!
    
    // Log database stats
    const stats = await databaseService.getDatabaseStats();
    console.log('[DatabaseService] 📊 Database stats:', stats);
    
    // Analyze any unanalyzed updates in the background
    setTimeout(async () => {
      try {
        console.log('[DatabaseService] 🔍 Starting background analysis of unanalyzed updates...');
        await databaseService.analyzeAllUnanalyzedUpdates();
      } catch (error) {
        console.error('[DatabaseService] ❌ Background analysis failed:', error);
      }
    }, 2000); // 2 second delay to let other initialization complete
    
  } catch (error) {
    console.error('[DatabaseService] ❌ Failed to initialize database:', error);
    throw error;
  }
}


