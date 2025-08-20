#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up local models for @xenova/transformers...');

// Create the transformers cache directory structure
const transformersCacheDir = './.transformers_cache';
const modelsCacheDir = './models_cache';

if (!fs.existsSync(transformersCacheDir)) {
  fs.mkdirSync(transformersCacheDir, { recursive: true });
  console.log('📁 Created .transformers_cache directory');
}

// Copy models from models_cache to .transformers_cache
function copyModels() {
  try {
    // Copy the Xenova directory structure
    const xenovaSource = path.join(modelsCacheDir, 'Xenova');
    const xenovaDest = path.join(transformersCacheDir, 'Xenova');
    
    if (fs.existsSync(xenovaSource)) {
      // Remove existing destination
      if (fs.existsSync(xenovaDest)) {
        fs.rmSync(xenovaDest, { recursive: true, force: true });
      }
      
      // Copy recursively
      fs.cpSync(xenovaSource, xenovaDest, { recursive: true });
      console.log('✅ Copied models to .transformers_cache/Xenova/');
      
      // List what we copied
      const copiedModels = fs.readdirSync(xenovaDest);
      console.log('📋 Copied models:', copiedModels.join(', '));
      
    } else {
      console.log('❌ Source models not found in models_cache/');
      console.log('💡 Run "npm run download:models" first');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to copy models:', error.message);
    return false;
  }
}

// Verify the setup
function verifySetup() {
  try {
    const xenovaDir = path.join(transformersCacheDir, 'Xenova');
    if (!fs.existsSync(xenovaDir)) {
      console.log('❌ Models not found in .transformers_cache/');
      return false;
    }
    
    const models = fs.readdirSync(xenovaDir);
    console.log('🔍 Found models in .transformers_cache/Xenova/:', models.join(', '));
    
    // Check each model has required files
    for (const model of models) {
      const modelPath = path.join(xenovaDir, model);
      const requiredFiles = ['config.json', 'tokenizer.json', 'onnx/model_quantized.onnx'];
      
      for (const file of requiredFiles) {
        const filePath = path.join(modelPath, file);
        if (!fs.existsSync(filePath)) {
          console.log(`❌ Missing required file: ${model}/${file}`);
          return false;
        }
      }
      console.log(`✅ Model ${model} has all required files`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('📁 Source cache directory:', modelsCacheDir);
  console.log('📁 Target cache directory:', transformersCacheDir);
  
  if (copyModels()) {
    console.log('');
    console.log('🔍 Verifying setup...');
    if (verifySetup()) {
      console.log('');
      console.log('🎉 Local models setup complete!');
      console.log('💡 The AI system should now work with local models only.');
    } else {
      console.log('');
      console.log('❌ Setup verification failed');
      process.exit(1);
    }
  } else {
    console.log('');
    console.log('❌ Failed to set up local models');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { copyModels, verifySetup };
