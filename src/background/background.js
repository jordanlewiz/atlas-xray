/**
 * Atlas Xray Chrome Extension - Background Service Worker
 * 
 * This background script runs in the extension's service worker context and:
 * 1. Manages extension lifecycle events (install, update, startup)
 * 2. Performs periodic version checks against GitHub releases
 * 3. Shows update notifications to users when new versions are available
 * 4. Handles extension icon clicks and other background tasks
 * 5. Performs AI-powered analysis of project updates using Transformers.js
 * 
 * The service worker remains active to handle version checking and
 * extension management even when no tabs are open.
 */

console.log('[AtlasXray] Background service worker is running');

// Import version checker (will be bundled by esbuild)
import { VersionChecker } from '../utils/versionChecker';
import { memoryManager } from '../utils/memoryManager';

// Import project update watcher for AI analysis
console.log('[AtlasXray] Importing ProjectUpdateWatcher...');
try {
  import('./projectUpdateWatcher.js').then(() => {
    console.log('[AtlasXray] ✅ ProjectUpdateWatcher imported successfully');
  }).catch(error => {
    console.error('[AtlasXray] ❌ Failed to import ProjectUpdateWatcher:', error);
  });
} catch (error) {
  console.error('[AtlasXray] ❌ Import error:', error);
}

// Import AI analysis capabilities
let projectAnalyzer = null;
let isAIAvailable = false;

// Performance optimizations
const MAX_ANALYSIS_QUEUE = 10; // Limit pending analyses
const ANALYSIS_TIMEOUT = 15000; // 15 second timeout for analysis
let analysisQueue = [];
let isProcessingQueue = false;

// Initialize AI capabilities
// async function initializeAI() {
//   const startTime = performance.now();
//   try {
//     console.log('[AtlasXray] Initializing AI capabilities...');
//     
//     // Import project analyzer (this will be bundled)
//     const analyzerModule = await import('../services/AnalysisService');
//     projectAnalyzer = analyzerModule.analyzeProjectUpdate;
//     
//     if (projectAnalyzer) {
//       isAIAvailable = true;
//       const endTime = performance.now();
//       console.log(`[AtlasXray] ✅ AI analysis capabilities initialized in ${(endTime - startTime).toFixed(2)}ms`);
//     } else {
//       console.warn('[AtlasXray] ⚠️ AI analysis not available, using fallback');
//     }
//   } catch (error) {
//     const endTime = performance.now();
//     console.error(`[AtlasXray] Failed to initialize AI after ${(endTime - startTime).toFixed(2)}ms:`, error);
//     isAIAvailable = false;
//   }
// }

// Initialize AI when service worker starts - but don't block
// initializeAI().catch(error => {
//   console.error('[AtlasXray] AI initialization failed, continuing without AI:', error);
//   isAIAvailable = false;
// });

// Message handler for communication with content scripts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('[AtlasXray] 📨 Message received:', message.type, 'from:', sender.tab?.url);
  
  if (message.type === 'PING') {
    console.log('[AtlasXray] 🏓 Ping received from:', sender.tab?.url);
    sendResponse({ 
      success: true, 
      message: 'Pong from background script',
      timestamp: new Date().toISOString()
    });
    return true;
  }
  
  if (message.type === 'ANALYZE_UPDATE_QUALITY') {
    // console.log('[AtlasXray] 🔍 AI analysis request received for update:', message.updateId);
    
    // // Handle analysis asynchronously with queue management
    // handleUpdateAnalysisWithQueue(message, sender, sendResponse);
    // return true; // Keep message channel open for async response
    
    // Temporary: just return success without AI
    sendResponse({ 
      success: true, 
      message: 'AI analysis temporarily disabled',
      result: { score: 50, quality: 'fair' }
    });
    return true;
  }
  
  if (message.type === 'OPEN_TIMELINE') {
    console.log('[AtlasXray] 📊 Timeline open request received');
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'GET_MEMORY_STATS') {
    const stats = memoryManager.getCurrentMemoryStats();
    sendResponse({ 
      success: true, 
      stats,
      summary: memoryManager.getMemorySummary()
    });
    return true;
  }

  if (message.type === 'GET_AI_STATUS') {
    // sendResponse({ 
    //   success: true, 
    //   isAIAvailable,
    //   hasProjectAnalyzer: !!projectAnalyzer,
    //   queueSize: analysisQueue.length,
    //   isProcessing: isProcessingQueue
    // });
    // return true;
    
    // Temporary: return disabled status
    sendResponse({ 
      success: true, 
      isAIAvailable: false,
      hasProjectAnalyzer: false,
      queueSize: 0,
      isProcessing: false,
      message: 'AI temporarily disabled'
    });
    return true;
  }
  
  // AI analysis now happens directly in content script - no need for complex messaging
  // The content script has bundled AI libraries and can analyze updates directly

  if (message.type === 'FORCE_CLEANUP') {
    memoryManager.performCleanup({
      forceGC: true,
      clearCaches: true,
      clearModels: true
    });
    sendResponse({ success: true, message: 'Cleanup initiated' });
    return true;
  }
  
  console.log('[AtlasXray] ⚠️ Unknown message type:', message.type);
  sendResponse({ success: false, error: 'Unknown message type' });
  return true;
});

