import { pipeline, AutoTokenizer, AutoModelForSequenceClassification, AutoModelForQuestionAnswering } from '@xenova/transformers';

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

// Initialize models (lazy loading)
let sentimentModel: any = null;
let qaModel: any = null;
let summarizer: any = null;

/**
 * Initialize Transformers.js models
 */
async function initializeModels() {
  try {
    if (!sentimentModel) {
      console.log('[ProjectAnalyzer] Loading sentiment model...');
      sentimentModel = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    }
    
    if (!qaModel) {
      console.log('[ProjectAnalyzer] Loading QA model...');
      qaModel = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
    }
    
    if (!summarizer) {
      console.log('[ProjectAnalyzer] Loading summarizer...');
      summarizer = await pipeline('summarization', 'Xenova/sshleifer-tiny-cnn');
    }
    
    console.log('[ProjectAnalyzer] All models loaded successfully');
  } catch (error) {
    console.error('[ProjectAnalyzer] Failed to load models:', error);
    throw error;
  }
}

/**
 * Analyze sentiment of project update text
 */
async function analyzeSentiment(text: string): Promise<{ score: number; label: string }> {
  try {
    if (!sentimentModel) {
      await initializeModels();
    }
    
    const result = await sentimentModel(text);
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
 * Extract answer for a specific question using QA model
 */
async function extractAnswer(text: string, question: string): Promise<{ answer: string; confidence: number }> {
  try {
    if (!qaModel) {
      await initializeModels();
    }
    
    const result = await qaModel(question, text);
    
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
 * Generate a concise summary of the project update
 */
async function generateSummary(text: string): Promise<string> {
  try {
    if (!summarizer) {
      await initializeModels();
    }
    
    const result = await summarizer(text, {
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
 * Analyze a project update using Transformers.js
 */
export async function analyzeProjectUpdate(text: string): Promise<ProjectUpdateAnalysis> {
  try {
    console.log('[ProjectAnalyzer] Starting analysis of project update...');
    
    // Initialize models if needed
    await initializeModels();
    
    // Analyze sentiment
    const sentiment = await analyzeSentiment(text);
    console.log('[ProjectAnalyzer] Sentiment analysis complete:', sentiment);
    
    // Analyze each question
    const analysisPromises = QUESTIONS.map(async (questionData) => {
      const { answer, confidence } = await extractAnswer(text, questionData.q);
      
      return {
        id: questionData.id,
        question: questionData.q,
        answer,
        confidence,
        missing: confidence < 0.25 // Treat low confidence as missing
      };
    });
    
    const analysis = await Promise.all(analysisPromises);
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
    throw error;
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
