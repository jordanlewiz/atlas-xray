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
  checkLocalModels 
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
    
    // Mock successful model creation - return a callable function
    const mockModel = jest.fn().mockResolvedValue({
      answer: 'test answer',
      score: 0.95
    });
    mockModel.dispose = jest.fn();
    mockPipeline.mockResolvedValue(mockModel);
  });

  describe('createLocalModelPipeline', () => {
    it('should configure environment for local models only', async () => {
      await createLocalModelPipeline();
      
      expect(mockEnv.cacheDir).toBe('./models_cache');
      expect(mockEnv.allowLocalModels).toBe(true);
      expect(mockEnv.allowRemoteModels).toBe(false);
      expect(mockEnv.localModelPath).toBe('./models_cache');
    });

    it('should try to load models with local_files_only=true', async () => {
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

  describe('Model Configuration', () => {
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