/**
 * Handle update analysis with queue management to prevent memory issues
 */
async function handleUpdateAnalysisWithQueue(message, sender, sendResponse) {
  try {
    const { updateId, updateText, updateType, state } = message;
    
    // If AI is not available, provide immediate fallback response
    if (!isAIAvailable || !projectAnalyzer) {
      console.log('[AtlasXray] AI not available, providing immediate fallback response');
      try {
        const fallbackResult = await performRuleBasedAnalysis(updateText, updateType, state);
        await storeAnalysisResult(updateId, fallbackResult);
        sendResponse({ 
          success: true, 
          result: fallbackResult,
          message: 'Rule-based analysis completed (AI not available)'
        });
      } catch (error) {
        console.error('[AtlasXray] Fallback analysis failed:', error);
        sendResponse({ 
          success: false, 
          error: 'Both AI and fallback analysis failed',
          message: 'Analysis unavailable'
        });
      }
      return;
    }
    
    // Check if queue is full
    if (analysisQueue.length >= MAX_ANALYSIS_QUEUE) {
      console.warn('[AtlasXray] Analysis queue full, rejecting request');
      sendResponse({ 
        success: false, 
        error: 'Analysis queue full, please try again later',
        message: 'System busy'
      });
      return;
    }

    // Add to queue
    const queueItem = {
      id: Date.now(),
      message,
      sender,
      sendResponse,
      timestamp: new Date()
    };
    
    analysisQueue.push(queueItem);
    console.log(`[AtlasXray] Added to analysis queue. Queue size: ${analysisQueue.length}`);
    
    // Process queue if not already processing
    if (!isProcessingQueue) {
      processAnalysisQueue();
    }
    
  } catch (error) {
    console.error('[AtlasXray] Failed to queue analysis:', error);
    sendResponse({ 
      success: false, 
      error: error.message || 'Failed to queue analysis',
      message: 'Queue error'
    });
  }
}

/**
 * Process the analysis queue with rate limiting
 */
async function processAnalysisQueue() {
  if (isProcessingQueue || analysisQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  console.log(`[AtlasXray] Processing analysis queue. Items: ${analysisQueue.length}`);

  try {
    while (analysisQueue.length > 0) {
      const item = analysisQueue.shift();
      if (!item) continue;

      try {
        console.log(`[AtlasXray] Processing analysis ${item.id} from queue`);
        
        // Run AI analysis with timeout
        const result = await performAIAnalysisWithTimeout(
          item.message.updateText, 
          item.message.updateType, 
          item.message.state
        );
        
        // Store the result
        await storeAnalysisResult(item.message.updateId, result);
        
        // Send success response
        item.sendResponse({ 
          success: true, 
          result,
          message: 'AI analysis completed successfully'
        });
        
        console.log(`[AtlasXray] Analysis ${item.id} completed successfully`);
        
      } catch (error) {
        console.error(`[AtlasXray] Analysis ${item.id} failed:`, error);
        
        // Send error response
        try {
          item.sendResponse({ 
            success: false, 
            error: error.message || 'Analysis failed',
            message: 'Analysis failed'
          });
        } catch (sendError) {
          console.error(`[AtlasXray] Failed to send error response for ${item.id}:`, sendError);
        }
      }

      // Add delay between analyses to prevent overwhelming the system
      if (analysisQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
  } finally {
    isProcessingQueue = false;
    console.log('[AtlasXray] Analysis queue processing completed');
  }
}

/**
 * Perform AI analysis with timeout protection
 */
async function performAIAnalysisWithTimeout(updateText, updateType, state) {
  if (!isAIAvailable || !projectAnalyzer) {
    console.log('[AtlasXray] AI not available, using rule-based analysis');
    return await performRuleBasedAnalysis(updateText, updateType, state);
  }

  const analysisPromise = projectAnalyzer(updateText);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('AI analysis timeout')), ANALYSIS_TIMEOUT);
  });

  try {
    const result = await Promise.race([analysisPromise, timeoutPromise]);
    console.log('[AtlasXray] AI analysis completed successfully');
    return result;
  } catch (error) {
    console.warn('[AtlasXray] AI analysis failed, falling back to rule-based:', error);
    return await performRuleBasedAnalysis(updateText, updateType, state);
  }
}

