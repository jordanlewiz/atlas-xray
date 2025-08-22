// Rule-based analysis system that works offline with no external dependencies
// This provides intelligent analysis without requiring AI models or network calls

export interface AnalysisResult {
  score: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  summary: string;
  missingInfo: string[];
  recommendations: string[];
}

// Performance optimizations
const MAX_CACHE_SIZE = 1000; // Limit cache to prevent memory bloat
const MAX_TEXT_LENGTH = 2000; // Limit text length for analysis
const ANALYSIS_TIMEOUT = 5000; // 5 second timeout for analysis

// Singleton instance for caching analysis results with size limits
let analysisCache: Map<string, AnalysisResult> = new Map();
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Clean up cache if it gets too large
 */
function cleanupCache(): void {
  if (analysisCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(analysisCache.entries());
    // Remove oldest entries (first 20% of cache)
    const removeCount = Math.floor(MAX_CACHE_SIZE * 0.2);
    for (let i = 0; i < removeCount; i++) {
      analysisCache.delete(entries[i][0]);
    }
    console.log(`[LocalModelManager] Cleaned up cache, removed ${removeCount} entries`);
  }
}

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
    dispose: () => {
      // Clean up cache when disposing
      analysisCache.clear();
      console.log('[LocalModelManager] Cache cleared');
    }
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
  // Performance optimization: limit text length
  if (updateText.length > MAX_TEXT_LENGTH) {
    updateText = updateText.substring(0, MAX_TEXT_LENGTH) + '...';
  }

  // Check cache first
  const cacheKey = updateText.substring(0, 100); // Use first 100 chars as key
  if (analysisCache.has(cacheKey)) {
    cacheHits++;
    return analysisCache.get(cacheKey)!;
  }

  cacheMisses++;
  
  // Add timeout protection
  const analysisPromise = performRuleBasedAnalysis(updateText);
  const timeoutPromise = new Promise<AnalysisResult>((_, reject) => {
    setTimeout(() => reject(new Error('Analysis timeout')), ANALYSIS_TIMEOUT);
  });

  try {
    const analysis = await Promise.race([analysisPromise, timeoutPromise]);
    
    // Cache the result and cleanup if needed
    analysisCache.set(cacheKey, analysis);
    cleanupCache();
    
    return analysis;
  } catch (error) {
    console.error('[LocalModelManager] Analysis failed or timed out:', error);
    // Return fallback result
    return {
      score: 50,
      quality: 'fair',
      summary: 'Analysis failed - fallback result',
      missingInfo: ['Analysis could not complete'],
      recommendations: ['Please try again or provide shorter text']
    };
  }
}

/**
 * Perform intelligent rule-based analysis with performance optimizations
 */
function performRuleBasedAnalysis(updateText: string): AnalysisResult {
  const text = updateText.toLowerCase();
  let score = 0;
  const missingInfo: string[] = [];
  const recommendations: string[] = [];

  // Performance optimization: batch regex operations
  const regexResults = {
    hasSpecificActions: /\b(will|going to|plan to|intend to|aim to)\b/.test(text),
    hasTimeline: /\b(today|tomorrow|next week|by|until|deadline)\b/.test(text),
    hasMetrics: /\b(percent|%|number|count|measure|target|goal)\b/.test(text),
    hasContext: /\b(because|due to|as a result|since|therefore|reason)\b/.test(text),
    hasImpact: /\b(impact|effect|consequence|result|outcome)\b/.test(text),
    hasStakeholders: /\b(team|stakeholder|user|customer|client|manager)\b/.test(text),
    hasProfessionalTone: !/\b(omg|wtf|lol|ugh|damn|shit)\b/.test(text),
    hasStructure: /\b(first|second|third|finally|in conclusion|summary)\b/.test(text),
    hasClarity: !/\b(thing|stuff|something|whatever|idk)\b/.test(text)
  };

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
  if (regexResults.hasSpecificActions && regexResults.hasTimeline && regexResults.hasMetrics) {
    score += 25;
  } else if (regexResults.hasSpecificActions && regexResults.hasTimeline) {
    score += 20;
  } else if (regexResults.hasSpecificActions) {
    score += 15;
  } else {
    score += 5;
    missingInfo.push('Specific actions and timeline needed');
  }

  // 3. Context and reasoning (0-25 points)
  if (regexResults.hasContext && regexResults.hasImpact && regexResults.hasStakeholders) {
    score += 25;
  } else if (regexResults.hasContext && regexResults.hasImpact) {
    score += 20;
  } else if (regexResults.hasContext) {
    score += 15;
  } else {
    score += 5;
    missingInfo.push('Context and reasoning needed');
  }

  // 4. Professional tone and structure (0-25 points)
  if (regexResults.hasProfessionalTone && regexResults.hasStructure && regexResults.hasClarity) {
    score += 25;
  } else if (regexResults.hasProfessionalTone && regexResults.hasClarity) {
    score += 20;
  } else if (regexResults.hasProfessionalTone) {
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
    if (!regexResults.hasSpecificActions) {
      recommendations.push('Include specific actions and next steps');
    }
    if (!regexResults.hasTimeline) {
      recommendations.push('Add timeline and deadlines');
    }
    if (!regexResults.hasContext) {
      recommendations.push('Explain the reasoning behind decisions');
    }
    if (!regexResults.hasImpact) {
      recommendations.push('Describe the impact and consequences');
    }
    if (!regexResults.hasStructure) {
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
