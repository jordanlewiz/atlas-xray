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

// Import logging utility
import { log } from '../utils/logger';

// Custom styles will be merged with contentScript.css during build

log.info('[ContentScript]', '🚀 Content script loaded and ready');

// Initialize simplified page type detection
(async () => {
  try {
    // Import the simplified PageTypeDetector service
    const { PageTypeDetector } = await import('../services/PageTypeDetector');
    
    // Start monitoring URL changes and detecting page types
    PageTypeDetector.startMonitoring();
    
    log.info('[ContentScript]', '✅ Simplified page type detection initialized successfully');
  } catch (error) {
    log.error('[ContentScript]', '❌ Failed to initialize page type detection:', error);
  }
})();

// Test communication with background script
setTimeout(async () => {
  if (chrome.runtime && chrome.runtime.sendMessage) {
    log.debug('[ContentScript]', '🧪 Testing background script communication...');
    try {
      const response = await chrome.runtime.sendMessage({ type: 'PING' });
      if (response && response.success) {
        log.info('[ContentScript]', '✅ Background script communication working');
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
        log.info('[ContentScript]', '🔍 Debug logs enabled');
        
        // Enable debug logging
        import('../utils/logger').then(({ forceDebugLogging }) => {
          try {
            forceDebugLogging(true);
            log.info('[ContentScript]', '✅ Debug logs enabled - Logger active');
          } catch (error) {
            console.error('[AtlasXray] ❌ Failed to enable debug logs:', error);
          }
        }).catch(error => {
          console.error('[AtlasXray] ❌ Failed to import logger utility:', error);
        });
        
        // Test PageTypeDetector logging
        log.debug('[ContentScript]', '🧪 Testing PageTypeDetector logging...');
        import('../services/PageTypeDetector').then(({ PageTypeDetector }) => {
          try {
            log.debug('[ContentScript]', '🧪 PageTypeDetector imported successfully');
            log.debug('[ContentScript]', '🔍 PageTypeDetector.log object:', PageTypeDetector.log);
            
            // Test direct logger calls
            log.debug('[ContentScript]', '🧪 About to call PageTypeDetector.log.debug...');
            log.debug('[PageTypeDetector]', '🧪 PageTypeDetector direct debug test');
            log.debug('[ContentScript]', '🧪 About to call PageTypeDetector.log.info...');
            log.info('[PageTypeDetector]', '🧪 PageTypeDetector direct info test');
            log.debug('[ContentScript]', '🧪 About to call PageTypeDetector.log.warn...');
            log.warn('[PageTypeDetector]', '🧪 PageTypeDetector direct warn test');
            log.debug('[ContentScript]', '🧪 About to call PageTypeDetector.log.error...');
            log.error('[PageTypeDetector]', '🧪 PageTypeDetector direct error test');
            
            // Test actual PageTypeDetector methods
            log.debug('[ContentScript]', '🧪 About to call PageTypeDetector.detectPageType()...');
            const currentPageType = PageTypeDetector.detectPageType();
            log.info('[ContentScript]', '✅ PageTypeDetector test completed - Current page type:', currentPageType);
          } catch (error) {
            log.error('[ContentScript]', '❌ PageTypeDetector test failed:', error);
          }
        }).catch(error => {
          log.error('[ContentScript]', '❌ Failed to import PageTypeDetector:', error);
        });
      } else {
        // Disable debug logs
        import('../utils/logger').then(({ forceDebugLogging }) => {
          try {
            forceDebugLogging(false);
            log.info('[ContentScript]', '✅ Debug logs disabled - Logger set to warn level');
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

// Extension loaded - simplified page type detection starts automatically
log.info('[ContentScript]', '🚀 Extension loaded - simplified page type detection active');