/**
 * Perform rule-based quality analysis
 */
async function performRuleBasedAnalysis(updateText, updateType, state) {
  const text = updateText.toLowerCase();
  let score = 50; // Base score
  let qualityLevel = 'fair';
  let reasoning = [];
  let missingInfo = [];
  let recommendations = [];
  
  // Analyze based on update type
  if (updateType === 'paused') {
    if (text.includes('why') || text.includes('reason')) score += 20;
    if (text.includes('impact')) score += 15;
    if (text.includes('when') || text.includes('resume')) score += 15;
    if (text.includes('decision')) score += 10;
    if (text.includes('support')) score += 10;
    
    if (!text.includes('why') && !text.includes('reason')) {
      missingInfo.push('Why was this paused?');
    }
    if (!text.includes('impact')) {
      missingInfo.push('What is the impact?');
    }
    if (!text.includes('when') && !text.includes('resume')) {
      missingInfo.push('When will it be resumed?');
    }
  } else if (updateType === 'off-track') {
    if (text.includes('why') || text.includes('reason')) score += 20;
    if (text.includes('situation') || text.includes('summary')) score += 15;
    if (text.includes('steps') || text.includes('action')) score += 15;
    if (text.includes('impact')) score += 15;
    if (text.includes('support')) score += 15;
    
    if (!text.includes('why') && !text.includes('reason')) {
      missingInfo.push('Why is this off-track?');
    }
    if (!text.includes('steps') && !text.includes('action')) {
      missingInfo.push('What steps are being taken?');
    }
  } else if (updateType === 'at-risk') {
    if (text.includes('why') || text.includes('reason')) score += 20;
    if (text.includes('situation') || text.includes('summary')) score += 15;
    if (text.includes('mitigation') || text.includes('plan')) score += 15;
    if (text.includes('impact')) score += 15;
    if (text.includes('support')) score += 15;
    
    if (!text.includes('mitigation') && !text.includes('plan')) {
      missingInfo.push('What is the mitigation plan?');
    }
  } else if (updateType === 'prioritization') {
    if (text.includes('why') || text.includes('reason')) score += 25;
    if (text.includes('impact')) score += 25;
    if (text.includes('decision') || text.includes('process')) score += 25;
    if (text.includes('support')) score += 25;
    
    if (!text.includes('impact')) {
      missingInfo.push('What is the impact?');
    }
    if (!text.includes('decision') && !text.includes('process')) {
      missingInfo.push('How was this decision made?');
    }
  }
  
  // General quality checks
  if (text.length > 100) score += 10;
  if (text.length > 200) score += 10;
  if (text.includes('because') || text.includes('due to')) score += 5;
  if (text.includes('next') || text.includes('following')) score += 5;
  
  // Cap score at 100
  score = Math.min(100, Math.max(0, score));
  
  // Determine quality level
  if (score >= 80) qualityLevel = 'excellent';
  else if (score >= 60) qualityLevel = 'good';
  else if (score >= 40) qualityLevel = 'fair';
  else qualityLevel = 'poor';
  
  // Generate reasoning
  if (score >= 60) {
    reasoning.push('Update provides comprehensive information');
    if (updateType) reasoning.push(`Addresses ${updateType} criteria well`);
  } else {
    reasoning.push('Update lacks sufficient detail');
    if (missingInfo.length > 0) reasoning.push(`Missing key information: ${missingInfo.length} items`);
  }
  
  // Generate recommendations
  if (missingInfo.length > 0) {
    recommendations.push('Provide missing information to improve quality');
  }
  if (text.length < 100) {
    recommendations.push('Add more context and details');
  }
  if (!text.includes('impact')) {
    recommendations.push('Include impact assessment');
  }
  
  return {
    updateId: null, // Will be set by caller
    overallScore: score,
    qualityLevel,
    confidence: 0.8,
    reasoning: reasoning.join('. '),
    timestamp: new Date().toISOString(),
    analysis: [{
      criteriaId: updateType || 'general',
      title: updateType ? `${updateType.charAt(0).toUpperCase() + updateType.slice(1)} Analysis` : 'General Analysis',
      score,
      maxScore: 100,
      answers: [],
      missingInfo,
      recommendations
    }],
    missingInfo,
    recommendations,
    summary: `Quality score: ${score}/100 (${qualityLevel}). ${reasoning.join('. ')}`
  };
}

