/**
 * Integration Example: How to connect Project Analysis with existing systems
 * 
 * This file shows examples of how to integrate the AI analysis system
 * with your existing project update workflow.
 */

import { analyzeProjectUpdate } from '../services/AnalysisService';
import { analysisDB } from './analysisDatabase';
import { useProjectAnalysis } from '../hooks/useProjectAnalysis';

// Example 1: Basic integration with existing project updates
export async function analyzeExistingProjectUpdate(
  projectId: string,
  updateId: string,
  updateText: string
) {
  try {
    console.log(`[Integration] Analyzing existing update: ${updateId}`);
    
    // Check if analysis already exists
    const existingAnalysis = await analysisDB.getAnalysis(projectId, updateId);
    if (existingAnalysis) {
      console.log(`[Integration] Analysis already exists for ${updateId}`);
      return existingAnalysis;
    }
    
    // Perform AI analysis
    const analysis = await analyzeProjectUpdate(updateText);
    
    // Store results
    const id = await analysisDB.storeAnalysis(projectId, updateId, updateText, analysis);
    
    console.log(`[Integration] Successfully analyzed and stored update ${updateId}`);
    
    return {
      id,
      projectId,
      updateId,
      originalText: updateText,
      analysis,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
  } catch (error) {
    console.error(`[Integration] Failed to analyze update ${updateId}:`, error);
    throw error;
  }
}

// Example 2: React component integration
export function ProjectUpdateWithAnalysis({ 
  projectId, 
  updateId, 
  updateText, 
  onAnalysisComplete 
}: {
  projectId: string;
  updateId: string;
  updateText: string;
  onAnalysisComplete?: (analysis: any) => void;
}) {
  const { 
    analyzeUpdate, 
    currentAnalysis, 
    isLoading, 
    error 
  } = useProjectAnalysis();
  
  const handleAnalyze = async () => {
    try {
      await analyzeUpdate(projectId, updateId, updateText);
      if (onAnalysisComplete && currentAnalysis) {
        onAnalysisComplete(currentAnalysis);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };
  
  return (
    <div className="project-update-with-analysis">
      {/* Your existing project update display */}
      <div className="update-content">
        <h3>Project Update</h3>
        <p>{updateText}</p>
      </div>
      
      {/* Analysis section */}
      <div className="analysis-section">
        <h4>AI Analysis</h4>
        
        {error && (
          <div className="error">
            Analysis failed: {error}
          </div>
        )}
        
        {currentAnalysis ? (
          <div className="analysis-results">
            <div className="sentiment">
              Sentiment: {currentAnalysis.analysis.sentiment.label} 
              ({Math.round(currentAnalysis.analysis.sentiment.score * 100)}%)
            </div>
            <div className="summary">
              Summary: {currentAnalysis.analysis.summary}
            </div>
            <div className="coverage">
              Coverage: {currentAnalysis.analysis.analysis.filter(r => r.confidence >= 0.25).length} / {currentAnalysis.analysis.analysis.length} questions answered
            </div>
          </div>
        ) : (
          <button 
            onClick={handleAnalyze} 
            disabled={isLoading}
            className="analyze-button"
          >
            {isLoading ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        )}
      </div>
    </div>
  );
}

// Example 3: Background processing integration
export async function setupBackgroundAnalysis() {
  try {
    // Initialize the analysis database
    await analysisDB.open();
    
    // Set up periodic checking for new updates
    // This would integrate with your existing update monitoring system
    setInterval(async () => {
      try {
        // Get new updates from your existing system
        const newUpdates = await getNewUpdatesFromYourSystem();
        
        for (const update of newUpdates) {
          // Check if analysis is needed
          const hasAnalysis = await analysisDB.getAnalysis(
            update.projectId, 
            update.updateId
          );
          
          if (!hasAnalysis) {
            // Trigger analysis
            await analyzeExistingProjectUpdate(
              update.projectId,
              update.updateId,
              update.text
            );
          }
        }
      } catch (error) {
        console.error('[Background Analysis] Failed to process updates:', error);
      }
    }, 30000); // Check every 30 seconds
    
    console.log('[Integration] Background analysis setup complete');
    
  } catch (error) {
    console.error('[Integration] Failed to setup background analysis:', error);
  }
}

// Example 4: Batch analysis for multiple updates
export async function analyzeMultipleUpdates(updates: Array<{
  projectId: string;
  updateId: string;
  text: string;
}>) {
  const results = [];
  
  for (const update of updates) {
    try {
      const result = await analyzeExistingProjectUpdate(
        update.projectId,
        update.updateId,
        update.text
      );
      results.push({ ...update, analysis: result });
    } catch (error) {
      console.error(`[Batch Analysis] Failed to analyze ${update.updateId}:`, error);
      results.push({ ...update, error: error.message });
    }
  }
  
  return results;
}

// Example 5: Integration with your existing database schema
export async function integrateWithExistingDatabase() {
  // This function shows how to adapt the analysis system to work with
  // your existing database structure
  
  // Example: If you have a different table structure
  // const yourExistingTable = yourExistingDB.table('projectUpdates');
  
  // You would need to:
  // 1. Map your existing fields to the expected format
  // 2. Update the getNewUpdatesFromDexie function in projectUpdateWatcher.js
  // 3. Ensure your existing update triggers call the analysis system
  
  console.log('[Integration] Database integration setup complete');
}

// Example 6: Export analysis results for reporting
export async function exportAnalysisForReporting(projectId: string, dateRange?: { start: Date; end: Date }) {
  try {
    const analyses = await analysisDB.getProjectAnalyses(projectId);
    
    // Filter by date range if provided
    const filteredAnalyses = dateRange 
      ? analyses.filter(a => a.createdAt >= dateRange.start && a.createdAt <= dateRange.end)
      : analyses;
    
    // Transform for reporting
    const reportData = filteredAnalyses.map(analysis => ({
      updateId: analysis.updateId,
      date: analysis.createdAt,
      sentiment: analysis.analysis.sentiment,
      summary: analysis.analysis.summary,
      coverage: analysis.analysis.analysis.filter(r => r.confidence >= 0.25).length / analysis.analysis.analysis.length,
      keyFindings: analysis.analysis.analysis
        .filter(r => r.confidence >= 0.7)
        .map(r => ({ question: r.question, answer: r.answer }))
    }));
    
    return reportData;
    
  } catch (error) {
    console.error('[Integration] Failed to export analysis for reporting:', error);
    throw error;
  }
}

// Example 7: Real-time analysis status
export function useAnalysisStatus(projectId: string) {
  const [status, setStatus] = useState<{
    totalUpdates: number;
    analyzedUpdates: number;
    pendingUpdates: number;
    lastAnalysis: Date | null;
  }>({
    totalUpdates: 0,
    analyzedUpdates: 0,
    pendingUpdates: 0,
    lastAnalysis: null
  });
  
  useEffect(() => {
    const updateStatus = async () => {
      try {
        const analyses = await analysisDB.getProjectAnalyses(projectId);
        const totalUpdates = await getTotalUpdatesFromYourSystem(projectId);
        
        setStatus({
          totalUpdates,
          analyzedUpdates: analyses.length,
          pendingUpdates: totalUpdates - analyses.length,
          lastAnalysis: analyses.length > 0 ? analyses[0].createdAt : null
        });
      } catch (error) {
        console.error('[Status] Failed to update status:', error);
      }
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [projectId]);
  
  return status;
}

// Helper function - implement based on your system
async function getNewUpdatesFromYourSystem() {
  // This would integrate with your existing update system
  // Return updates that need analysis
  return [];
}

// Helper function - implement based on your system
async function getTotalUpdatesFromYourSystem(projectId: string) {
  // This would get the total count from your existing system
  return 0;
}
