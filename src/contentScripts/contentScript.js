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
import { log, setFilePrefix } from '../utils/logger';

// Set file-level prefix for all logging in this file
setFilePrefix('[ContentScript]');

// Custom styles will be merged with contentScript.css during build

log.info('Content script loaded and ready');

// Initialize simplified page type detection
(async () => {
  try {
    // Import the simplified PageTypeDetector service
    const { PageTypeDetector } = await import('../services/PageTypeDetector');
    
    // Start monitoring URL changes and detecting page types
    PageTypeDetector.startMonitoring();
    
    log.info('Simplified page type detection initialized successfully');
  } catch (error) {
    log.error('Failed to initialize page type detection:', error);
  }
})();

// Test communication with background script
setTimeout(async () => {
  if (chrome.runtime && chrome.runtime.sendMessage) {
    log.debug('🧪 Testing background script communication...');
    try {
      const response = await chrome.runtime.sendMessage({ type: 'PING' });
      if (response && response.success) {
        log.info('Background script communication working');
      } else {
        log.error('Background script communication failed:', JSON.stringify(response));
      }
    } catch (error) {
      log.error('Background script communication error:', String(error));
    }
  } else {
    log.error('Chrome runtime not available');
  }
}, 1000);

// Listen for debug toggle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_DEBUG') {
    try {
      if (message.enabled) {
        // Enable debug logs using new Loglevel logger
        log.info('Debug logs enabled');
        
        // Enable debug logging
        import('../utils/logger').then(({ forceDebugLogging }) => {
          try {
            forceDebugLogging(true);
            log.info('Debug logs enabled - Logger active');
          } catch (error) {
            log.error('Failed to enable debug logs:', String(error));
          }
        }).catch(error => {
          log.error('Failed to import logger utility:', String(error));
        });
      } else {
        // Disable debug logs
        import('../utils/logger').then(({ forceDebugLogging }) => {
          try {
            forceDebugLogging(false);
            log.info('Debug logs disabled - Logger set to warn level');
          } catch (error) {
            log.error('Failed to disable debug logs:', String(error));
          }
        }).catch(error => {
          log.error('Failed to import logger utility:', String(error));
        });
      }
      sendResponse({ success: true });
    } catch (error) {
      log.error('Failed to toggle debug logs:', String(error));
      sendResponse({ success: false, error: error.message });
    }
  }
});

// Extension loaded - simplified page type detection starts automatically
log.info('Extension loaded - simplified page type detection active');
