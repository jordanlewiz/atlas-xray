import { renderHook, act } from '@testing-library/react';
import { useUpdateQuality } from './useUpdateQuality';

// Mock all external dependencies
jest.mock('dexie-react-hooks', () => ({
  useLiveQuery: jest.fn()
}));

jest.mock('../utils/database', () => ({
  db: {
    projectUpdates: {
      toArray: jest.fn(),
      update: jest.fn()
    }
  }
}));

jest.mock('../utils/updateQualityAnalyzer', () => ({
  analyzeUpdateQuality: jest.fn()
}));

jest.mock('../utils/localModelManager', () => ({
  preloadModels: jest.fn().mockResolvedValue(undefined)
}));

describe('useUpdateQuality', () => {
  const { useLiveQuery } = require('dexie-react-hooks');
  const { analyzeUpdateQuality } = require('../utils/updateQualityAnalyzer');
  const { db } = require('../utils/database');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useLiveQuery to return test data
    (useLiveQuery as jest.Mock)
      .mockReturnValueOnce([ // First call for updates
        {
          id: 'update1',
          projectKey: 'PROJ1',
          summary: 'Test update 1',
          details: 'This is a test update',
          state: 'on_track',
          creationDate: '2024-01-01',
          updateQuality: null
        },
        {
          id: 'update2',
          projectKey: 'PROJ2',
          summary: 'Test update 2',
          details: 'This is another test update',
          state: 'off_track',
          creationDate: '2024-01-02',
          updateQuality: JSON.stringify({
            overallScore: 85,
            qualityLevel: 'good',
            analysis: [],
            missingInfo: [],
            recommendations: [],
            summary: 'Good update',
            timestamp: new Date().toISOString()
          })
        }
      ])
      .mockReturnValueOnce({}); // Second call for qualityData (initially empty)
  });

  describe('UI Synchronization', () => {
    it('should trigger UI updates across multiple hook instances', async () => {
      // Render two separate instances of the hook
      const { result: hook1 } = renderHook(() => useUpdateQuality());
      const { result: hook2 } = renderHook(() => useUpdateQuality());

      const mockQualityResult = {
        overallScore: 95,
        qualityLevel: 'excellent',
        analysis: [],
        missingInfo: [],
        recommendations: [],
        summary: 'Excellent update',
        timestamp: new Date()
      };

      analyzeUpdateQuality.mockResolvedValue(mockQualityResult);
      db.projectUpdates.update.mockResolvedValue(1);

      const testUpdate = {
        id: 'update1',
        projectKey: 'PROJ1',
        summary: 'Test update',
        details: 'Test details',
        state: 'on_track',
        creationDate: '2024-01-01'
      };

      // Get initial updateTrigger values
      const initialTrigger1 = hook1.current.updateTrigger;
      const initialTrigger2 = hook2.current.updateTrigger;

      // Analyze update from first hook
      await act(async () => {
        await hook1.current.analyzeUpdate(testUpdate);
      });

      // Both hooks should have their updateTrigger incremented
      expect(hook1.current.updateTrigger).toBeGreaterThan(initialTrigger1);
      expect(hook2.current.updateTrigger).toBeGreaterThan(initialTrigger2);
    });

    it('should maintain separate state for each hook instance', async () => {
      const { result: hook1 } = renderHook(() => useUpdateQuality());
      const { result: hook2 } = renderHook(() => useUpdateQuality());

      // Each hook should have its own state
      expect(hook1.current.isAnalyzing).toBe(false);
      expect(hook2.current.isAnalyzing).toBe(false);

      // Mock the analysis function to return a result
      const mockQualityResult = {
        overallScore: 90,
        qualityLevel: 'excellent',
        analysis: [],
        missingInfo: [],
        recommendations: [],
        summary: 'Excellent update',
        timestamp: new Date()
      };
      analyzeUpdateQuality.mockResolvedValue(mockQualityResult);
      db.projectUpdates.update.mockResolvedValue(1);

      // Start analysis on first hook
      await act(async () => {
        await hook1.current.analyzeUpdate({
          id: 'update1',
          projectKey: 'PROJ1',
          summary: 'Test update',
          details: 'Test details',
          state: 'on_track',
          creationDate: '2024-01-01'
        });
      });

      // Both hooks should still have isAnalyzing as false since analyzeUpdate doesn't set it
      // The analyzeUpdate function is designed for individual updates, not batch processing
      expect(hook1.current.isAnalyzing).toBe(false);
      expect(hook2.current.isAnalyzing).toBe(false);
    });
  });

  describe('Quality Analysis', () => {
    it('should analyze an update and store results', async () => {
      const mockQualityResult = {
        overallScore: 90,
        qualityLevel: 'excellent',
        analysis: [],
        missingInfo: [],
        recommendations: [],
        summary: 'Excellent update',
        timestamp: new Date()
      };

      analyzeUpdateQuality.mockResolvedValue(mockQualityResult);
      db.projectUpdates.update.mockResolvedValue(1);

      const { result } = renderHook(() => useUpdateQuality());

      const testUpdate = {
        id: 'update1',
        projectKey: 'PROJ1',
        summary: 'Test update',
        details: 'Test details',
        state: 'on_track',
        creationDate: '2024-01-01'
      };

      await act(async () => {
        await result.current.analyzeUpdate(testUpdate);
      });

      expect(analyzeUpdateQuality).toHaveBeenCalledWith(
        'Test update Test details',
        'on_track',
        'on_track'
      );

      expect(db.projectUpdates.update).toHaveBeenCalledWith('update1', {
        updateQuality: JSON.stringify(mockQualityResult)
      });
    });

    it('should handle analysis errors gracefully', async () => {
      const error = new Error('Analysis failed');
      analyzeUpdateQuality.mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateQuality());

      const testUpdate = {
        id: 'update1',
        projectKey: 'PROJ1',
        summary: 'Test update',
        details: 'Test details',
        state: 'on_track',
        creationDate: '2024-01-01'
      };

      // Mock console.error to avoid test noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => {
        await result.current.analyzeUpdate(testUpdate);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to analyze update update1:', error);
      consoleSpy.mockRestore();
    });

    it('should skip analysis for updates without text content', async () => {
      const { result } = renderHook(() => useUpdateQuality());

      const testUpdate = {
        id: 'update1',
        projectKey: 'PROJ1',
        summary: '',
        details: '',
        state: 'on_track',
        creationDate: '2024-01-01'
      };

      // Mock console.warn to avoid test noise
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await act(async () => {
        await result.current.analyzeUpdate(testUpdate);
      });

      expect(analyzeUpdateQuality).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Update update1 has no text content to analyze');
      consoleSpy.mockRestore();
    });
  });

  describe('Model Preloading', () => {
    it('should attempt to preload models on initialization', async () => {
      const { result } = renderHook(() => useUpdateQuality());

      // Wait for the effect to complete
      await act(async () => {
        // Small delay to allow useEffect to run
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.modelsPreloaded).toBe(true);
    });

    it('should handle model preloading failures gracefully', async () => {
      // Mock preloadModels to fail
      const { preloadModels } = require('../utils/localModelManager');
      preloadModels.mockRejectedValue(new Error('Model loading failed'));

      const { result } = renderHook(() => useUpdateQuality());

      // Wait for the effect to complete
      await act(async () => {
        // Small delay to allow useEffect to run
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.modelsPreloaded).toBe(false);
    });
  });
});
