#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { pipeline, env } = require('@xenova/transformers');

// Configure environment
env.cacheDir = './models_cache';
env.allowLocalModels = true;
env.allowRemoteModels = true;

console.log('🚀 Starting model download script...');
console.log('📁 Cache directory:', env.cacheDir);

async function downloadModel(modelName, taskType = 'question-answering') {
  try {
    console.log(`\n📥 Downloading model: ${modelName}`);
    console.log(`   Task type: ${taskType}`);
    console.log(`   Cache location: ${env.cacheDir}`);
    
    // Create the pipeline - this will download and cache the model
    const model = await pipeline(taskType, modelName, {
      progress_callback: (progress) => {
        if (progress.progress !== undefined) {
          const percent = Math.round(progress.progress * 100);
          console.log(`   Progress: ${percent}% - ${progress.file}`);
        } else {
          console.log(`   Status: ${progress.status} - ${progress.name}`);
        }
      }
    });
    
    console.log(`✅ Model ${modelName} downloaded successfully`);
    
    // Test the model
    console.log('🧪 Testing model...');
    const testResult = await model('What is this?', 'This is a test context to verify the model works correctly.');
    console.log(`   Test result: "${testResult.answer}" (confidence: ${testResult.score.toFixed(3)})`);
    
    return model;
    
  } catch (error) {
    console.error(`❌ Failed to download model ${modelName}:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync('./models_cache')) {
      fs.mkdirSync('./models_cache', { recursive: true });
      console.log('📁 Created cache directory');
    }
    
    // Download the models we need
    const models = [
      'Xenova/distilbert-base-cased-distilled-squad',
      'Xenova/distilbert-base-uncased-distilled-squad'
    ];
    
    console.log(`📋 Downloading ${models.length} models...`);
    
    for (const modelName of models) {
      try {
        await downloadModel(modelName);
        console.log(`✅ Successfully cached: ${modelName}`);
      } catch (error) {
        console.warn(`⚠️ Failed to download ${modelName}, continuing with next model...`);
      }
    }
    
    // List what we have cached
    console.log('\n📊 Cache summary:');
    if (fs.existsSync('./models_cache')) {
      const cacheContents = fs.readdirSync('./models_cache');
      console.log(`   Cached models: ${cacheContents.length}`);
      cacheContents.forEach(item => {
        console.log(`   - ${item}`);
      });
    }
    
    console.log('\n🎉 Model download complete!');
    console.log('💡 Models are now cached locally and ready for offline use.');
    
  } catch (error) {
    console.error('❌ Model download failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { downloadModel };
