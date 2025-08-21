import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../utils/database';
import { analyzeUpdateQuality } from '../utils/updateQualityAnalyzer';
import { preloadModels } from '../utils/localModelManager';
import type { UpdateQualityResult } from '../utils/updateQualityAnalyzer';
import type { ProjectUpdate } from '../types';

// Chrome extension types
declare const chrome: any;

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
        await preloadModels();
        setModelsPreloaded(true);
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
  
  // Sync existing quality data from chrome.storage.local to IndexedDB
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      syncAllQualityDataFromStorage();
    }
  }, []);

  // Trigger background analysis for updates without quality data
  useEffect(() => {
    if (updates && updates.length > 0) {
      // Prevent multiple simultaneous analysis triggers
      const timeoutId = setTimeout(() => {
        triggerBackgroundAnalysisForExistingUpdates(updates);
      }, 2000); // Wait 2 seconds before starting analysis
      
      return () => clearTimeout(timeoutId);
    }
  }, [updates]);
  
  // Fetch quality data for updates (from projectUpdates table first, then fallbacks)
  const qualityData = useLiveQuery(
    async () => {
      if (!updates) return {};
      
      const qualityMap: UpdateQualityData = {};
      
      for (const update of updates) {
        // First check if quality data is stored directly in the update record (IndexedDB)
        if (update.updateQuality) {
          try {
            const parsed = JSON.parse(update.updateQuality);
            qualityMap[update.id] = {
              ...parsed,
              timestamp: new Date(parsed.timestamp)
            };
          } catch (error) {
            console.error(`Failed to parse quality data for update ${update.id}:`, error);
          }
        } else {
          // Fallback: Check chrome.storage.local (background script storage)
          try {
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
              const result = await chrome.storage.local.get(`quality:${update.id}`);
              const backgroundQuality = result[`quality:${update.id}`];
              if (backgroundQuality) {
                qualityMap[update.id] = {
                  ...backgroundQuality,
                  timestamp: new Date(backgroundQuality.timestamp)
                };
                
                // Sync this quality data to IndexedDB for future use
                syncQualityDataToIndexedDB(update.id, backgroundQuality);
              }
            }
          } catch (error) {
            // Quality data not found, will be analyzed later
          }
        }
      }
      
      return qualityMap;
    },
    [updates, updateTrigger] // Include updateTrigger to force re-evaluation
  );

  /**
   * Sync all quality data from chrome.storage.local to IndexedDB
   */
  const syncAllQualityDataFromStorage = useCallback(async (): Promise<void> => {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
      
      const allData = await chrome.storage.local.get(null);
      const qualityKeys = Object.keys(allData).filter(key => key.startsWith('quality:'));
      
      if (qualityKeys.length === 0) return;
      
      for (const key of qualityKeys) {
        const updateId = key.replace('quality:', '');
        const qualityData = allData[key];
        
        if (qualityData && updateId) {
          await syncQualityDataToIndexedDB(updateId, qualityData);
        }
      }
      
    } catch (error) {
      console.error('[AtlasXray] Failed to sync quality data from storage:', error);
    }
  }, []);

  /**
   * Sync quality data from chrome.storage.local to IndexedDB
   */
  const syncQualityDataToIndexedDB = useCallback(async (updateId: string, qualityData: any): Promise<void> => {
    try {
      // Store the quality data in the projectUpdates table
      await db.projectUpdates.update(updateId, {
        updateQuality: JSON.stringify(qualityData)
      });
      
      // Remove from chrome.storage.local since it's now in IndexedDB
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.remove(`quality:${updateId}`);
      }
      
    } catch (error) {
      console.error(`Failed to sync quality data to IndexedDB for update ${updateId}:`, error);
    }
  }, []);

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
        return;
      }
      
      for (let i = 0; i < unanalyzedUpdates.length; i++) {
        const update = unanalyzedUpdates[i];
        await analyzeUpdate(update);
        
        // Update progress
        const progress = ((i + 1) / unanalyzedUpdates.length) * 100;
        setAnalysisProgress(progress);
        
        // Small delay to prevent overwhelming the AI model
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
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
   * Trigger background analysis for existing updates without quality data
   */
  const triggerBackgroundAnalysisForExistingUpdates = useCallback(async (updates: ProjectUpdate[]) => {
    // Check which updates don't have quality data in the qualityData object
    const unanalyzedUpdates = updates.filter(update => !qualityData?.[update.id]);
    
    if (unanalyzedUpdates.length === 0) {
      return;
    }
    
    // Limit batch size to prevent overwhelming the message system
    const maxBatchSize = 5;
    const batchToProcess = unanalyzedUpdates.slice(0, maxBatchSize);
    
    for (const update of batchToProcess) {
      try {
        // Extract update text
        const updateText = [
          update.summary || '',
          update.details || ''
        ].filter(Boolean).join(' ');
        
        if (!updateText.trim()) {
          continue;
        }
        
        // Determine update type and state
        const updateType = determineUpdateType(updateText);
        const state = update.state || 'no-status';
        
        // Send message to background script for analysis
        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
          chrome.runtime.sendMessage({
            type: 'ANALYZE_UPDATE_QUALITY',
            updateId: update.id,
            updateText,
            updateType,
            state
          }, (response: any) => {
            if (response?.success) {
              // Force re-evaluation of quality data
              setUpdateTrigger(prev => prev + 1);
            }
          });
        }
        
        // Longer delay between messages to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.warn(`Failed to prepare update ${update.id} for background analysis:`, error);
      }
    }

    // If there are more updates to process, schedule the next batch
    if (unanalyzedUpdates.length > maxBatchSize) {
      const remainingUpdates = unanalyzedUpdates.slice(maxBatchSize);
      setTimeout(() => {
        triggerBackgroundAnalysisForExistingUpdates(remainingUpdates);
      }, 10000);
    }
  }, [qualityData]);

  /**
   * Helper function to determine update type
   */
  const determineUpdateType = useCallback((updateText: string): string => {
    const text = updateText.toLowerCase();
    
    if (text.includes('paused') || text.includes('pause')) return 'paused';
    if (text.includes('off-track') || text.includes('off track')) return 'off-track';
    if (text.includes('at-risk') || text.includes('at risk')) return 'at-risk';
    if (text.includes('completed') || text.includes('complete')) return 'completed';
    if (text.includes('cancelled') || text.includes('cancel')) return 'cancelled';
    if (text.includes('new initiative') || text.includes('prioritised')) return 'prioritization';
    
    return 'general';
  }, []);

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
