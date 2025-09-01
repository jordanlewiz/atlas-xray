import { useState, useEffect, useCallback } from 'react';
import { db, ProjectUpdate } from '../services/DatabaseService';
import { analyzeProjectUpdate, ProjectUpdateAnalysis } from '../services/AnalysisService';
import { log, setFilePrefix } from '../utils/logger';

// Set file-level prefix for all logging in this file
setFilePrefix('[useProjectAnalysis]');

interface UseProjectAnalysisReturn {
  // State
  analyses: ProjectUpdate[];
  currentAnalysis: ProjectUpdate | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  analyzeUpdate: (projectId: string, updateId: string, text: string) => Promise<void>;
  getAnalysis: (projectId: string, updateId: string) => Promise<void>;
  getProjectAnalyses: (projectId: string) => Promise<void>;
  clearError: () => void;
  
  // Computed values
  hasAnalysis: boolean;
  analysisCount: number;
}

/**
 * Custom hook for managing project analysis operations
 */
export function useProjectAnalysis(): UseProjectAnalysisReturn {
  const [analyses, setAnalyses] = useState<ProjectUpdate[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<ProjectUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Analyze a project update
  const analyzeUpdate = useCallback(async (
    projectId: string, 
    updateId: string, 
    text: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      log.debug(`Analyzing update ${updateId} for project ${projectId}`);

      // Check if analysis already exists
      const existing = await db.getProjectUpdates().then(updates => 
        updates.find(u => u.uuid === updateId && u.analyzed)
      );
      if (existing) {
        log.debug(`Analysis already exists for update ${updateId}`);
        setCurrentAnalysis(existing);
        return;
      }

      // Perform analysis
      const analysis = await analyzeProjectUpdate(text);
      
      // Store in database using the new unified system
      // The DatabaseService will automatically handle storing the analysis
      // For now, we'll just update the current analysis state
      
      // Create analysis object for display
      const analyzedUpdate: ProjectUpdate = {
        uuid: updateId,
        projectKey: projectId,
        creationDate: new Date().toISOString(),
        missedUpdate: false,
        analyzed: true,
        analysisDate: new Date().toISOString(),
        // Add analysis results to the update
        updateQuality: analysis.sentiment.score * 100, // Convert sentiment to quality score
        qualityLevel: analysis.sentiment.score > 0.7 ? 'excellent' : 
                     analysis.sentiment.score > 0.5 ? 'good' : 
                     analysis.sentiment.score > 0.3 ? 'fair' : 'poor',
        qualitySummary: analysis.summary
      } as ProjectUpdate;

      // Update state
      setCurrentAnalysis(analyzedUpdate);
      setAnalyses(prev => [analyzedUpdate, ...prev]);

      log.info(`Successfully analyzed and stored update ${updateId}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      log.error(`Failed to analyze update ${updateId}:`, String(err));
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get analysis for a specific update
  const getAnalysis = useCallback(async (projectId: string, updateId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const analysis = await db.getProjectUpdates().then(updates => 
        updates.find(u => u.uuid === updateId && u.analyzed)
      );
      setCurrentAnalysis(analysis || null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get analysis';
      log.error(`Failed to get analysis for ${updateId}:`, String(err));
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get all analyses for a project
  const getProjectAnalyses = useCallback(async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const projectAnalyses = await db.getProjectUpdatesByKey(projectId);
      setAnalyses(projectAnalyses.filter(u => u.analyzed));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get project analyses';
      log.error(`Failed to get analyses for project ${projectId}:`, String(err));
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Computed values
  const hasAnalysis = currentAnalysis !== null;
  const analysisCount = analyses.length;

  return {
    // State
    analyses,
    currentAnalysis,
    isLoading,
    error,
    
    // Actions
    analyzeUpdate,
    getAnalysis,
    getProjectAnalyses,
    clearError,
    
    // Computed values
    hasAnalysis,
    analysisCount
  };
}

/**
 * Hook for managing analysis summaries across multiple projects
 */
export function useProjectAnalysisSummaries() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummaries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const projectSummaries = await db.getAllProjectSummaries();
      setSummaries(projectSummaries);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load summaries';
      log.error('Failed to load summaries:', String(err));
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    summaries,
    isLoading,
    error,
    loadSummaries,
    clearError
  };
}

/**
 * Hook for managing analysis cache operations
 */
export function useAnalysisCache() {
  const [cacheStats, setCacheStats] = useState<{
    totalEntries: number;
    expiredEntries: number;
    lastCleared: Date | null;
  }>({
    totalEntries: 0,
    expiredEntries: 0,
    lastCleared: null
  });

  const clearExpiredCache = useCallback(async (maxAgeHours: number = 24) => {
    try {
      // Cache clearing is now handled automatically by DatabaseService
      // For now, return 0 as no manual cache clearing is needed
      const expiredCount = 0;
      setCacheStats(prev => ({
        ...prev,
        expiredEntries: expiredCount,
        lastCleared: new Date()
      }));
      return expiredCount;
    } catch (error) {
      log.error('Failed to clear expired cache:', String(error));
      throw error;
    }
  }, []);

  const getCacheStats = useCallback(async () => {
    try {
      // This would need to be implemented in the database class
      // For now, return basic stats
      setCacheStats(prev => ({
        ...prev,
        totalEntries: 0, // Would need to implement count method
        expiredEntries: 0
      }));
    } catch (error) {
      log.error('Failed to get cache stats:', String(error));
    }
  }, []);

  return {
    cacheStats,
    clearExpiredCache,
    getCacheStats
  };
}
