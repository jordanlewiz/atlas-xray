import { Corpus, Document } from 'tiny-tfidf';

export interface QualityAnalysisResult {
  overallScore: number;
  qualityLevel: 'excellent' | 'good' | 'fair' | 'poor';
  summary: string;
  missingInfo: string[];
  recommendations: string[];
}

export class LightweightAnalysisService {
  private corpus: Corpus;
  private qualityKeywords: string[];
  private documentNames: string[];
  private documentTexts: string[];

  constructor() {
    // Initialize with quality-related training data
    this.qualityKeywords = [
      'bug', 'fix', 'feature', 'update', 'release', 'deploy', 'test', 'code',
      'refactor', 'optimize', 'performance', 'security', 'documentation',
      'api', 'database', 'frontend', 'backend', 'integration', 'monitoring',
      'error', 'exception', 'logging', 'metrics', 'analytics', 'user experience',
      'accessibility', 'testing', 'unit test', 'integration test', 'e2e test',
      'code review', 'pull request', 'merge', 'conflict', 'resolution'
    ];

    // Store document names and texts for reuse
    this.documentNames = [
      'high_quality_1',
      'high_quality_2', 
      'high_quality_3',
      'medium_quality_1',
      'medium_quality_2',
      'low_quality_1',
      'low_quality_2'
    ];
    
    this.documentTexts = [
      'Implemented comprehensive unit testing for the new API endpoints. Added proper error handling and logging. Performance improved by 25% through database query optimization.',
      'Fixed critical security vulnerability in authentication module. Added input validation and sanitization. Updated documentation with usage examples.',
      'Refactored legacy code to improve maintainability. Added comprehensive error handling. Performance metrics show 15% improvement in response times.',
      'Updated the user interface with new features. Fixed some bugs and improved performance.',
      'Added new functionality to the system. Made some improvements to existing code.',
      'Made changes to fix issues.',
      'Updated something.'
    ];
    
    this.corpus = new Corpus(this.documentNames, this.documentTexts);
  }

  async analyzeUpdateQuality(updateText: string): Promise<QualityAnalysisResult> {
    try {
      console.log('[LightweightAnalysisService] 🔍 Starting lightweight quality analysis...');
      
      // Create a new corpus with training data plus the new document
      const allNames = [
        ...this.documentNames,
        'current_update'
      ];
      
      const allTexts = [
        ...this.documentTexts,
        updateText
      ];
      
      // Create a temporary corpus for this analysis
      const tempCorpus = new Corpus(allNames, allTexts);
      
      // Calculate quality score based on keyword presence
      const qualityScores = this.qualityKeywords.map(keyword => {
        const hasKeyword = updateText.toLowerCase().includes(keyword.toLowerCase());
        return { keyword, score: hasKeyword ? 1 : 0 };
      }).filter(item => item.score > 0);
      
      // Calculate overall quality score based on multiple factors
      let overallScore = 0;
      
      // Factor 1: Presence of quality keywords (40% weight)
      const keywordScore = Math.min(100, (qualityScores.length / this.qualityKeywords.length) * 100);
      overallScore += keywordScore * 0.4;
      
      // Factor 2: Text length and structure (30% weight)
      const words = updateText.split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;
      const lengthScore = Math.min(100, Math.max(0, (wordCount - 5) * 2)); // 5 words = 0, 55+ words = 100
      overallScore += lengthScore * 0.3;
      
      // Factor 3: Technical content (20% weight)
      const technicalTerms = ['api', 'database', 'bug', 'fix', 'feature', 'test', 'code', 'refactor', 'performance', 'security'];
      const technicalScore = technicalTerms.filter(term => 
        updateText.toLowerCase().includes(term)
      ).length / technicalTerms.length * 100;
      overallScore += technicalScore * 0.2;
      
      // Factor 4: Specificity and metrics (10% weight)
      const hasMetrics = /\d+%|\d+ms|\d+KB|\d+MB|\d+\.\d+/.test(updateText);
      const specificityScore = hasMetrics ? 100 : 50;
      overallScore += specificityScore * 0.1;
      
      // Ensure score is within bounds
      overallScore = Math.max(0, Math.min(100, Math.round(overallScore)));
      
      // Determine quality level
      let qualityLevel: 'excellent' | 'good' | 'fair' | 'poor';
      if (overallScore >= 80) qualityLevel = 'excellent';
      else if (overallScore >= 60) qualityLevel = 'good';
      else if (overallScore >= 40) qualityLevel = 'fair';
      else qualityLevel = 'poor';
      
      // Generate summary
      const summary = this.generateSummary(overallScore, qualityScores, wordCount, technicalScore, hasMetrics);
      
      // Identify missing information
      const missingInfo = this.identifyMissingInfo(updateText, qualityScores);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(overallScore, missingInfo);
      
      console.log(`[LightweightAnalysisService] ✅ Analysis complete - Score: ${overallScore}% (${qualityLevel})`);
      
      return {
        overallScore,
        qualityLevel,
        summary,
        missingInfo,
        recommendations
      };
      
    } catch (error: any) {
      console.error('[LightweightAnalysisService] ❌ Analysis failed:', error);
      throw new Error(`Lightweight analysis failed: ${error?.message || 'Unknown error'}`);
    }
  }

