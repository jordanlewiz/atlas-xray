import { pipeline } from '@xenova/transformers';

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

async function initializeQAModel() {
  if (!qaModel) {
    try {
      qaModel = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
    } catch (error) {
      console.error('Failed to initialize QA model:', error);
      throw error;
    }
  }
  return qaModel;
}

/**
 * Analyze the quality of a project update based on its content and type
 */
export async function analyzeUpdateQuality(
  updateText: string,
  updateType?: string,
  state?: string
): Promise<UpdateQualityResult> {
  try {
    const model = await initializeQAModel();
    
    // Determine which criteria are applicable based on update type and state
    const applicableCriteria = determineApplicableCriteria(updateType, state, updateText);
    
    // Analyze each applicable criterion
    const analysis: QualityAnalysis[] = [];
    
    for (const criteria of applicableCriteria) {
      const criteriaAnalysis = await analyzeCriteria(criteria, updateText, model);
      analysis.push(criteriaAnalysis);
    }
    
    // Calculate overall score and generate recommendations
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
    
  } catch (error) {
    console.error('Error analyzing update quality:', error);
    // Return a basic analysis if AI fails
    return {
      overallScore: 0,
      qualityLevel: 'poor',
      analysis: [],
      missingInfo: ['AI analysis failed - manual review required'],
      recommendations: ['Review update content manually'],
      summary: 'Quality analysis failed - manual review required',
      timestamp: new Date()
    };
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
  
  // Analyze each question for this criterion
  for (const question of criteria.questions) {
    try {
      const result = await model(question, updateText);
      const answer = result.answer.trim();
      
      if (answer && answer !== '') {
        answers.push(answer);
      } else {
        missingInfo.push(question);
      }
    } catch (error) {
      console.error(`Error analyzing question "${question}":`, error);
      missingInfo.push(question);
    }
  }
  
  // Calculate score for this criterion
  const score = Math.min(answers.length, criteria.requiredAnswers);
  const maxScore = criteria.requiredAnswers;
  
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
