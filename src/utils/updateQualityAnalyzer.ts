// Conditional imports for AI functionality
let pipeline: any = null;
let analyzeProjectUpdate: any = null;

// Check if we're in a content script context
const isContentScript = typeof window !== 'undefined' && 
  (window.location.href.includes('chrome-extension://') || 
   window.location.href.includes('moz-extension://') ||
   window.location.href.includes('chrome://') ||
   window.location.href.includes('about:'));

// Only import AI libraries if we're not in a content script context
if (!isContentScript) {
  try {
    // @ts-ignore
    const transformers = require('@xenova/transformers');
    pipeline = transformers.pipeline;
    
    const projectAnalyzer = require('./projectAnalyzer');
    analyzeProjectUpdate = projectAnalyzer.analyzeProjectUpdate;
  } catch (error) {
    console.log('AI libraries not available in this context:', error);
  }
}

// Quality criteria for different types of project updates
export interface QualityCriteria {
  id: string;
  title: string;
  questions: string[];
  requiredAnswers: number;
  weight: number;
}

export interface QualityAnalysis {
  criteriaId: string;
  title: string;
  score: number;
  maxScore: number;
  answers: string[];
  missingInfo: string[];
  recommendations: string[];
}

export interface UpdateQualityResult {
  overallScore: number;
  qualityLevel: 'excellent' | 'good' | 'fair' | 'poor';
  analysis: QualityAnalysis[];
  missingInfo: string[];
  recommendations: string[];
  summary: string;
  timestamp: Date;
}

// Define quality criteria based on user requirements
export const QUALITY_CRITERIA: QualityCriteria[] = [
  {
    id: 'prioritization',
    title: 'Initiative Prioritization',
    questions: [
      'Why has this new initiative been prioritised?',
      'What is the reason + impact?',
      'How was this decision made?',
      'Is any support needed?'
    ],
    requiredAnswers: 3,
    weight: 1.0
  },
  {
    id: 'paused',
    title: 'Project Paused',
    questions: [
      'Why was this Paused?',
      'What is the reason + impact?',
      'When will it be resumed?',
      'How was this decision made?',
      'Is any support needed?'
    ],
    requiredAnswers: 4,
    weight: 1.0
  },
  {
    id: 'off-track',
    title: 'Project Off-track',
    questions: [
      'Why is this off-track?',
      'Summary of situation',
      'What steps are being taken to get back on-track?',
      'What is the impact of this being off-track?',
      'What support is needed?'
    ],
    requiredAnswers: 4,
    weight: 1.0
  },
  {
    id: 'at-risk',
    title: 'Project At-risk',
    questions: [
      'Why is this at-risk?',
      'Summary of situation',
      'What steps are being taken to get back on-track?',
      'What is the impact of this being at-risk?',
      'What support is needed?'
    ],
    requiredAnswers: 4,
    weight: 1.0
  },
  {
    id: 'date-change',
    title: 'Date Change',
    questions: [
      'Why did the date change?',
      'What was the change?',
      'What is the reason?',
      'What is the impact?',
      'How was this decision made?'
    ],
    requiredAnswers: 4,
    weight: 1.0
  },
  {
    id: 'back-on-track',
    title: 'Back On-track',
    questions: [
      'How did this get back on-track?',
      'Summary of situation',
      'What steps were taken to get back on-track?',
      'Were any decisions made?'
    ],
    requiredAnswers: 3,
    weight: 1.0
  },
  {
    id: 'decision-required',
    title: 'Decision Required',
    questions: [
      'What is the decision?',
      'What is the decision to be made?',
      'Context. How did we get here?',
      'How will the decision be made and by when?'
    ],
    requiredAnswers: 3,
    weight: 1.0
  }
];

// Initialize AI models (lazy loading)
let qaModel: any = null;
let sentimentModel: any = null;
let summarizer: any = null;

/**
 * Initialize Transformers.js models for quality analysis
 */
async function initializeModels() {
  try {
    if (!qaModel) {
      console.log('[UpdateQualityAnalyzer] Loading QA model...');
      qaModel = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
    }
    
    if (!sentimentModel) {
      console.log('[UpdateQualityAnalyzer] Loading sentiment model...');
      sentimentModel = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    }
    
    if (!summarizer) {
      console.log('[UpdateQualityAnalyzer] Loading summarizer...');
      summarizer = await pipeline('summarization', 'Xenova/sshleifer-tiny-cnn');
    }
    
    console.log('[UpdateQualityAnalyzer] All models loaded successfully');
  } catch (error) {
    console.error('[UpdateQualityAnalyzer] Failed to load models:', error);
    throw error;
  }
}

