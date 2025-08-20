import { pipeline, env } from '@xenova/transformers';

// Local model configuration
const LOCAL_MODELS = [
  'Xenova/distilbert-base-cased-distilled-squad',
  'Xenova/distilbert-base-uncased-distilled-squad'
];

// Monitor for unexpected network requests (should not happen with local models)
function setupNetworkInterception() {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('huggingface.co')) {
        console.warn('⚠️ Unexpected network request detected:', url);
        console.warn('   This should not happen with local models. Check configuration.');
      }
      return originalFetch.apply(this, args);
    };
    console.log('🔍 Network monitoring enabled');
  }
}

// Set up local model configuration
function configureLocalModels() {
  // Enable network interception to see exactly what URLs are hit
  setupNetworkInterception();
  
  // Configure environment for LOCAL models only (no CDN dependency)
  env.backends.onnx.wasm.wasmPaths = './node_modules/@xenova/transformers/dist/';
  env.cacheDir = './models_cache'; // Use our downloaded models directory
  env.allowLocalModels = true;
  env.allowRemoteModels = false; // Force local only - no CDN requests!
  env.useBrowserCache = true;
  
  console.log('🏠 Local-only model environment configured');
  console.log('   Cache directory:', env.cacheDir);
  console.log('   Remote models:', env.allowRemoteModels ? 'ENABLED' : 'DISABLED');
  console.log('   Local models:', env.allowLocalModels ? 'ENABLED' : 'DISABLED');
  console.log('🔒 CDN requests are BLOCKED - using local models only');
}

/**
 * Create a local model pipeline with fallback options
 */
export async function createLocalModelPipeline(): Promise<any> {
  console.log('🏠 Attempting to create local model pipeline...');
  
  // Configure environment first
  configureLocalModels();
  
  // First, try to use our locally downloaded models
  try {
    console.log('🔍 Attempting to use locally downloaded models...');
    const localModel = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad', {
      local_files_only: true, // Force local only
      quantized: true,
      cache_dir: './models_cache' // Use our models directory
    });
    
    // Test the local model
    const testResult = await localModel('Test?', 'Test context.');
    if (testResult && testResult.answer) {
      console.log('✅ Local model working successfully!');
      return localModel;
    }
  } catch (localError) {
    console.log('⚠️ Local models not available:', localError.message);
    console.log('💡 Run "npm run download:models" to download models locally');
  }
  
  // Try different local model configurations
  const modelConfigurations = LOCAL_MODELS.map(name => ({
    name,
    config: {
      local_files_only: true,
      quantized: true,
      cache_dir: './models_cache'
    }
  }));
  
  let lastError: Error | null = null;
  
  for (const modelConfig of modelConfigurations) {
          try {
        console.log(`🤖 Trying model: ${modelConfig.name}`);
        console.log('   Config:', modelConfig.config);
        
        // Log model configuration
        console.log(`   - Cache dir: ${modelConfig.config.cache_dir}`);
        
        // Create pipeline
        const model = await pipeline('question-answering', modelConfig.name, modelConfig.config);
      
      // Test the model
      const testResult = await model('What is this?', 'This is a test context for the AI model.');
      
      if (!testResult || !testResult.answer) {
        throw new Error('Model test failed - no answer generated');
      }
      
      console.log('✅ Model loaded and tested successfully!');
      return model;
      
    } catch (error) {
      console.warn(`❌ Model ${modelConfig.name} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Brief delay between attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // If all local models failed, provide helpful error message
  console.log('❌ All local model attempts failed');
  console.log('');
  console.log('🔧 To fix this issue:');
  console.log('   1. Run: npm run download:models');
  console.log('   2. This will download models to ./models_cache/');
  console.log('   3. Then try the analysis again');
  console.log('');
  
  throw new Error(`No local models available. Run "npm run download:models" to download models locally. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Download and cache models for offline use
 */
export async function preloadModels(): Promise<void> {
  console.log('📥 Preloading models for offline use...');
  
  try {
    // This will download and cache the model for future use
    const model = await createLocalModelPipeline();
    console.log('✅ Models preloaded successfully');
    
    // Clean up the test model
    if (model && typeof model.dispose === 'function') {
      model.dispose();
    }
    
  } catch (error) {
    console.warn('⚠️ Model preloading failed:', error);
    // Don't throw - this is just for preloading
  }
}

/**
 * Check if models are available locally
 */
export async function checkLocalModels(): Promise<boolean> {
  try {
    console.log('🔍 Checking for locally cached models...');
    
    // Try to create a model with local_files_only = true
    const model = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad', {
      local_files_only: true,
      quantized: true,
      cache_dir: './models_cache'
    });
    
    // Test it quickly
    const testResult = await model('Test?', 'Test context.');
    const hasAnswer = testResult && testResult.answer;
    
    console.log(hasAnswer ? '✅ Local models available' : '❌ Local models not working');
    return hasAnswer;
    
  } catch (error) {
    console.log('❌ No local models found:', error);
    return false;
  }
}