  private generateSummary(score: number, qualityScores: any[], wordCount: number, technicalScore: number, hasMetrics: boolean): string {
    const parts = [];
    
    if (score >= 80) {
      parts.push('Excellent update with comprehensive details');
    } else if (score >= 60) {
      parts.push('Good update with solid information');
    } else if (score >= 40) {
      parts.push('Fair update with room for improvement');
    } else {
      parts.push('Basic update that could benefit from more detail');
    }
    
    if (qualityScores.length > 0) {
      const topKeywords = qualityScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(item => item.keyword);
      parts.push(`Covers key areas: ${topKeywords.join(', ')}`);
    }
    
    if (wordCount > 20) {
      parts.push('Provides substantial detail');
    } else if (wordCount < 10) {
      parts.push('Could use more explanation');
    }
    
    if (hasMetrics) {
      parts.push('Includes measurable outcomes');
    }
    
    return parts.join('. ') + '.';
  }

  private identifyMissingInfo(updateText: string, qualityScores: any[]): string[] {
    const missing = [];
    const text = updateText.toLowerCase();
    
    if (!text.includes('test') && !text.includes('testing')) {
      missing.push('Testing information');
    }
    
    if (!text.includes('performance') && !text.includes('speed') && !text.includes('optimization')) {
      missing.push('Performance impact details');
    }
    
    if (!text.includes('security') && !text.includes('vulnerability') && !text.includes('authentication')) {
      missing.push('Security considerations');
    }
    
    if (!text.includes('documentation') && !text.includes('docs') && !text.includes('guide')) {
      missing.push('Documentation updates');
    }
    
    if (!text.includes('rollback') && !text.includes('backup') && !text.includes('recovery')) {
      missing.push('Rollback/recovery plan');
    }
    
    return missing;
  }

  private generateRecommendations(score: number, missingInfo: string[]): string[] {
    const recommendations = [];
    
    if (score < 60) {
      recommendations.push('Consider adding more technical details about the implementation');
      recommendations.push('Include specific metrics or performance improvements');
    }
    
    if (missingInfo.length > 0) {
      recommendations.push(`Address missing areas: ${missingInfo.join(', ')}`);
    }
    
    if (score < 40) {
      recommendations.push('Provide more context about the problem being solved');
      recommendations.push('Include code examples or configuration changes');
    }
    
    return recommendations;
  }

  // Test function to verify the service works
  async testAnalysis(): Promise<boolean> {
    try {
      const testText = 'This is a test update for quality analysis';
      const result = await this.analyzeUpdateQuality(testText);
      console.log('[LightweightAnalysisService] 🧪 Test analysis result:', result);
      return true;
    } catch (error) {
      console.error('[LightweightAnalysisService] ❌ Test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const lightweightAnalysisService = new LightweightAnalysisService();
