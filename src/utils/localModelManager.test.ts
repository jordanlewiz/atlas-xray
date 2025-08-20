// Mock @xenova/transformers before importing
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn(),
  env: {
    backends: {
      onnx: {
        wasm: {
          wasmPaths: ''
        }
      }
    },
    cacheDir: '',
    allowLocalModels: false,
    allowRemoteModels: true,
    useBrowserCache: false,
    localModelPath: ''
  }
}));

import { 
  createLocalModelPipeline, 
  preloadModels, 
  checkLocalModels,
  getModel,
  clearModelCache
} from './localModelManager';

// Mock window.fetch for network interception tests
const mockFetch = jest.fn();
Object.defineProperty(global, 'fetch', {
  value: mockFetch,
  writable: true
});

describe('LocalModelManager', () => {
  let mockPipeline: jest.MockedFunction<any>;
  let mockEnv: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get references to mocked functions
    mockPipeline = require('@xenova/transformers').pipeline;
    mockEnv = require('@xenova/transformers').env;
    
    // Reset fetch mock
    mockFetch.mockClear();
    
    // Don't set default mock - let each test configure its own
  });

  describe('createLocalModelPipeline', () => {
    beforeEach(() => {
      clearModelCache();
    });

    it('should configure environment for local models only', async () => {
      // Mock successful model creation
      const mockModel = jest.fn().mockResolvedValue({
        answer: 'test answer',
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      mockPipeline.mockResolvedValue(mockModel);
      
      await createLocalModelPipeline();
      
      expect(mockEnv.cacheDir).toBe('./models_cache');
      expect(mockEnv.allowLocalModels).toBe(true);
      expect(mockEnv.allowRemoteModels).toBe(false);
      expect(mockEnv.localModelPath).toBe('./models_cache');
    });

    it('should try to load models with local_files_only=true', async () => {
      // Mock successful model creation
      const mockModel = jest.fn().mockResolvedValue({
        answer: 'test answer',
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      mockPipeline.mockResolvedValue(mockModel);
      
      await createLocalModelPipeline();
      
      expect(mockPipeline).toHaveBeenCalledWith(
        'question-answering',
        'Xenova/distilbert-base-cased-distilled-squad',
        expect.objectContaining({
          local_files_only: true,
          quantized: true,
          cache_dir: './models_cache'
        })
      );
    });

    it('should fall back to backup model if primary fails', async () => {
      // First call fails, second succeeds
      const backupModel = jest.fn().mockResolvedValue({
        answer: 'backup answer',
        score: 0.85
      });
      backupModel.dispose = jest.fn();
      
      mockPipeline
        .mockRejectedValueOnce(new Error('Primary model not found'))
        .mockResolvedValueOnce(backupModel);

      const result = await createLocalModelPipeline();
      
      expect(mockPipeline).toHaveBeenCalledTimes(2);
      expect(result).toBe(backupModel); // The function returns the model, not the result
    });

    it('should throw error if no local models are available', async () => {
      mockPipeline.mockRejectedValue(new Error('No models found'));
      
      await expect(createLocalModelPipeline()).rejects.toThrow(
        'No local models available. Run "npm run download:models" to download models locally.'
      );
    });

    it('should test model functionality before returning', async () => {
      const mockModel = jest.fn().mockResolvedValue({
        answer: 'test answer',
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      mockPipeline.mockResolvedValue(mockModel);
      
      const result = await createLocalModelPipeline();
      
      expect(result).toBe(mockModel);
    });

    it('should reject if model test fails', async () => {
      const mockModel = jest.fn().mockResolvedValue({
        answer: '', // Empty answer should fail test
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      mockPipeline.mockResolvedValue(mockModel);
      
      await expect(createLocalModelPipeline()).rejects.toThrow(
        'Model test failed - no answer generated'
      );
    });
  });

  describe('preloadModels', () => {
    beforeEach(() => {
      clearModelCache();
    });

    it('should call createLocalModelPipeline and dispose model', async () => {
      const mockModel = jest.fn().mockResolvedValue({
        answer: 'test answer',
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      mockPipeline.mockResolvedValue(mockModel);
      
      await preloadModels();
      
      expect(mockModel.dispose).toHaveBeenCalled();
    });

    it('should not throw if preloading fails', async () => {
      mockPipeline.mockRejectedValue(new Error('Preload failed'));
      
      await expect(preloadModels()).resolves.not.toThrow();
    });
  });

  describe('checkLocalModels', () => {
    beforeEach(() => {
      clearModelCache();
    });

    it('should return true if local models are available', async () => {
      const mockModel = jest.fn().mockResolvedValue({
        answer: 'test answer',
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      mockPipeline.mockResolvedValue(mockModel);
      
      const result = await checkLocalModels();
      
      expect(result).toBe(true);
    });

    it('should return false if local models are not available', async () => {
      mockPipeline.mockRejectedValue(new Error('No models found'));
      
      const result = await checkLocalModels();
      
      expect(result).toBe(false);
    });

    it('should use correct configuration for checking', async () => {
      const mockModel = jest.fn().mockResolvedValue({
        answer: 'test answer',
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      mockPipeline.mockResolvedValue(mockModel);
      
      await checkLocalModels();
      
      expect(mockPipeline).toHaveBeenCalledWith(
        'question-answering',
        'Xenova/distilbert-base-cased-distilled-squad',
        expect.objectContaining({
          local_files_only: true,
          quantized: true,
          cache_dir: './models_cache'
        })
      );
    });
  });

  describe('Network Interception', () => {
    it('should warn about unexpected huggingface.co requests', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Simulate a network request
      mockFetch.mockResolvedValueOnce({ text: () => Promise.resolve('HTML content') });
      
      await createLocalModelPipeline();
      
      // Trigger a fetch call
      await fetch('https://huggingface.co/test');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ Unexpected network request detected:',
        'https://huggingface.co/test'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Model Caching', () => {
    beforeEach(() => {
      // Clear model cache before each test
      clearModelCache();
    });

    it('should only load model once and cache it for subsequent calls', async () => {
      const mockModel = jest.fn().mockResolvedValue({
        answer: 'test answer',
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      mockPipeline.mockResolvedValue(mockModel);
      
      // First call should load the model
      const result1 = await createLocalModelPipeline();
      expect(mockPipeline).toHaveBeenCalledTimes(1);
      expect(result1).toBe(mockModel);
      
      // Second call should return cached model without calling pipeline again
      const result2 = await createLocalModelPipeline();
      expect(mockPipeline).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(result2).toBe(mockModel); // Same instance
      expect(result1).toBe(result2); // Exact same object
    });

    it('should use getModel() to return cached model without logging', async () => {
      const mockModel = jest.fn().mockResolvedValue({
        answer: 'test answer',
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      mockPipeline.mockResolvedValue(mockModel);
      
      // First load the model
      await createLocalModelPipeline();
      expect(mockPipeline).toHaveBeenCalledTimes(1);
      
      // getModel should return cached model without additional pipeline calls
      const cachedResult = await getModel();
      expect(mockPipeline).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(cachedResult).toBe(mockModel);
    });

    it('should handle concurrent model loading requests', async () => {
      const mockModel = jest.fn().mockResolvedValue({
        answer: 'test answer',
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      
      // Add delay to simulate loading time
      mockPipeline.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockModel), 100))
      );
      
      // Start multiple concurrent requests
      const promises = [
        createLocalModelPipeline(),
        createLocalModelPipeline(),
        createLocalModelPipeline(),
        getModel(),
        getModel()
      ];
      
      const results = await Promise.all(promises);
      
      // Should only call pipeline once despite multiple concurrent requests
      expect(mockPipeline).toHaveBeenCalledTimes(1);
      
      // All results should be the same model instance
      results.forEach(result => {
        expect(result).toBe(mockModel);
      });
    });

    it('should clear cache and reload model when clearModelCache is called', async () => {
      const mockModel1 = jest.fn().mockResolvedValue({
        answer: 'test answer 1',
        score: 0.95
      });
      mockModel1.dispose = jest.fn();
      
      const mockModel2 = jest.fn().mockResolvedValue({
        answer: 'test answer 2',
        score: 0.90
      });
      mockModel2.dispose = jest.fn();
      
      mockPipeline
        .mockResolvedValueOnce(mockModel1)
        .mockResolvedValueOnce(mockModel2);
      
      // First load
      const result1 = await createLocalModelPipeline();
      expect(result1).toBe(mockModel1);
      expect(mockPipeline).toHaveBeenCalledTimes(1);
      
      // Second call should return cached model
      const result2 = await createLocalModelPipeline();
      expect(result2).toBe(mockModel1); // Same as first
      expect(mockPipeline).toHaveBeenCalledTimes(1);
      
      // Clear cache
      clearModelCache();
      
      // Next call should load a new model
      const result3 = await createLocalModelPipeline();
      expect(result3).toBe(mockModel2); // Different model
      expect(mockPipeline).toHaveBeenCalledTimes(2); // Second call to pipeline
    });

    it('should reset loading state if model loading fails', async () => {
      // Clear cache to start fresh
      clearModelCache();
      
      // Mock the first call to fail, second to succeed
      const mockModel = jest.fn().mockResolvedValue({
        answer: 'success',
        score: 0.95
      });
      mockModel.dispose = jest.fn();
      
      // First attempt: fail all pipeline calls (primary + fallback models)
      mockPipeline
        .mockRejectedValueOnce(new Error('Primary model failed'))
        .mockRejectedValueOnce(new Error('Fallback model 1 failed'))
        .mockRejectedValueOnce(new Error('Fallback model 2 failed'))
        // Second attempt: succeed
        .mockResolvedValueOnce(mockModel);
      
      // First call should fail
      await expect(createLocalModelPipeline()).rejects.toThrow();
      
      // Clear cache again to force a fresh load attempt
      clearModelCache();
      
      // Second call should succeed (loading state should be reset)
      const result = await createLocalModelPipeline();
      expect(result).toBeDefined();
      expect(mockPipeline).toHaveBeenCalledTimes(4); // 3 failed + 1 successful
    });
  });

  describe('Model Configuration', () => {
    beforeEach(() => {
      clearModelCache();
    });

    it('should try all configured models in order', async () => {
      mockPipeline.mockRejectedValue(new Error('Model failed'));
      
      try {
        await createLocalModelPipeline();
      } catch (error) {
        // Expected to fail
      }
      
      expect(mockPipeline).toHaveBeenCalledWith(
        'question-answering',
        'Xenova/distilbert-base-cased-distilled-squad',
        expect.any(Object)
      );
      
      expect(mockPipeline).toHaveBeenCalledWith(
        'question-answering',
        'Xenova/distilbert-base-uncased-distilled-squad',
        expect.any(Object)
      );
    });

    it('should use consistent configuration for all models', async () => {
      mockPipeline.mockRejectedValue(new Error('Model failed'));
      
      try {
        await createLocalModelPipeline();
      } catch (error) {
        // Expected to fail
      }
      
      const calls = mockPipeline.mock.calls;
      calls.forEach(call => {
        expect(call[2]).toEqual(expect.objectContaining({
          local_files_only: true,
          quantized: true,
          cache_dir: './models_cache'
        }));
      });
    });
  });
});
