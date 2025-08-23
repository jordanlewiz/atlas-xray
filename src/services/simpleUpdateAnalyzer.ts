import { analyzeUpdateQuality } from '../utils/localModelManager';
import { db } from '../utils/database';

/**
 * Simple Update Analyzer - Just analyzes updates, nothing else
 */
export class SimpleUpdateAnalyzer {
  private static instance: SimpleUpdateAnalyzer;

  static getInstance(): SimpleUpdateAnalyzer {
    if (!SimpleUpdateAnalyzer.instance) {
      SimpleUpdateAnalyzer.instance = new SimpleUpdateAnalyzer();
    }
    return SimpleUpdateAnalyzer.instance;
  }

  /**
   * Analyze a single update and store the results
   */
  async analyzeUpdate(update: any): Promise<void> {
    try {
      if (!update.summary || !update.summary.trim()) {
        console.log(`[SimpleUpdateAnalyzer] ⏭️ Skipping analysis for ${update.projectKey}: no summary`);
        return;
      }

      console.log(`[SimpleUpdateAnalyzer] 🧠 Analyzing update for ${update.projectKey}...`);
      
      // Run the analysis
      const analysisResult = await analyzeUpdateQuality(update.summary);
      
      // Update the stored update with analysis results
                        const analyzedUpdate = {
                    ...update,
                    updateQuality: analysisResult.score,
                    qualityLevel: analysisResult.quality,
                    qualitySummary: analysisResult.summary,
                    qualityMissingInfo: analysisResult.missingInfo || [],
                    qualityRecommendations: analysisResult.recommendations || [],
                    analysisDate: new Date().toISOString()
                  };

      // Store the updated record
      await db.projectUpdates.put(analyzedUpdate);
      
      console.log(`[SimpleUpdateAnalyzer] ✅ Analyzed update for ${update.projectKey}: ${analysisResult.score}/100 (${analysisResult.quality})`);
      
    } catch (error) {
      console.error(`[SimpleUpdateAnalyzer] ❌ Analysis failed for ${update.projectKey}:`, error);
      
      // Mark as analyzed but with error
      const errorUpdate = {
        ...update,
        updateQuality: 0,
        qualityLevel: 'poor' as const,
        qualitySummary: 'Analysis failed',
        analyzed: true,
        analysisDate: new Date().toISOString()
      };
      
      try {
        await db.projectUpdates.put(errorUpdate);
        console.log(`[SimpleUpdateAnalyzer] ✅ Error update stored for ${update.projectKey}`);
      } catch (dbError) {
        console.error(`[SimpleUpdateAnalyzer] ❌ Failed to store error update for ${update.projectKey}:`, dbError);
      }
    }
  }

  /**
   * Analyze multiple updates in sequence
   */
  async analyzeUpdates(updates: any[]): Promise<void> {
    console.log(`[SimpleUpdateAnalyzer] 🚀 Starting analysis of ${updates.length} updates...`);
    
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      console.log(`[SimpleUpdateAnalyzer] 📊 Analyzing update ${i + 1}/${updates.length} for ${update.projectKey}`);
      await this.analyzeUpdate(update);
      
      // Small delay between analyses to be respectful
      if (i < updates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`[SimpleUpdateAnalyzer] ✅ Completed analysis of ${updates.length} updates`);
  }
}

export const simpleUpdateAnalyzer = SimpleUpdateAnalyzer.getInstance();