/**
 * Analyze the quality of a project update using AI models
 */
export async function analyzeUpdateQuality(
  updateText: string,
  updateType?: string,
  state?: string
): Promise<UpdateQualityResult> {
  // Validate input
  if (!updateText || typeof updateText !== 'string' || updateText.trim() === '') {
    return {
      overallScore: 0,
      qualityLevel: 'poor',
      analysis: [],
      missingInfo: ['No update text provided for analysis'],
      recommendations: ['Provide update content for quality analysis'],
      summary: 'Cannot analyze empty or invalid update text',
      timestamp: new Date()
    };
  }
  
  // Check if AI functionality is available
  if (!pipeline || isContentScript) {
    console.log('🔍 AI analysis not available, using fallback analysis...');
    return provideFallbackAnalysis(updateText, updateType, state);
  }
  
  try {
    console.log('🔍 Analyzing update quality using AI models...');
    
    // Initialize AI models
    await initializeModels();
    
    // Determine applicable criteria based on context
    const applicableCriteria = determineApplicableCriteria(updateType, state, updateText);
    
    // Analyze each criterion using AI
    const analysisPromises = applicableCriteria.map(async (criteria) => {
      const criterionAnalysis = await analyzeCriterionWithAI(updateText, criteria);
      return criterionAnalysis;
    });
    
    const analysis = await Promise.all(analysisPromises);
    
    // Calculate overall score
    const totalScore = analysis.reduce((sum, criterion) => sum + criterion.score, 0);
    const maxPossibleScore = analysis.reduce((sum, criterion) => sum + criterion.maxScore, 0);
    const overallScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    
    // Determine quality level
    const qualityLevel = determineQualityLevel(overallScore);
    
    // Generate AI-powered summary
    const summary = await generateAISummary(updateText, analysis);
    
    // Collect missing information and recommendations
    const missingInfo = analysis.flatMap(criterion => criterion.missingInfo);
    const recommendations = analysis.flatMap(criterion => criterion.recommendations);
    
    const result: UpdateQualityResult = {
      overallScore,
      qualityLevel,
      analysis,
      missingInfo,
      recommendations,
      summary,
      timestamp: new Date()
    };
    
    console.log(`✅ AI analysis complete: ${result.qualityLevel} quality (${result.overallScore}/100)`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error analyzing update quality:', error);
    
    // Provide fallback result
    return provideFallbackAnalysis(updateText, updateType, state);
  }
}

/**
 * Analyze a specific quality criterion using AI
 */
async function analyzeCriterionWithAI(
  updateText: string, 
  criteria: QualityCriteria
): Promise<QualityAnalysis> {
  try {
    const answers: string[] = [];
    const missingInfo: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze each question in the criterion using AI
    for (const question of criteria.questions) {
      const { answer, confidence } = await extractAnswerWithAI(updateText, question);
      
      if (confidence >= 0.3) {
        answers.push(answer);
      } else {
        missingInfo.push(question);
        recommendations.push(`Provide more specific information about: ${question}`);
      }
    }
    
    // Calculate score for this criterion
    const score = Math.min(answers.length, criteria.requiredAnswers);
    const maxScore = criteria.requiredAnswers;
    
    // Add general recommendations based on missing information
    if (missingInfo.length > 0) {
      recommendations.push(`Consider addressing the ${missingInfo.length} missing information points to improve quality`);
    }
    
    return {
      criteriaId: criteria.id,
      title: criteria.title,
      score,
      maxScore,
      answers,
      missingInfo,
      recommendations
    };
    
  } catch (error) {
    console.warn(`[UpdateQualityAnalyzer] Failed to analyze criterion ${criteria.id}:`, error);
    
    return {
      criteriaId: criteria.id,
      title: criteria.title,
      score: 0,
      maxScore: criteria.requiredAnswers,
      answers: [],
      missingInfo: criteria.questions,
      recommendations: ['AI analysis failed for this criterion - manual review needed']
    };
  }
}

/**
 * Extract answer for a specific question using AI QA model
 */
async function extractAnswerWithAI(
  text: string, 
  question: string
): Promise<{ answer: string; confidence: number }> {
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
    console.warn('[UpdateQualityAnalyzer] AI QA extraction failed:', error);
    return {
      answer: 'Analysis failed',
      confidence: 0
    };
  }
}

/**
 * Generate AI-powered summary of the update and analysis
 */
