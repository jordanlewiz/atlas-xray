import { pipeline, env } from '@xenova/transformers';
import { createLocalModelPipeline, checkLocalModels } from './localModelManager';

// Configure transformers to use local models and avoid CDN issues
env.allowRemoteModels = true; // Allow fallback to remote if local fails
env.allowLocalModels = true;
env.useBrowserCache = true;
env.useCustomCache = true;

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

// Initialize QA model for analysis
let qaModel: any = null;
let modelInitializing = false;
let modelError: string | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;
let modelHealthCheckInterval: NodeJS.Timeout | null = null;
let lastModelUsage = Date.now();

async function initializeQAModel() {
  if (qaModel) {
    return qaModel;
  }
  
  if (modelInitializing) {
    // Wait for initialization to complete
    while (modelInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (qaModel) return qaModel;
    if (modelError && retryCount >= MAX_RETRIES) throw new Error(modelError);
  }
  
  if (modelError && retryCount >= MAX_RETRIES) {
    throw new Error(modelError);
  }
  
  modelInitializing = true;
  
  try {
    console.log(`🤖 Initializing AI model using local model manager (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    // First, check if we have local models available
    const hasLocalModels = await checkLocalModels();
    console.log(hasLocalModels ? '✅ Local models detected' : '⚠️ No local models, will download');
    
    // Use the local model manager to create the pipeline
    qaModel = await createLocalModelPipeline();
    
    console.log('✅ AI model initialized successfully using local model manager!');
    retryCount = 0; // Reset retry count on success
    
    // Start health monitoring
    if (!modelHealthCheckInterval) {
      startModelHealthMonitoring();
    }
    
    return qaModel;
    
  } catch (error) {
    console.error('❌ Local model manager failed:', error);
    retryCount++;
    
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying in 5 seconds... (${retryCount}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      modelInitializing = false;
      return initializeQAModel(); // Retry
    }
    
    modelError = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`AI model initialization failed after ${MAX_RETRIES} attempts: ${modelError}`);
  } finally {
    modelInitializing = false;
  }
}

/**
 * Start monitoring model health and preload if needed
 */
function startModelHealthMonitoring() {
  if (modelHealthCheckInterval) return;
  
  modelHealthCheckInterval = setInterval(async () => {
    const timeSinceLastUsage = Date.now() - lastModelUsage;
    
    // If model hasn't been used for 5 minutes, preload it to keep it warm
    if (timeSinceLastUsage > 5 * 60 * 1000 && qaModel) {
      try {
        console.log('Preloading AI model to maintain performance...');
        await qaModel('test question', 'test context');
        console.log('AI model preloaded successfully');
      } catch (error) {
        console.warn('Model preloading failed, will reinitialize on next use:', error);
        // Reset model to force reinitialization
        qaModel = null;
      }
    }
  }, 60000); // Check every minute
}

/**
 * Stop health monitoring
 */
function stopModelHealthMonitoring() {
  if (modelHealthCheckInterval) {
    clearInterval(modelHealthCheckInterval);
    modelHealthCheckInterval = null;
  }
}

/**
 * Analyze the quality of a project update based on its content and type
 */
export async function analyzeUpdateQuality(
  updateText: string,
  updateType?: string,
  state?: string
): Promise<UpdateQualityResult> {
  // Add detailed logging to debug what's being passed
  console.log('🔍 DEBUG: analyzeUpdateQuality called with:');
  console.log('  updateText:', JSON.stringify(updateText));
  console.log('  updateType:', updateType);
  console.log('  state:', state);
  console.log('  updateText length:', updateText?.length || 0);
  console.log('  updateText type:', typeof updateText);
  console.log('  updateText is empty:', !updateText || updateText.trim() === '');
  
  // Validate input
  if (!updateText || typeof updateText !== 'string' || updateText.trim() === '') {
    console.error('❌ ERROR: Invalid updateText provided:', updateText);
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
  
  try {
    console.log('🤖 Initializing AI model...');
    const model = await initializeQAModel();
    
    console.log('🔥 Warming up AI model...');
    await warmupModel(model);
    
    console.log('📋 Determining applicable criteria...');
    const applicableCriteria = determineApplicableCriteria(updateType, state, updateText);
    console.log('  Found', applicableCriteria.length, 'applicable criteria:', applicableCriteria.map(c => c.id));
    
    // Analyze each applicable criterion
    const analysis: QualityAnalysis[] = [];
    
    for (let i = 0; i < applicableCriteria.length; i++) {
      const criteria = applicableCriteria[i];
      console.log(`🔍 Analyzing criteria ${i + 1}/${applicableCriteria.length}: ${criteria.id}`);
      const criteriaAnalysis = await analyzeCriteria(criteria, updateText, model);
      analysis.push(criteriaAnalysis);
      console.log(`  ✅ Criteria ${criteria.id} analysis complete:`, criteriaAnalysis.score, '/', criteriaAnalysis.maxScore);
    }
    
    console.log('📊 Calculating overall score...');
    const overallScore = calculateOverallScore(analysis);
    const qualityLevel = determineQualityLevel(overallScore);
    const missingInfo = generateMissingInfo(analysis);
    const recommendations = generateRecommendations(analysis);
    const summary = getQualitySummary(overallScore, qualityLevel, missingInfo);
    
    console.log('🎯 Analysis complete! Score:', overallScore, 'Quality:', qualityLevel);
    
    return {
      overallScore,
      qualityLevel,
      analysis,
      missingInfo,
      recommendations,
      summary,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('❌ Error analyzing update quality:', error);
    
    // Try one more time with a fresh model
    try {
      console.log('🔄 First attempt failed, trying with fresh model...');
      qaModel = null; // Reset model
      const freshModel = await initializeQAModel();
      await warmupModel(freshModel);
      
      const applicableCriteria = determineApplicableCriteria(updateType, state, updateText);
      const analysis: QualityAnalysis[] = [];
      
      for (const criteria of applicableCriteria) {
        const criteriaAnalysis = await analyzeCriteria(criteria, updateText, freshModel);
        analysis.push(criteriaAnalysis);
      }
      
      const overallScore = calculateOverallScore(analysis);
      const qualityLevel = determineQualityLevel(overallScore);
      const missingInfo = generateMissingInfo(analysis);
      const recommendations = generateRecommendations(analysis);
      const summary = getQualitySummary(overallScore, qualityLevel, missingInfo);
      
      return {
        overallScore,
        qualityLevel,
        analysis,
        missingInfo,
        recommendations,
        summary,
        timestamp: new Date()
      };
      
    } catch (retryError) {
      console.error('❌ Retry attempt also failed:', retryError);
      
      // Provide specific error messages
      let errorMessage = 'AI analysis failed - manual review required';
      let recommendation = 'Review update content manually';
      
      if (retryError instanceof Error) {
        if (retryError.message.includes('AI model initialization failed')) {
          errorMessage = 'AI model failed to load - check internet connection and try again';
          recommendation = 'Ensure stable internet connection and retry analysis';
        } else if (retryError.message.includes('Failed to fetch')) {
          errorMessage = 'Network error - AI model download failed';
          recommendation = 'Check internet connection and retry';
        } else if (retryError.message.includes('transformers')) {
          errorMessage = 'AI library error - transformers library issue';
          recommendation = 'Refresh page and try again';
        }
      }
      
      return {
        overallScore: 0,
        qualityLevel: 'poor',
        analysis: [],
        missingInfo: [errorMessage],
        recommendations: [recommendation],
        summary: errorMessage,
        timestamp: new Date()
      };
    }
  }
}

/**
 * Warm up the model to ensure it's working properly
 */
async function warmupModel(model: any): Promise<void> {
  try {
    console.log('Warming up AI model...');
    const testResult = await model('What is this?', 'This is a test context for warming up the AI model.');
    if (!testResult || !testResult.answer) {
      throw new Error('Model warmup failed - no answer generated');
    }
    console.log('AI model warmed up successfully');
  } catch (error) {
    console.error('Model warmup failed:', error);
    throw new Error(`Model warmup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

/**
 * Analyze a specific quality criterion using AI
 */
async function analyzeCriteria(
  criteria: QualityCriteria, 
  updateText: string, 
  model: any
): Promise<QualityAnalysis> {
  const answers: string[] = [];
  const missingInfo: string[] = [];
  
  console.log(`  🔍 Analyzing ${criteria.questions.length} questions for criteria: ${criteria.id}`);
  
  // Analyze each question for this criterion
  for (let i = 0; i < criteria.questions.length; i++) {
    const question = criteria.questions[i];
    console.log(`    📝 Question ${i + 1}/${criteria.questions.length}: "${question}"`);
    
    try {
      // Ensure model is still working
      if (!model || typeof model !== 'function') {
        console.warn('    ⚠️ Model appears to be invalid, reinitializing...');
        const freshModel = await initializeQAModel();
        model = freshModel;
      }
      
      console.log(`    🤖 Sending to AI model: Question="${question}", Context="${updateText.substring(0, 100)}..."`);
      const result = await model(question, updateText);
      lastModelUsage = Date.now(); // Track model usage
      
      console.log(`    📊 AI Response:`, result);
      const answer = result.answer.trim();
      
      if (answer && answer !== '') {
        console.log(`    ✅ Answer found: "${answer}"`);
        answers.push(answer);
      } else {
        console.log(`    ❌ No answer generated for question`);
        missingInfo.push(question);
      }
    } catch (error) {
      console.error(`    ❌ Error analyzing question "${question}":`, error);
      
      // Try to recover the model if it failed
      try {
        console.log('    🔄 Attempting to recover AI model...');
        const recoveredModel = await initializeQAModel();
        model = recoveredModel;
        
        // Retry the question with recovered model
        console.log(`    🔄 Retrying question with recovered model...`);
        const retryResult = await model(question, updateText);
        const retryAnswer = retryResult.answer.trim();
        
        if (retryAnswer && retryAnswer !== '') {
          console.log(`    ✅ Retry successful: "${retryAnswer}"`);
          answers.push(retryAnswer);
        } else {
          console.log(`    ❌ Retry also failed - no answer generated`);
          missingInfo.push(question);
        }
      } catch (recoveryError) {
        console.error('    ❌ Model recovery failed:', recoveryError);
        missingInfo.push(question);
      }
    }
  }
  
  // Calculate score for this criterion
  const score = Math.min(answers.length, criteria.requiredAnswers);
  const maxScore = criteria.requiredAnswers;
  
  console.log(`  📊 Criteria ${criteria.id} results: ${score}/${maxScore} questions answered`);
  
  // Generate recommendations based on missing information
  const recommendations = missingInfo.map(info => `Provide: ${info}`);
  
  return {
    criteriaId: criteria.id,
    title: criteria.title,
    score,
    maxScore,
    answers,
    missingInfo,
    recommendations
  };
}

/**
 * Calculate overall quality score
 */
function calculateOverallScore(analysis: QualityAnalysis[]): number {
  if (analysis.length === 0) return 0;
  
  let totalScore = 0;
  let totalMaxScore = 0;
  
  for (const criteria of analysis) {
    totalScore += criteria.score;
    totalMaxScore += criteria.maxScore;
  }
  
  return totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
}

/**
 * Determine quality level based on score
 */
function determineQualityLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

/**
 * Generate list of missing information
 */
function generateMissingInfo(analysis: QualityAnalysis[]): string[] {
  const missing: string[] = [];
  for (const criteria of analysis) {
    missing.push(...criteria.missingInfo);
  }
  return missing;
}

/**
 * Generate recommendations for improvement
 */
function generateRecommendations(analysis: QualityAnalysis[]): string[] {
  const recommendations: string[] = [];
  for (const criteria of analysis) {
    recommendations.push(...criteria.recommendations);
  }
  return recommendations;
}

/**
 * Generate a human-readable quality summary
 */
function getQualitySummary(
  score: number, 
  level: string, 
  missingInfo: string[]
): string {
  const levelText = level.charAt(0).toUpperCase() + level.slice(1);
  
  if (missingInfo.length === 0) {
    return `${levelText} quality update with comprehensive information.`;
  }
  
  const missingCount = missingInfo.length;
  const missingText = missingCount === 1 ? 'piece of information' : 'pieces of information';
  
  return `${levelText} quality update. Missing ${missingCount} ${missingText} that could improve clarity and decision-making.`;
}
