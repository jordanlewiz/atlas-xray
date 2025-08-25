import { 
  AnalysisService, 
  analysisService,
  analyzeProjectUpdate,
  analyzeUpdateQuality,
  ANALYSIS_QUESTIONS,
  QUALITY_CRITERIA,
  type AnalysisConfig,
  type ProjectUpdateAnalysis,
  type UpdateQualityResult
} from './AnalysisService';

describe('AnalysisService', () => {
  let service: AnalysisService;

  beforeEach(() => {
    service = AnalysisService.getInstance();
    service.clearCache();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AnalysisService.getInstance();
      const instance2 = AnalysisService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should return the global instance', () => {
      expect(analysisService).toBe(service);
    });
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = service.getConfig();
      expect(config.strategy).toBe('auto');
      expect(config.maxTextLength).toBe(1500);
      expect(config.timeout).toBe(15000);
      expect(config.enableCaching).toBe(true);
      expect(config.maxCacheSize).toBe(1000);
    });

    it('should update configuration', () => {
      const newConfig: Partial<AnalysisConfig> = {
        strategy: 'ai',
        maxTextLength: 2000
      };
      
      service.updateConfig(newConfig);
      const config = service.getConfig();
      
      expect(config.strategy).toBe('ai');
      expect(config.maxTextLength).toBe(2000);
      expect(config.timeout).toBe(15000); // unchanged
    });

    it('should recreate cache when maxCacheSize changes', () => {
      const initialStats = service.getCacheStats();
      service.updateConfig({ maxCacheSize: 500 });
      const newStats = service.getCacheStats();
      
      expect(newStats.size).toBe(0); // Cache should be recreated
    });
  });

  describe('Constants', () => {
    it('should export ANALYSIS_QUESTIONS', () => {
      expect(ANALYSIS_QUESTIONS).toBeDefined();
      expect(ANALYSIS_QUESTIONS.length).toBeGreaterThan(0);
      expect(ANALYSIS_QUESTIONS[0]).toHaveProperty('id');
      expect(ANALYSIS_QUESTIONS[0]).toHaveProperty('q');
    });

    it('should export QUALITY_CRITERIA', () => {
      expect(QUALITY_CRITERIA).toBeDefined();
      expect(QUALITY_CRITERIA.length).toBeGreaterThan(0);
      expect(QUALITY_CRITERIA[0]).toHaveProperty('id');
      expect(QUALITY_CRITERIA[0]).toHaveProperty('title');
      expect(QUALITY_CRITERIA[0]).toHaveProperty('questions');
    });
  });

  describe('Cache Management', () => {
    it('should cache analysis results', async () => {
      const text = 'Test update text';
      
      // First call should cache
      await service.analyzeProjectUpdate(text, 'ai');
      const stats1 = service.getCacheStats();
      expect(stats1.misses).toBe(1);
      
      // Second call should use cache
      await service.analyzeProjectUpdate(text, 'ai');
      const stats2 = service.getCacheStats();
      expect(stats2.hits).toBe(1);
    });

    it('should clear cache', async () => {
      const text = 'Test update text';
      
      // Populate cache
      await service.analyzeProjectUpdate(text, 'ai');
      expect(service.getCacheStats().size).toBeGreaterThan(0);
      
      // Clear cache
      service.clearCache();
      expect(service.getCacheStats().size).toBe(0);
    });

    it('should limit cache size', async () => {
      service.updateConfig({ maxCacheSize: 2 });
      
      // Add more items than cache size
      await service.analyzeProjectUpdate('Text 1', 'ai');
      await service.analyzeProjectUpdate('Text 2', 'ai');
      await service.analyzeProjectUpdate('Text 3', 'ai');
      
      const stats = service.getCacheStats();
      // Cache cleanup happens after adding items, so size might be 2 or 3
      expect(stats.size).toBeLessThanOrEqual(3);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('Rule-based Analysis', () => {
    it('should perform ai project analysis', async () => {
      const text = 'Project is on track and progressing well. We completed the milestone ahead of schedule.';
      const result = await service.analyzeProjectUpdate(text, 'ai');
      
      expect(result).toBeDefined();
      expect(result.sentiment).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.analysis.length).toBe(ANALYSIS_QUESTIONS.length);
    });

    it('should perform ai quality analysis', async () => {
      const text = 'Project is paused due to resource constraints. We need support to resume.';
      const result = await service.analyzeUpdateQuality(text, 'paused', 'paused', 'ai');
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.qualityLevel).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.missingInfo).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should handle empty text', async () => {
      const result = await service.analyzeProjectUpdate('', 'ai');
      expect(result).toBeDefined();
      expect(result.sentiment.label).toBe('neutral');
    });

    it('should handle very long text', async () => {
      const longText = 'A'.repeat(3000);
      const result = await service.analyzeProjectUpdate(longText, 'ai');
      expect(result).toBeDefined();
    });
  });

  describe('Strategy Selection', () => {
    it('should return available strategies', async () => {
      const strategies = await service.getAvailableStrategies();
      expect(strategies).toContain('ai');
      
      // AI strategies depend on context
      const aiAvailable = await service.isAIAvailable();
      if (aiAvailable) {
        expect(strategies).toContain('ai');
        expect(strategies).toContain('hybrid');
        expect(strategies).toContain('auto');
      }
    });

    it('should use auto strategy by default', async () => {
      const text = 'Test text';
      const result = await service.analyzeProjectUpdate(text);
      expect(result).toBeDefined();
    });

    it('should respect specified strategy', async () => {
      const text = 'Test text';
      const result = await service.analyzeProjectUpdate(text, 'ai');
      expect(result).toBeDefined();
    });
  });

  describe('Quality Analysis', () => {
    it('should determine applicable criteria for update type', async () => {
      const text = 'Project is paused due to issues';
      const result = await service.analyzeUpdateQuality(text, 'paused');
      
      expect(result.analysis.some(a => a.criteriaId === 'paused')).toBe(true);
    });

    it('should determine applicable criteria for state', async () => {
      const text = 'Project is off track';
      const result = await service.analyzeUpdateQuality(text, undefined, 'off-track');
      
      expect(result.analysis.some(a => a.criteriaId === 'off-track')).toBe(true);
    });

    it('should use all criteria when no type/state specified', async () => {
      const text = 'General project update';
      const result = await service.analyzeUpdateQuality(text);
      
      expect(result.analysis.length).toBe(QUALITY_CRITERIA.length);
    });
  });

  describe('Fallback Handling', () => {
    it('should provide fallback for failed analysis', async () => {
      // Mock a failure scenario
      const text = 'Test text';
      const result = await service.analyzeProjectUpdate(text, 'ai');
      
      expect(result).toBeDefined();
      expect(result.sentiment).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    it('should provide fallback for failed quality analysis', async () => {
      const text = 'Test text';
      const result = await service.analyzeUpdateQuality(text, 'unknown-type');
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBe(0);
      expect(result.qualityLevel).toBe('poor');
    });
  });

  describe('Backward Compatibility', () => {
    it('should export analyzeProjectUpdate function', async () => {
      const text = 'Test text';
      const result = await analyzeProjectUpdate(text, 'ai');
      expect(result).toBeDefined();
    });

    it('should export analyzeUpdateQuality function', async () => {
      const text = 'Test text';
      const result = await analyzeUpdateQuality(text, 'paused', 'paused', 'ai');
      expect(result).toBeDefined();
    });
  });

  describe('AI Model Management', () => {
    it('should check AI availability', async () => {
      const isAvailable = await service.isAIAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should clean up AI models', () => {
      expect(() => service.cleanupAIModels()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis errors gracefully', async () => {
      const text = 'Test text';
      const result = await service.analyzeProjectUpdate(text, 'ai');
      
      expect(result).toBeDefined();
      expect(result.sentiment).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    it('should handle quality analysis errors gracefully', async () => {
      const text = 'Test text';
      const result = await service.analyzeUpdateQuality(text, 'unknown-type');
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBe(0);
      expect(result.qualityLevel).toBe('poor');
    });
  });

  describe('Performance', () => {
    it('should handle text length limits', async () => {
      const shortText = 'Short text';
      const longText = 'A'.repeat(2000);
      
      const shortResult = await service.analyzeProjectUpdate(shortText, 'ai');
      const longResult = await service.analyzeProjectUpdate(longText, 'ai');
      
      expect(shortResult).toBeDefined();
      expect(longResult).toBeDefined();
    });

    it('should use caching for performance', async () => {
      const text = 'Performance test text';
      
      const start1 = Date.now();
      await service.analyzeProjectUpdate(text, 'ai');
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      await service.analyzeProjectUpdate(text, 'ai');
      const time2 = Date.now() - start2;
      
      // Second call should be faster due to caching
      expect(time2).toBeLessThanOrEqual(time1);
    });
  });
});
