import Dexie, { Table } from 'dexie';
import { ProjectUpdateAnalysis, AnalysisResult, exportAnalysis } from '../services/AnalysisService';

export interface StoredAnalysis {
  id?: number;
  projectId: string;
  updateId: string;
  originalText: string;
  analysis: ProjectUpdateAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisSummary {
  projectId: string;
  totalUpdates: number;
  averageSentiment: number;
  coveragePercentage: number;
  lastAnalysis: Date;
}

class AnalysisDatabase extends Dexie {
  // Define tables
  projectUpdates!: Table<StoredAnalysis>;
  analysisCache!: Table<{ id: string; analysis: any; timestamp: Date }>;

  constructor() {
    super('ProjectAnalysisDB');
    
    this.version(1).stores({
      projectUpdates: '++id, projectId, updateId, createdAt',
      analysisCache: 'id, timestamp'
    });
  }

  /**
   * Store analysis results for a project update
   */
  async storeAnalysis(
    projectId: string, 
    updateId: string, 
    originalText: string, 
    analysis: ProjectUpdateAnalysis
  ): Promise<number> {
    try {
      const storedAnalysis: Omit<StoredAnalysis, 'id'> = {
        projectId,
        updateId,
        originalText,
        analysis,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const id = await this.projectUpdates.add(storedAnalysis);
      console.log(`[AnalysisDB] Stored analysis for project ${projectId}, update ${updateId}`);
      return id as number;
    } catch (error) {
      console.error('[AnalysisDB] Failed to store analysis:', error);
      throw error;
    }
  }

  /**
   * Get analysis for a specific project update
   */
  async getAnalysis(projectId: string, updateId: string): Promise<StoredAnalysis | undefined> {
    try {
      return await this.projectUpdates
        .where(['projectId', 'updateId'])
        .equals([projectId, updateId])
        .first();
    } catch (error) {
      console.error('[AnalysisDB] Failed to get analysis:', error);
      return undefined;
    }
  }

  /**
   * Get all analyses for a project
   */
  async getProjectAnalyses(projectId: string): Promise<StoredAnalysis[]> {
    try {
      return await this.projectUpdates
        .where('projectId')
        .equals(projectId)
        .reverse()
        .sortBy('createdAt');
    } catch (error) {
      console.error('[AnalysisDB] Failed to get project analyses:', error);
      return [];
    }
  }

  /**
   * Get recent analyses across all projects
   */
  async getRecentAnalyses(limit: number = 10): Promise<StoredAnalysis[]> {
    try {
      return await this.projectUpdates
        .orderBy('createdAt')
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('[AnalysisDB] Failed to get recent analyses:', error);
      return [];
    }
  }

  /**
   * Update existing analysis
   */
  async updateAnalysis(
    projectId: string, 
    updateId: string, 
    analysis: ProjectUpdateAnalysis
  ): Promise<boolean> {
    try {
      const existing = await this.getAnalysis(projectId, updateId);
      if (!existing) {
        return false;
      }

      await this.projectUpdates
        .where(['projectId', 'updateId'])
        .equals([projectId, updateId])
        .modify({
          analysis,
          updatedAt: new Date()
        });

      console.log(`[AnalysisDB] Updated analysis for project ${projectId}, update ${updateId}`);
      return true;
    } catch (error) {
      console.error('[AnalysisDB] Failed to update analysis:', error);
      return false;
    }
  }

  /**
   * Delete analysis for a project update
   */
  async deleteAnalysis(projectId: string, updateId: string): Promise<boolean> {
    try {
      const deleted = await this.projectUpdates
        .where(['projectId', 'updateId'])
        .equals([projectId, updateId])
        .delete();

      console.log(`[AnalysisDB] Deleted analysis for project ${projectId}, update ${updateId}`);
      return deleted > 0;
    } catch (error) {
      console.error('[AnalysisDB] Failed to delete analysis:', error);
      return false;
    }
  }

  /**
   * Get analysis summary for a project
   */
  async getProjectSummary(projectId: string): Promise<AnalysisSummary | null> {
    try {
      const analyses = await this.getProjectAnalyses(projectId);
      
      if (analyses.length === 0) {
        return null;
      }

      const totalUpdates = analyses.length;
      const averageSentiment = analyses.reduce((sum, a) => sum + a.analysis.sentiment.score, 0) / totalUpdates;
      
      // Calculate average coverage
      const totalCoverage = analyses.reduce((sum, a) => {
        const clearlyStated = a.analysis.analysis.filter(result => result.confidence >= 0.25);
        return sum + (clearlyStated.length / a.analysis.analysis.length);
      }, 0);
      const coveragePercentage = (totalCoverage / totalUpdates) * 100;

      const lastAnalysis = analyses[0].createdAt;

      return {
        projectId,
        totalUpdates,
        averageSentiment,
        coveragePercentage,
        lastAnalysis
      };
    } catch (error) {
      console.error('[AnalysisDB] Failed to get project summary:', error);
      return null;
    }
  }

  /**
   * Get all project summaries
   */
  async getAllProjectSummaries(): Promise<AnalysisSummary[]> {
    try {
      const analyses = await this.projectUpdates.toArray();
      const projectIds = [...new Set(analyses.map(a => a.projectId))];
      
      const summaries = await Promise.all(
        projectIds.map(id => this.getProjectSummary(id))
      );

      return summaries.filter((s): s is AnalysisSummary => s !== null);
    } catch (error) {
      console.error('[AnalysisDB] Failed to get all project summaries:', error);
      return [];
    }
  }

  /**
   * Cache analysis results to avoid re-computation
   */
  async cacheAnalysis(textHash: string, analysis: any): Promise<void> {
    try {
      await this.analysisCache.put({
        id: textHash,
        analysis,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[AnalysisDB] Failed to cache analysis:', error);
    }
  }

  /**
   * Get cached analysis if available and not expired
   */
  async getCachedAnalysis(textHash: string, maxAgeHours: number = 24): Promise<any | null> {
    try {
      const cached = await this.analysisCache.get(textHash);
      if (!cached) return null;

      const ageHours = (Date.now() - cached.timestamp.getTime()) / (1000 * 60 * 60);
      if (ageHours > maxAgeHours) {
        // Remove expired cache
        await this.analysisCache.delete(textHash);
        return null;
      }

      return cached.analysis;
    } catch (error) {
      console.error('[AnalysisDB] Failed to get cached analysis:', error);
      return null;
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(maxAgeHours: number = 24): Promise<number> {
    try {
      const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
      const expired = await this.analysisCache
        .where('timestamp')
        .below(cutoff)
        .delete();

      console.log(`[AnalysisDB] Cleared ${expired} expired cache entries`);
      return expired;
    } catch (error) {
      console.error('[AnalysisDB] Failed to clear expired cache:', error);
      return 0;
    }
  }

  /**
   * Export all data for backup
   */
  async exportData(): Promise<any> {
    try {
      const analyses = await this.projectUpdates.toArray();
      const cache = await this.analysisCache.toArray();
      
      return {
        analyses: analyses.map(a => ({
          ...a,
          analysis: exportAnalysis(a.analysis)
        })),
        cache,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[AnalysisDB] Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Import data from backup
   */
  async importData(data: any): Promise<void> {
    try {
      await this.transaction('rw', [this.projectUpdates, this.analysisCache], async () => {
        // Clear existing data
        await this.projectUpdates.clear();
        await this.analysisCache.clear();

        // Import analyses
        for (const analysis of data.analyses || []) {
          await this.projectUpdates.add({
            ...analysis,
            createdAt: new Date(analysis.createdAt),
            updatedAt: new Date(analysis.updatedAt)
          });
        }

        // Import cache
        for (const cacheEntry of data.cache || []) {
          await this.analysisCache.add({
            ...cacheEntry,
            timestamp: new Date(cacheEntry.timestamp)
          });
        }
      });

      console.log('[AnalysisDB] Data import completed successfully');
    } catch (error) {
      console.error('[AnalysisDB] Failed to import data:', error);
      throw error;
    }
  }
}

// Create and export database instance
export const analysisDB = new AnalysisDatabase();

// Initialize database
export async function initializeAnalysisDatabase(): Promise<void> {
  try {
    await analysisDB.open();
    console.log('[AnalysisDB] Database initialized successfully');
    
    // Clear expired cache on startup
    await analysisDB.clearExpiredCache();
  } catch (error) {
    console.error('[AnalysisDB] Failed to initialize database:', error);
    throw error;
  }
}