async function generateAISummary(
  updateText: string, 
  analysis: QualityAnalysis[]
): Promise<string> {
  try {
    if (!summarizer) {
      await initializeModels();
    }
    
    // Create a summary prompt that includes the analysis results
    const analysisSummary = analysis
      .map(criterion => `${criterion.title}: ${criterion.score}/${criterion.maxScore} points`)
      .join(', ');
    
    const summaryPrompt = `Project Update: ${updateText}\n\nQuality Analysis: ${analysisSummary}`;
    
    const result = await summarizer(summaryPrompt, {
      max_length: 100,
      min_length: 30,
      do_sample: false
    });
    
    return result[0].summary_text || 'AI summary generation failed';
  } catch (error) {
    console.warn('[UpdateQualityAnalyzer] AI summary generation failed:', error);
    return 'AI summary generation failed';
  }
}

/**
 * Determine quality level based on overall score
 */
function determineQualityLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

/**
 * Provide fallback analysis when AI is not available
 */
function provideFallbackAnalysis(
  updateText: string,
  updateType?: string,
  state?: string
): UpdateQualityResult {
  // Simple rule-based fallback analysis
  const applicableCriteria = determineApplicableCriteria(updateType, state, updateText);
  
  const analysis: QualityAnalysis[] = applicableCriteria.map(criteria => {
    // Simple scoring based on text length and content
    const textLength = updateText.length;
    const hasDates = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(updateText);
    const hasStateChange = state && state !== 'on-track';
    const hasDetails = updateText.split('.').length > 2;
    
    let score = 0;
    if (textLength > 100) score++;
    if (hasDates) score++;
    if (hasStateChange) score++;
    if (hasDetails) score++;
    
    const missingInfo: string[] = [];
    const recommendations: string[] = [];
    
    if (textLength < 50) {
      missingInfo.push('More detailed explanation needed');
      recommendations.push('Provide more context and details');
    }
    
    if (!hasDates && (updateType === 'date-change' || updateText.includes('date'))) {
      missingInfo.push('Specific dates not mentioned');
      recommendations.push('Include specific dates and timelines');
    }
    
    return {
      criteriaId: criteria.id,
      title: criteria.title,
      score: Math.min(score, criteria.requiredAnswers),
      maxScore: criteria.requiredAnswers,
      answers: [updateText.substring(0, 100) + '...'],
      missingInfo,
      recommendations
    };
  });
  
  const totalScore = analysis.reduce((sum, criterion) => sum + criterion.score, 0);
  const maxPossibleScore = analysis.reduce((sum, criterion) => sum + criterion.maxScore, 0);
  const overallScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  
  return {
    overallScore,
    qualityLevel: determineQualityLevel(overallScore),
    analysis,
    missingInfo: analysis.flatMap(criterion => criterion.missingInfo),
    recommendations: analysis.flatMap(criterion => criterion.recommendations),
    summary: `Fallback analysis: ${overallScore}/100 quality score`,
    timestamp: new Date()
  };
}

/**
 * Determine which quality criteria are applicable to this update
 */
function determineApplicableCriteria(
  updateType?: string, 
  state?: string, 
  updateText?: string
): QualityCriteria[] {
  const applicable: QualityCriteria[] = [];
  
  // Add general criteria that apply to most updates
  applicable.push(QUALITY_CRITERIA.find(c => c.id === 'decision-required')!);
  
  // Add specific criteria based on state changes
  if (state) {
    const normalizedState = state.toLowerCase().replace(/_/g, '-');
    
    switch (normalizedState) {
      case 'paused':
        applicable.push(QUALITY_CRITERIA.find(c => c.id === 'paused')!);
        break;
      case 'off-track':
        applicable.push(QUALITY_CRITERIA.find(c => c.id === 'off-track')!);
        break;
      case 'at-risk':
        applicable.push(QUALITY_CRITERIA.find(c => c.id === 'at-risk')!);
        break;
      case 'on-track':
        // Check if this is a recovery from being off-track
        if (updateText && updateText.toLowerCase().includes('back on track')) {
          applicable.push(QUALITY_CRITERIA.find(c => c.id === 'back-on-track')!);
        }
        break;
    }
  }
  
  // Add date change criteria if dates are mentioned
  if (updateText && (updateText.includes('date') || updateText.includes('due'))) {
    applicable.push(QUALITY_CRITERIA.find(c => c.id === 'date-change')!);
  }
  
  // Add prioritization criteria for new initiatives
  if (updateType === 'new' || (updateText && updateText.toLowerCase().includes('new initiative'))) {
    applicable.push(QUALITY_CRITERIA.find(c => c.id === 'prioritization')!);
  }
  
  return applicable;
}
