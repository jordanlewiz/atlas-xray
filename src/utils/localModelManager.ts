// Rule-based analysis system that works offline with no external dependencies
// This provides intelligent analysis without requiring AI models or network calls

export interface AnalysisResult {
  score: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  summary: string;
  missingInfo: string[];
  recommendations: string[];
}

// Singleton instance for caching analysis results
let analysisCache: Map<string, AnalysisResult> = new Map();

/**
 * Analyze update quality using rule-based logic (no external dependencies)
 */
export async function createLocalModelPipeline(): Promise<any> {
  // Return a mock model interface that uses our rule-based analysis
  return {
    async answer(question: string, context: string): Promise<{ answer: string; score: number }> {
      const result = await analyzeUpdateQuality(context);
      return {
        answer: result.summary,
        score: result.score
      };
    },
    dispose: () => {} // No cleanup needed
  };
}

/**
 * Get cached model or create new one
 */
export async function getModel(): Promise<any> {
  return await createLocalModelPipeline();
}

/**
 * Clear the cached model (useful for testing)
 */
export function clearModelCache(): void {
  analysisCache.clear();
}

/**
 * Preload models (no-op for rule-based system)
 */
export async function preloadModels(): Promise<void> {
  console.log('✅ Rule-based analysis system ready (no models to load)');
}

/**
 * Check if analysis system is available
 */
export async function checkLocalModels(): Promise<boolean> {
  return true; // Always available
}

/**
 * Analyze update quality using intelligent rule-based logic
 */
export async function analyzeUpdateQuality(updateText: string): Promise<AnalysisResult> {
  // Check cache first
  const cacheKey = updateText.substring(0, 100); // Use first 100 chars as key
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey)!;
  }

  const analysis = performRuleBasedAnalysis(updateText);
  
  // Cache the result
  analysisCache.set(cacheKey, analysis);
  
  return analysis;
}

/**
 * Perform intelligent rule-based analysis
 */
function performRuleBasedAnalysis(updateText: string): AnalysisResult {
  const text = updateText.toLowerCase();
  let score = 0;
  const missingInfo: string[] = [];
  const recommendations: string[] = [];

  // Analyze content quality based on various factors
  
  // 1. Length and detail (0-25 points)
  if (text.length > 500) {
    score += 25;
  } else if (text.length > 200) {
    score += 15;
  } else if (text.length > 100) {
    score += 10;
  } else {
    score += 5;
    missingInfo.push('More detailed explanation needed');
  }

  // 2. Specificity and actionability (0-25 points)
  const hasSpecificActions = /\b(will|going to|plan to|intend to|aim to)\b/.test(text);
  const hasTimeline = /\b(today|tomorrow|next week|by|until|deadline)\b/.test(text);
  const hasMetrics = /\b(percent|%|number|count|measure|target|goal)\b/.test(text);
  
  if (hasSpecificActions && hasTimeline && hasMetrics) {
    score += 25;
  } else if (hasSpecificActions && hasTimeline) {
    score += 20;
  } else if (hasSpecificActions) {
    score += 15;
  } else {
    score += 5;
    missingInfo.push('Specific actions and timeline needed');
  }

  // 3. Context and reasoning (0-25 points)
  const hasContext = /\b(because|due to|as a result|since|therefore|reason)\b/.test(text);
  const hasImpact = /\b(impact|effect|consequence|result|outcome)\b/.test(text);
  const hasStakeholders = /\b(team|stakeholder|user|customer|client|manager)\b/.test(text);
  
  if (hasContext && hasImpact && hasStakeholders) {
    score += 25;
  } else if (hasContext && hasImpact) {
    score += 20;
  } else if (hasContext) {
    score += 15;
  } else {
    score += 5;
    missingInfo.push('Context and reasoning needed');
  }

  // 4. Professional tone and structure (0-25 points)
  const hasProfessionalTone = !/\b(omg|wtf|lol|ugh|damn|shit)\b/.test(text);
  const hasStructure = /\b(first|second|third|finally|in conclusion|summary)\b/.test(text);
  const hasClarity = !/\b(thing|stuff|something|whatever|idk)\b/.test(text);
  
  if (hasProfessionalTone && hasStructure && hasClarity) {
    score += 25;
  } else if (hasProfessionalTone && hasClarity) {
    score += 20;
  } else if (hasProfessionalTone) {
    score += 15;
  } else {
    score += 5;
    missingInfo.push('Professional tone and structure needed');
  }

  // Determine quality level
  let quality: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 70) {
    quality = 'excellent';
  } else if (score >= 50) {
    quality = 'good';
  } else if (score >= 30) {
    quality = 'fair';
  } else {
    quality = 'poor';
  }

  // Generate recommendations based on missing elements
  if (score < 70) {
    if (text.length < 200) {
      recommendations.push('Provide more detailed explanation of the situation');
    }
    if (!hasSpecificActions) {
      recommendations.push('Include specific actions and next steps');
    }
    if (!hasTimeline) {
      recommendations.push('Add timeline and deadlines');
    }
    if (!hasContext) {
      recommendations.push('Explain the reasoning behind decisions');
    }
    if (!hasImpact) {
      recommendations.push('Describe the impact and consequences');
    }
    if (!hasStructure) {
      recommendations.push('Organize information with clear structure');
    }
  }

  // Generate summary
  const summary = generateSummary(quality, score, missingInfo.length);

  const result: AnalysisResult = {
    score,
    quality,
    summary,
    missingInfo,
    recommendations
  };

  return result;
}

/**
 * Generate a human-readable summary
 */
function generateSummary(quality: string, score: number, missingCount: number): string {
  const qualityEmoji = {
    excellent: '🟢',
    good: '🟡', 
    fair: '🟠',
    poor: '🔴'
  }[quality];

  if (quality === 'excellent') {
    return `${qualityEmoji} Excellent update quality (${score}/100). Well-structured, detailed, and actionable.`;
  } else if (quality === 'good') {
    return `${qualityEmoji} Good update quality (${score}/100). Minor improvements could enhance clarity.`;
  } else if (quality === 'fair') {
    return `${qualityEmoji} Fair update quality (${score}/100). ${missingCount} areas need improvement.`;
  } else {
    return `${qualityEmoji} Poor update quality (${score}/100). ${missingCount} critical elements missing.`;
  }
}
