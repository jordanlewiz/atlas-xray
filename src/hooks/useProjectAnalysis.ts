import { useState, useEffect, useCallback } from 'react';
import { analysisDB, StoredAnalysis } from '../utils/analysisDatabase';
import { analyzeProjectUpdate, ProjectUpdateAnalysis } from '../services/AnalysisService';

interface UseProjectAnalysisReturn {
  // State
  analyses: StoredAnalysis[];
  currentAnalysis: StoredAnalysis | null;
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
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<StoredAnalysis | null>(null);
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

      console.log(`[useProjectAnalysis] Analyzing update ${updateId} for project ${projectId}`);

      // Check if analysis already exists
      const existing = await analysisDB.getAnalysis(projectId, updateId);
      if (existing) {
        console.log(`[useProjectAnalysis] Analysis already exists for update ${updateId}`);
        setCurrentAnalysis(existing);
        return;
      }

      // Perform analysis
      const analysis = await analyzeProjectUpdate(text);
      
      // Store in database
      const id = await analysisDB.storeAnalysis(projectId, updateId, text, analysis);
      
      // Create stored analysis object
      const storedAnalysis: StoredAnalysis = {
        id,
        projectId,
        updateId,
        originalText: text,
        analysis,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Update state
      setCurrentAnalysis(storedAnalysis);
      setAnalyses(prev => [storedAnalysis, ...prev]);

      console.log(`[useProjectAnalysis] Successfully analyzed and stored update ${updateId}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      console.error(`[useProjectAnalysis] Failed to analyze update ${updateId}:`, err);
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

      const analysis = await analysisDB.getAnalysis(projectId, updateId);
      setCurrentAnalysis(analysis || null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get analysis';
      console.error(`[useProjectAnalysis] Failed to get analysis for ${updateId}:`, err);
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

      const projectAnalyses = await analysisDB.getProjectAnalyses(projectId);
      setAnalyses(projectAnalyses);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get project analyses';
      console.error(`[useProjectAnalysis] Failed to get analyses for project ${projectId}:`, err);
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

      const projectSummaries = await analysisDB.getAllProjectSummaries();
      setSummaries(projectSummaries);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load summaries';
      console.error('[useProjectAnalysisSummaries] Failed to load summaries:', err);
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
      const expiredCount = await analysisDB.clearExpiredCache(maxAgeHours);
      setCacheStats(prev => ({
        ...prev,
        expiredEntries: expiredCount,
        lastCleared: new Date()
      }));
      return expiredCount;
    } catch (error) {
      console.error('[useAnalysisCache] Failed to clear expired cache:', error);
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
      console.error('[useAnalysisCache] Failed to get cache stats:', error);
    }
  }, []);

  return {
    cacheStats,
    clearExpiredCache,
    getCacheStats
  };
}
