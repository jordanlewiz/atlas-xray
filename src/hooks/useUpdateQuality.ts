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
  
  // Fetch quality data for updates (from both database and automatic analysis)
  const qualityData = useLiveQuery(
    async () => {
      if (!updates) return {};
      
      const qualityMap: UpdateQualityData = {};
      
      for (const update of updates) {
        // First check if quality data is stored in the update record
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
           // Check if quality data was stored by automatic analysis (background script)
           try {
             // First check IndexedDB
             const storedQuality = await db.table('keyval').get(`quality:${update.id}`);
             if (storedQuality) {
               qualityMap[update.id] = {
                 ...storedQuality,
                 timestamp: new Date(storedQuality.timestamp)
               };
             } else {
               // Then check chrome.storage.local (background script storage)
               if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                 const result = await chrome.storage.local.get(`quality:${update.id}`);
                 const backgroundQuality = result[`quality:${update.id}`];
                 if (backgroundQuality) {
                   qualityMap[update.id] = {
                     ...backgroundQuality,
                     timestamp: new Date(backgroundQuality.timestamp)
                   };
                 }
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
   * Trigger background analysis for existing updates without quality data
   */
  const triggerBackgroundAnalysisForExistingUpdates = useCallback(async (updates: ProjectUpdate[]) => {
    // Check which updates don't have quality data in the qualityData object
    const unanalyzedUpdates = updates.filter(update => !qualityData?.[update.id]);
    
    if (unanalyzedUpdates.length === 0) {
      console.log('🎯 All updates already have quality data');
      return;
    }
    
    // Limit batch size to prevent overwhelming the message system
    const maxBatchSize = 5;
    const batchToProcess = unanalyzedUpdates.slice(0, maxBatchSize);
    
    console.log(`🚀 Triggering background analysis for ${batchToProcess.length} unanalyzed updates (${unanalyzedUpdates.length} total remaining)...`);
    
    for (const update of batchToProcess) {
      try {
        // Extract update text
        const updateText = [
          update.summary || '',
          update.details || ''
        ].filter(Boolean).join(' ');
        
        if (!updateText.trim()) continue;
        
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
              console.log(`✅ Background analysis triggered for update ${update.id}`);
              // Force re-evaluation of quality data
              setUpdateTrigger(prev => prev + 1);
            } else {
              console.warn(`❌ Failed to trigger background analysis for update ${update.id}:`, response?.error);
            }
          });
        }
        
        // Longer delay between messages to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.warn(`⚠️ Failed to prepare update ${update.id} for background analysis:`, error);
      }
    }

    // If there are more updates to process, schedule the next batch
    if (unanalyzedUpdates.length > maxBatchSize) {
      const remainingUpdates = unanalyzedUpdates.slice(maxBatchSize);
      console.log(`⏰ Scheduling analysis for remaining ${remainingUpdates.length} updates in 10 seconds...`);
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
