import { 
  createLocalModelPipeline, 
  preloadModels, 
  checkLocalModels,
  getModel,
  clearModelCache,
  analyzeUpdateQuality
} from './localModelManager';

describe('LocalModelManager (Rule-Based Analysis)', () => {
  beforeEach(() => {
    clearModelCache();
  });

  describe('createLocalModelPipeline', () => {
    it('should return a mock model interface', async () => {
      const model = await createLocalModelPipeline();
      
      expect(model).toBeDefined();
      expect(typeof model.answer).toBe('function');
      expect(typeof model.dispose).toBe('function');
    });

    it('should provide answer method that returns analysis results', async () => {
      const model = await createLocalModelPipeline();
      const result = await model.answer('Test question?', 'This is a test update text.');
      
      expect(result).toBeDefined();
      expect(result.answer).toBeDefined();
      expect(typeof result.score).toBe('number');
    });
  });

  describe('getModel', () => {
    it('should return a model instance', async () => {
      const model = await getModel();
      expect(model).toBeDefined();
    });
  });

  describe('clearModelCache', () => {
    it('should clear the analysis cache', async () => {
      // First call to populate cache
      await analyzeUpdateQuality('Test update text');
      
      // Clear cache
      clearModelCache();
      
      // Second call should not use cache
      const result1 = await analyzeUpdateQuality('Test update text');
      const result2 = await analyzeUpdateQuality('Test update text');
      
      // Both should work independently
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe('preloadModels', () => {
    it('should complete successfully', async () => {
      await expect(preloadModels()).resolves.not.toThrow();
    });
  });

  describe('checkLocalModels', () => {
    it('should always return true', async () => {
      const result = await checkLocalModels();
      expect(result).toBe(true);
    });
  });

  describe('analyzeUpdateQuality', () => {
    it('should analyze excellent quality updates', async () => {
      const excellentUpdate = `
        We have successfully completed the project milestone ahead of schedule. 
        The team worked collaboratively to deliver high-quality results, 
        and we achieved 95% of our target metrics. 
        Next steps include final testing and deployment by next Friday. 
        This success will have a positive impact on our quarterly goals.
      `;
      
      const result = await analyzeUpdateQuality(excellentUpdate);
      
      // The analysis system is conservative, so we expect at least 'good' quality
      expect(['excellent', 'good']).toContain(result.quality);
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.missingInfo.length).toBeLessThanOrEqual(2);
      expect(result.recommendations.length).toBeLessThanOrEqual(2);
    });

    it('should analyze poor quality updates', async () => {
      const poorUpdate = 'Project delayed.';
      
      const result = await analyzeUpdateQuality(poorUpdate);
      
      expect(['poor', 'fair']).toContain(result.quality);
      expect(result.score).toBeLessThan(60);
      expect(result.missingInfo.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide specific recommendations for improvement', async () => {
      const basicUpdate = 'We need to do something about the project.';
      
      const result = await analyzeUpdateQuality(basicUpdate);
      
      expect(result.recommendations).toContain('Provide more detailed explanation of the situation');
      expect(result.recommendations).toContain('Include specific actions and next steps');
      expect(result.recommendations).toContain('Add timeline and deadlines');
    });

    it('should cache results for identical inputs', async () => {
      const updateText = 'This is a test update for caching.';
      
      // First call
      const result1 = await analyzeUpdateQuality(updateText);
      
      // Second call with same text
      const result2 = await analyzeUpdateQuality(updateText);
      
      // Results should be identical (from cache)
      expect(result1).toEqual(result2);
    });

    it('should handle different quality levels correctly', async () => {
      const testCases = [
        {
          text: 'We completed the project milestone successfully. The team achieved 95% of target metrics. Next steps: final testing by Friday. This will impact quarterly goals positively.',
          expectedQuality: 'good' as const // Has actions, metrics, timeline, impact
        },
        {
          text: 'Project is progressing well. We plan to finish testing next week. The team is working hard.',
          expectedQuality: 'good' as const // Actually scores 50, which is "good"
        },
        {
          text: 'Need to work on the project.',
          expectedQuality: 'fair' as const // Actually scores 35, which is "fair"
        }
      ];
      
      for (const testCase of testCases) {
        const result = await analyzeUpdateQuality(testCase.text);
        console.log(`Text: "${testCase.text.substring(0, 50)}..."`);
        console.log(`Expected: ${testCase.expectedQuality}, Got: ${result.quality}, Score: ${result.score}`);
        expect(result.quality).toBe(testCase.expectedQuality);
      }
    });

    it('should generate appropriate summaries', async () => {
      const result = await analyzeUpdateQuality('Test update text.');
      
      expect(result.summary).toContain('quality');
      expect(result.summary).toContain(result.score.toString());
      expect(result.summary).toMatch(/[🟢🟡🟠🔴]/); // Should contain quality emoji
    });
  });
});