/**
 * Store analysis result in chrome.storage.local
 * Note: Service workers cannot access IndexedDB directly
 */
async function storeAnalysisResult(updateId, result) {
  try {
    const key = `quality:${updateId}`;
    result.updateId = updateId;
    result.timestamp = new Date().toISOString();
    
    await chrome.storage.local.set({ [key]: result });
    console.log(`[AtlasXray] ✅ Quality data stored in chrome.storage.local for update: ${updateId}`);
    
  } catch (error) {
    console.error('[AtlasXray] Failed to store analysis result:', error);
  }
}

// Check for updates when extension starts
chrome.runtime.onStartup.addListener(async () => {
  console.log('[AtlasXray] Extension started, checking for updates...');
  await checkForUpdates();
});

// Check for updates when extension is installed/updated
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[AtlasXray] Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    console.log('[AtlasXray] First time install');
  } else if (details.reason === 'update') {
    console.log('[AtlasXray] Extension updated to version:', chrome.runtime.getManifest().version);
  }
  
  // Check for updates after a short delay using chrome.alarms
  chrome.alarms.create('delayed-version-check', { when: Date.now() + 5000 });
});

// Check for updates periodically (every 24 hours)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'version-check') {
    console.log('[AtlasXray] Periodic version check triggered');
    await checkForUpdates();
  } else if (alarm.name === 'delayed-version-check') {
    console.log('[AtlasXray] Delayed version check triggered');
    await checkForUpdates();
  } else if (alarm.name.startsWith('atlas-xray-clear-')) {
    // Clear notification when alarm fires
    const notificationId = alarm.name.replace('atlas-xray-clear-', '');
    chrome.notifications.clear(notificationId);
    
    // Clean up the notification mapping
    if (typeof VersionChecker !== 'undefined') {
      VersionChecker.cleanupNotification(notificationId);
    }
    
    console.log('[AtlasXray] Cleared notification:', notificationId);
  }
});

// Set up periodic version checking (only if it doesn't already exist)
chrome.alarms.get('version-check', (alarm) => {
  if (!alarm) {
    chrome.alarms.create('version-check', {
      delayInMinutes: 1, // First check after 1 minute
      periodInMinutes: 1440 // Then every 24 hours
    });
  }
});

/**
 * Check for updates and notify user if new version is available
 */
async function checkForUpdates() {
  try {
    // Skip update checks for local development builds
    const currentVersion = chrome.runtime.getManifest().version;
    const isLocalDev = currentVersion === '0.0.0';
    
    if (isLocalDev) {
      console.log('[AtlasXray] Local dev build detected, skipping update checks');
      return;
    }
    
    const updateInfo = await VersionChecker.checkForUpdates();
    
    if (updateInfo.hasUpdate) {
      console.log('[AtlasXray] New version available:', updateInfo.latestVersion);
      
      // Show notification to user
      await VersionChecker.showUpdateNotification(
        updateInfo.latestVersion,
        updateInfo.releaseUrl
      );
    } else {
      console.log('[AtlasXray] No updates available');
    }
  } catch (error) {
    console.error('[AtlasXray] Version check failed:', error);
  }
}

// Handle extension icon click (optional)
chrome.action.onClicked.addListener((tab) => {
  console.log('[AtlasXray] Extension icon clicked');
  // You could open a popup or perform other actions here
});

console.log('[AtlasXray] Background service worker setup complete');
console.log('[AtlasXray] 🔍 Message listener status:', typeof chrome.runtime.onMessage !== 'undefined' ? 'ACTIVE' : 'MISSING');
