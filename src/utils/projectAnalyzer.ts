// @ts-ignore
import { pipeline } from '@xenova/transformers';

// Performance optimizations
const MAX_TEXT_LENGTH = 1500; // Limit text length for analysis
const MODEL_TIMEOUT = 15000; // 15 second timeout for model operations
const MAX_CONCURRENT_MODELS = 2; // Limit concurrent model operations

// Fixed criteria IDs and questions
export const QUESTIONS = [
  { id: "initiative",        q: "Which initiative or milestone is discussed?" },
  { id: "date_change",       q: "Did the date change? If yes, what is the new date?" },
  { id: "reason",            q: "What is the reason for the date change?" },
  { id: "impact_scope",      q: "What is the impact on scope?" },
  { id: "impact_time",      q: "What is the impact on timeline or schedule?" },
  { id: "impact_cost",       q: "What is the impact on cost or budget?" },
  { id: "impact_risk",       q: "What is the impact on risk or quality?" },
  { id: "decision_making",   q: "How was this decision made? Who decided and what inputs were used?" },
  { id: "dependencies",      q: "What dependencies are affected?" },
  { id: "stakeholders",      q: "Which stakeholders were informed or need to be informed?" },
  { id: "support_needed",    q: "Is any support needed? What is the specific ask and by whom?" },
  { id: "mitigation_plan",   q: "What mitigation or recovery actions are proposed?" },
  { id: "next_steps",        q: "What are the next steps and who owns them?" },
  { id: "risks",             q: "What new or heightened risks are mentioned?" },
  { id: "confidence_evidence", q: "What confidence, evidence, or data is cited to support this update?" }
] as const;

export type QuestionId = typeof QUESTIONS[number]['id'];

export interface AnalysisResult {
  id: QuestionId;
  question: string;
  answer: string;
  confidence: number;
  missing: boolean;
}

export interface ProjectUpdateAnalysis {
  sentiment: {
    score: number;
    label: string;
  };
  analysis: AnalysisResult[];
  summary: string;
  timestamp: Date;
}

// Initialize models (lazy loading) with memory management
let sentimentModel: any = null;
let qaModel: any = null;
let summarizer: any = null;
let modelLoadTime: number = 0;
let lastModelUsage: number = 0;

/**
 * Clean up models to free memory
 */
export function cleanupModels(): void {
  try {
    if (sentimentModel) {
      sentimentModel = null;
    }
    if (qaModel) {
      qaModel = null;
    }
    if (summarizer) {
      summarizer = null;
    }
    console.log('[ProjectAnalyzer] Models cleaned up');
  } catch (error) {
    console.warn('[ProjectAnalyzer] Error cleaning up models:', error);
  }
}

/**
 * Check if models should be cleaned up due to inactivity
 */
function shouldCleanupModels(): boolean {
  const now = Date.now();
  const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
  
  if (lastModelUsage > 0 && (now - lastModelUsage) > inactiveThreshold) {
    return true;
  }
  
  return false;
}

/**
 * Initialize Transformers.js models with timeout protection
 */
async function initializeModels(): Promise<void> {
  try {
    // Clean up old models if they've been inactive
    if (shouldCleanupModels()) {
      cleanupModels();
    }
    
    const startTime = Date.now();
    
    if (!sentimentModel) {
      console.log('[ProjectAnalyzer] Loading sentiment model...');
      const modelPromise = pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Model loading timeout')), MODEL_TIMEOUT);
      });
      
      sentimentModel = await Promise.race([modelPromise, timeoutPromise]);
    }
    
    if (!qaModel) {
      console.log('[ProjectAnalyzer] Loading QA model...');
      const modelPromise = pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Model loading timeout')), MODEL_TIMEOUT);
      });
      
      qaModel = await Promise.race([modelPromise, timeoutPromise]);
    }
    
    if (!summarizer) {
      console.log('[ProjectAnalyzer] Loading summarizer...');
      const modelPromise = pipeline('summarization', 'Xenova/sshleifer-tiny-cnn');
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Model loading timeout')), MODEL_TIMEOUT);
      });
      
      summarizer = await Promise.race([modelPromise, timeoutPromise]);
    }
    
    modelLoadTime = Date.now() - startTime;
    lastModelUsage = Date.now();
    
    console.log(`[ProjectAnalyzer] All models loaded successfully in ${modelLoadTime}ms`);
  } catch (error) {
    console.error('[ProjectAnalyzer] Failed to load models:', error);
    cleanupModels(); // Clean up failed models
    throw error;
  }
}

/**
 * Analyze sentiment of project update text with timeout protection
 */
