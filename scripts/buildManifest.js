#!/usr/bin/env node

/**
 * Build Manifest Script
 * 
 * This script creates a distribution manifest.json file with correct relative paths
 * for the Chrome extension to work properly when installed.
 */

const fs = require('fs');
const path = require('path');

// Read the source manifest
const sourceManifestPath = path.join(__dirname, '..', 'manifest.json');
const distManifestPath = path.join(__dirname, '..', 'dist', 'manifest.json');

try {
  // Read source manifest
  const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8'));
  
  // Create distribution manifest with corrected paths
  const distManifest = {
    ...sourceManifest,
    icons: {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    },
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "icons/icon-16.png",
        "48": "icons/icon-48.png",
        "128": "icons/icon-128.png"
      }
    },
    background: {
      service_worker: "background.js"
    },
    content_scripts: [
      {
        matches: ["https://home.atlassian.com/*"],
        js: ["contentScript.js"],
        css: ["popup.css"]
      }
    ]
  };
  
  // Ensure dist directory exists
  const distDir = path.dirname(distManifestPath);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Write distribution manifest
  fs.writeFileSync(distManifestPath, JSON.stringify(distManifest, null, 2));
  
  console.log('✅ Distribution manifest.json created successfully');
  console.log('📁 Paths corrected for Chrome extension installation');
  
} catch (error) {
  console.error('❌ Failed to build manifest:', error.message);
  process.exit(1);
}
