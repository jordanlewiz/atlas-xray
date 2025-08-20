import { analyzeUpdateQuality as analyzeWithRuleBasedSystem, AnalysisResult } from './localModelManager';

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

// No model initialization needed - using rule-based analysis

/**
 * Analyze the quality of a project update using rule-based analysis
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
  
  try {
    console.log('🔍 Analyzing update quality using rule-based system...');
    
    // Use our rule-based analysis system
    const ruleBasedResult: AnalysisResult = await analyzeWithRuleBasedSystem(updateText);
    
    // Determine applicable criteria based on context
    const applicableCriteria = determineApplicableCriteria(updateType, state, updateText);
    
    // Convert rule-based result to our expected format
    const analysis: QualityAnalysis[] = applicableCriteria.map(criteria => ({
      criteriaId: criteria.id,
      title: criteria.title,
      score: Math.round((ruleBasedResult.score / 100) * criteria.requiredAnswers),
      maxScore: criteria.requiredAnswers,
      answers: ruleBasedResult.summary ? [ruleBasedResult.summary] : [],
      missingInfo: ruleBasedResult.missingInfo,
      recommendations: ruleBasedResult.recommendations
    }));
    
    const result: UpdateQualityResult = {
      overallScore: ruleBasedResult.score,
      qualityLevel: ruleBasedResult.quality,
      analysis,
      missingInfo: ruleBasedResult.missingInfo,
      recommendations: ruleBasedResult.recommendations,
      summary: ruleBasedResult.summary,
      timestamp: new Date()
    };
    
    console.log(`✅ Analysis complete: ${result.qualityLevel} quality (${result.overallScore}/100)`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error analyzing update quality:', error);
    
    // Provide fallback result
    return {
      overallScore: 0,
      qualityLevel: 'poor',
      analysis: [],
      missingInfo: ['Analysis system error - manual review required'],
      recommendations: ['Review update content manually for quality assessment'],
      summary: 'Analysis failed - manual review needed',
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
