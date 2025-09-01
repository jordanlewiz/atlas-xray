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

// Listen for debug toggle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_DEBUG') {
    try {
      if (message.enabled) {
        // Enable debug logs
        localStorage.debug = 'atlas-xray:*';
        console.log('[AtlasXray] 🔍 Debug logs enabled - localStorage.debug =', localStorage.debug);
        
        // Test if debug is working by creating a new debug instance
        console.log('[AtlasXray] 🧪 Testing debug logs...');
        const debug = require('debug');
        const testDebug = debug('atlas-xray:TestLogger');
        testDebug('🧪 Test debug message - this should appear if debug is working');
      } else {
        // Disable debug logs
        localStorage.debug = '';
        console.log('[AtlasXray] 🔍 Debug logs disabled - localStorage.debug =', localStorage.debug);
      }
      sendResponse({ success: true });
    } catch (error) {
      console.error('[AtlasXray] ❌ Failed to toggle debug logs:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
});

// ✅ NEW: Clean page load - simplified page type detection starts automatically
console.log('[AtlasXray] 🚀 Extension loaded - simplified page type detection active');
