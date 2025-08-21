import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../utils/database';
import { analyzeUpdateQuality } from '../utils/updateQualityAnalyzer';
import { preloadModels } from '../utils/localModelManager';
import type { UpdateQualityResult } from '../utils/updateQualityAnalyzer';
import type { ProjectUpdate } from '../types';

// Global state for forcing UI updates
let globalUpdateCounter = 0;
const updateListeners: (() => void)[] = [];

export interface UpdateQualityData {
  [updateId: string]: UpdateQualityResult;
}

export interface QualityMetrics {
  totalUpdates: number;
  analyzedUpdates: number;
  averageScore: number;
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

/**
 * Hook for managing update quality data and analysis
 */
export function useUpdateQuality() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [modelsPreloaded, setModelsPreloaded] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // Listen for global quality updates
  useEffect(() => {
    const listener = () => setUpdateTrigger(prev => prev + 1);
    updateListeners.push(listener);
    return () => {
      const index = updateListeners.indexOf(listener);
      if (index > -1) updateListeners.splice(index, 1);
    };
  }, []);
  
  // Preload models on hook initialization
  useEffect(() => {
    const initializeModels = async () => {
      try {
        console.log('🚀 Preloading AI models...');
        await preloadModels();
        setModelsPreloaded(true);
        console.log('✅ AI models preloaded successfully');
      } catch (error) {
        console.warn('⚠️ Model preloading failed:', error);
        // Don't block the UI if preloading fails
        setModelsPreloaded(false);
      }
    };
    
    initializeModels();
  }, []);
  
  // Fetch all project updates
  const updates = useLiveQuery(() => db.projectUpdates.toArray(), []);
  
  // Fetch quality data for updates
  const qualityData = useLiveQuery(
    async () => {
      if (!updates) return {};
      
      const qualityMap: UpdateQualityData = {};
      
      for (const update of updates) {
        if (update.updateQuality) {
          try {
            // Parse the stored quality data
            const parsed = JSON.parse(update.updateQuality);
            qualityMap[update.id] = {
              ...parsed,
              timestamp: new Date(parsed.timestamp)
            };
          } catch (error) {
            console.error(`Failed to parse quality data for update ${update.id}:`, error);
          }
        }
      }
      
      return qualityMap;
    },
    [updates, updateTrigger] // Include updateTrigger to force re-evaluation
  );

  /**
   * Analyze a single update and store the result
   */
  const analyzeUpdate = useCallback(async (update: ProjectUpdate): Promise<void> => {
    try {
      // Combine update text from summary and details
      const updateText = [
        update.summary || '',
        update.details || ''
      ].filter(Boolean).join(' ');
      
      if (!updateText.trim()) {
        console.warn(`Update ${update.id} has no text content to analyze`);
        return;
      }
      
      // Analyze the update quality
      const qualityResult = await analyzeUpdateQuality(
        updateText,
        update.state, // This could be enhanced to detect update type
        update.state
      );
      
      // Store the result in the database
      await db.projectUpdates.update(update.id, {
        updateQuality: JSON.stringify(qualityResult)
      });
      
      // Notify all listeners that quality data has been updated
      globalUpdateCounter++;
      updateListeners.forEach(listener => listener());
      
    } catch (error) {
      console.error(`Failed to analyze update ${update.id}:`, error);
    }
  }, []);

  /**
   * Analyze all unanalyzed updates
   */
  const analyzeAllUpdates = useCallback(async (): Promise<void> => {
    if (!updates || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      const unanalyzedUpdates = updates.filter(update => !update.updateQuality);
      
      if (unanalyzedUpdates.length === 0) {
        console.log('All updates already analyzed');
        return;
      }
      
      console.log(`Analyzing ${unanalyzedUpdates.length} updates...`);
      
      for (let i = 0; i < unanalyzedUpdates.length; i++) {
        const update = unanalyzedUpdates[i];
        await analyzeUpdate(update);
        
        // Update progress
        const progress = ((i + 1) / unanalyzedUpdates.length) * 100;
        setAnalysisProgress(progress);
        
        // Small delay to prevent overwhelming the AI model
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('Analysis complete!');
      
    } catch (error) {
      console.error('Failed to analyze updates:', error);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [updates, isAnalyzing, analyzeUpdate]);

  /**
   * Get quality metrics for all updates
   */
  const getQualityMetrics = useCallback((): QualityMetrics => {
    if (!qualityData || !updates) {
      return {
        totalUpdates: 0,
        analyzedUpdates: 0,
        averageScore: 0,
        qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
      };
    }
    
    const analyzedUpdates = Object.values(qualityData);
    const totalUpdates = updates.length;
    
    if (analyzedUpdates.length === 0) {
      return {
        totalUpdates,
        analyzedUpdates: 0,
        averageScore: 0,
        qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
      };
    }
    
    // Calculate average score
    const totalScore = analyzedUpdates.reduce((sum, result) => sum + result.overallScore, 0);
    const averageScore = totalScore / analyzedUpdates.length;
    
    // Calculate quality distribution
    const distribution = analyzedUpdates.reduce((acc, result) => {
      acc[result.qualityLevel]++;
      return acc;
    }, { excellent: 0, good: 0, fair: 0, poor: 0 });
    
    return {
      totalUpdates,
      analyzedUpdates: analyzedUpdates.length,
      averageScore,
      qualityDistribution: distribution
    };
  }, [qualityData, updates]);

  /**
   * Get quality data for a specific update
   */
  const getUpdateQuality = useCallback((updateId: string): UpdateQualityResult | null => {
    return qualityData?.[updateId] || null;
  }, [qualityData]);

  return {
    // Data
    updates,
    qualityData,
    
    // Actions
    analyzeUpdate,
    analyzeAllUpdates,
    
    // State
    isAnalyzing,
    analysisProgress,
    modelsPreloaded,
    updateTrigger,
    
    // Computed values
    getQualityMetrics,
    getUpdateQuality
  };
}