async function analyzeSentiment(text: string): Promise<{ score: number; label: string }> {
  try {
    if (!sentimentModel) {
      await initializeModels();
    }
    
    lastModelUsage = Date.now();
    
    // Limit text length for performance
    const truncatedText = text.length > MAX_TEXT_LENGTH 
      ? text.substring(0, MAX_TEXT_LENGTH) 
      : text;
    
    const result = await sentimentModel(truncatedText);
    const score = result[0].score;
    const label = result[0].label;
    
    // Convert to 0-1 scale where 1 is positive
    const normalizedScore = label === 'POSITIVE' ? score : 1 - score;
    
    return {
      score: normalizedScore,
      label: label.toLowerCase()
    };
  } catch (error) {
    console.warn('[ProjectAnalyzer] Sentiment analysis failed:', error);
    return { score: 0.5, label: 'neutral' };
  }
}

/**
 * Extract answer for a specific question using QA model with timeout protection
 */
async function extractAnswer(text: string, question: string): Promise<{ answer: string; confidence: number }> {
  try {
    if (!qaModel) {
      await initializeModels();
    }
    
    lastModelUsage = Date.now();
    
    // Limit text length for performance
    const truncatedText = text.length > MAX_TEXT_LENGTH 
      ? text.substring(0, MAX_TEXT_LENGTH) 
      : text;
    
    const result = await qaModel(question, truncatedText);
    
    return {
      answer: result.answer || 'No specific answer found',
      confidence: result.score || 0
    };
  } catch (error) {
    console.warn('[ProjectAnalyzer] QA extraction failed:', error);
    return {
      answer: 'Analysis failed',
      confidence: 0
    };
  }
}

/**
 * Generate a concise summary of the project update with timeout protection
 */
async function generateSummary(text: string): Promise<string> {
  try {
    if (!summarizer) {
      await initializeModels();
    }
    
    lastModelUsage = Date.now();
    
    // Limit text length for performance
    const truncatedText = text.length > MAX_TEXT_LENGTH 
      ? text.substring(0, MAX_TEXT_LENGTH) 
      : text;
    
    const result = await summarizer(truncatedText, {
      max_length: 50,
      min_length: 10,
      do_sample: false
    });
    
    return result[0].summary_text || 'Summary generation failed';
  } catch (error) {
    console.warn('[ProjectAnalyzer] Summary generation failed:', error);
    return 'Summary generation failed';
  }
}

/**
 * Analyze a project update using Transformers.js with performance optimizations
 */
export async function analyzeProjectUpdate(text: string): Promise<ProjectUpdateAnalysis> {
  try {
    console.log('[ProjectAnalyzer] Starting analysis of project update...');
    
    // Limit text length early
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH) + '...';
      console.log(`[ProjectAnalyzer] Text truncated to ${MAX_TEXT_LENGTH} characters`);
    }
    
    // Initialize models if needed
    await initializeModels();
    
    // Analyze sentiment
    const sentiment = await analyzeSentiment(text);
    console.log('[ProjectAnalyzer] Sentiment analysis complete:', sentiment);
    
    // Analyze each question with rate limiting
    const analysis: AnalysisResult[] = [];
    
    for (let i = 0; i < QUESTIONS.length; i++) {
      const questionData = QUESTIONS[i];
      
      // Add small delay between questions to prevent overwhelming the model
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const { answer, confidence } = await extractAnswer(text, questionData.q);
      
      analysis.push({
        id: questionData.id,
        question: questionData.q,
        answer,
        confidence,
        missing: confidence < 0.25 // Treat low confidence as missing
      });
    }
    
    console.log('[ProjectAnalyzer] QA analysis complete');
    
    // Generate summary
    const summary = await generateSummary(text);
    console.log('[ProjectAnalyzer] Summary generation complete');
    
    return {
      sentiment,
      analysis,
      summary,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('[ProjectAnalyzer] Analysis failed:', error);
    
    // Return fallback result instead of throwing
    return {
      sentiment: { score: 0.5, label: 'neutral' },
      analysis: QUESTIONS.map(q => ({
        id: q.id,
        question: q.q,
        answer: 'Analysis failed',
        confidence: 0,
        missing: true
      })),
      summary: 'Analysis failed - fallback result',
      timestamp: new Date()
    };
  }
}

/**
 * Get analysis results grouped by confidence levels
 */
export function groupAnalysisResults(analysis: AnalysisResult[]) {
  const clearlyStated = analysis.filter(result => result.confidence >= 0.25);
  const missing = analysis.filter(result => result.confidence < 0.25);
  
  return {
    clearlyStated,
    missing,
    totalQuestions: analysis.length,
    coverage: (clearlyStated.length / analysis.length) * 100
  };
}

/**
 * Export analysis results for storage
 */
export function exportAnalysis(analysis: ProjectUpdateAnalysis) {
  return {
    ...analysis,
    timestamp: analysis.timestamp.toISOString(),
    grouped: groupAnalysisResults(analysis.analysis)
  };
}
