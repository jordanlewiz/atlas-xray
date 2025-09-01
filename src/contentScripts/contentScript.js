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
        // Enable debug logs using new Loglevel logger
        console.log('[AtlasXray] 🔍 Debug logs enabled');
        
        // Enable debug logging using new Loglevel logger
        import('../utils/logger').then(({ setGlobalLogLevel }) => {
          try {
            setGlobalLogLevel('debug');
            console.log('[AtlasXray] ✅ Debug logs enabled - Loglevel logger active');
          } catch (error) {
            console.error('[AtlasXray] ❌ Failed to enable debug logs:', error);
          }
        }).catch(error => {
          console.error('[AtlasXray] ❌ Failed to import logger utility:', error);
        });
        
        // Test PageTypeDetector logging
        console.log('[AtlasXray] 🧪 Testing PageTypeDetector logging...');
        import('../services/PageTypeDetector').then(({ PageTypeDetector }) => {
          try {
            console.log('[AtlasXray] 🧪 PageTypeDetector imported successfully');
            console.log('[AtlasXray] 🧪 PageTypeDetector.log object:', PageTypeDetector.log);
            
            // Test direct logger calls
            console.log('[AtlasXray] 🧪 About to call PageTypeDetector.log.debug...');
            PageTypeDetector.log.debug('🧪 PageTypeDetector direct debug test');
            console.log('[AtlasXray] 🧪 About to call PageTypeDetector.log.info...');
            PageTypeDetector.log.info('🧪 PageTypeDetector direct info test');
            console.log('[AtlasXray] 🧪 About to call PageTypeDetector.log.warn...');
            PageTypeDetector.log.warn('🧪 PageTypeDetector direct warn test');
            console.log('[AtlasXray] 🧪 About to call PageTypeDetector.log.error...');
            PageTypeDetector.log.error('🧪 PageTypeDetector direct error test');
            
            // Test actual PageTypeDetector methods
            console.log('[AtlasXray] 🧪 About to call PageTypeDetector.detectPageType()...');
            const currentPageType = PageTypeDetector.detectPageType();
            console.log('[AtlasXray] ✅ PageTypeDetector test completed - Current page type:', currentPageType);
          } catch (error) {
            console.error('[AtlasXray] ❌ PageTypeDetector test failed:', error);
          }
        }).catch(error => {
          console.error('[AtlasXray] ❌ Failed to import PageTypeDetector:', error);
        });
      } else {
        // Disable debug logs
        import('../utils/logger').then(({ setGlobalLogLevel }) => {
          try {
            setGlobalLogLevel('warn'); // Only show warnings and errors
            console.log('[AtlasXray] ✅ Debug logs disabled - Loglevel logger set to warn level');
          } catch (error) {
            console.error('[AtlasXray] ❌ Failed to disable debug logs:', error);
          }
        }).catch(error => {
          console.error('[AtlasXray] ❌ Failed to import logger utility:', error);
        });
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
