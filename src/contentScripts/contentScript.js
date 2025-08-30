/**
 * Atlas Xray Chrome Extension - Content Script
 * 
 * This content script is injected into Atlassian project pages to:
 * 1. Detect page types and show appropriate UI elements
 * 2. Monitor URL changes for SPA navigation
 * 3. Provide page type information to the user
 */

// Import leader-line-new properly using require
const LeaderLine = require('leader-line-new');

// Custom styles will be merged with contentScript.css during build

console.log('[AtlasXray] 🚀 Content script loaded and ready');

// Initialize simplified page type detection
(async () => {
  try {
    // Import the simplified PageTypeDetector service
    const { PageTypeDetector } = await import('../services/PageTypeDetector');
    
    // Start monitoring URL changes and detecting page types
    PageTypeDetector.startMonitoring();
    
    console.log('[AtlasXray] ✅ Simplified page type detection initialized successfully');
  } catch (error) {
    console.error('[AtlasXray] ❌ Failed to initialize page type detection:', error);
  }
})();

// Test communication with background script
setTimeout(async () => {
  if (chrome.runtime && chrome.runtime.sendMessage) {
    console.log('[AtlasXray] 🧪 Testing background script communication...');
    try {
      const response = await chrome.runtime.sendMessage({ type: 'PING' });
      if (response && response.success) {
        console.log('[AtlasXray] ✅ Background script communication working:', response);
      } else {
        console.error('[AtlasXray] ❌ Background script communication failed:', response);
      }
    } catch (error) {
      console.error('[AtlasXray] ❌ Background script communication error:', error);
    }
  } else {
    console.error('[AtlasXray] ❌ Chrome runtime not available');
  }
}, 1000);

// ✅ NEW: Clean page load - simplified page type detection starts automatically
console.log('[AtlasXray] 🚀 Extension loaded - simplified page type detection active');
