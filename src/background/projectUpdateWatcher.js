/**
 * Project Update Watcher - Background Service Worker
 * 
 * This service worker monitors Dexie database for new project updates
 * and automatically analyzes them using Transformers.js
 */

import { analysisDB, initializeAnalysisDatabase } from '../utils/analysisDatabase';
import { analyzeProjectUpdate } from '../utils/projectAnalyzer';

// Performance optimizations
const WATCH_INTERVAL = 60000; // Check every 60 seconds (increased from 30)
const MAX_TEXT_LENGTH = 1500; // Reduced from 2000
const CACHE_DURATION_HOURS = 12; // Reduced from 24
const MAX_CONCURRENT_ANALYSES = 3; // Limit concurrent processing
const ANALYSIS_TIMEOUT = 10000; // 10 second timeout per analysis
const MAX_UPDATES_PER_BATCH = 5; // Process max 5 updates at once

// State tracking with memory management
let isWatching = false;
let watchInterval = null;
let lastUpdateCheck = null;
let activeAnalyses = 0; // Track concurrent analyses
let analysisQueue = []; // Queue for pending analyses
let memoryUsage = 0; // Track memory usage

/**
 * Initialize the project update watcher
 */
async function initializeWatcher() {
  try {
    console.log('[ProjectUpdateWatcher] Initializing...');
    
    // Initialize database
    await initializeAnalysisDatabase();
    
    // Start watching for updates
    startWatching();
    
    // Set up memory monitoring
    setInterval(monitorMemoryUsage, 300000); // Check every 5 minutes
    
    console.log('[ProjectUpdateWatcher] Initialized successfully');
  } catch (error) {
    console.error('[ProjectUpdateWatcher] Initialization failed:', error);
  }
}

/**
 * Monitor memory usage and cleanup if needed
 */
function monitorMemoryUsage() {
  if (performance.memory) {
    const used = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    const limit = performance.memory.jsHeapSizeLimit / 1024 / 1024; // MB
    
    console.log(`[ProjectUpdateWatcher] Memory usage: ${used.toFixed(2)}MB / ${limit.toFixed(2)}MB`);
    
    // If using more than 80% of available memory, cleanup
    if (used > limit * 0.8) {
      console.warn('[ProjectUpdateWatcher] High memory usage detected, cleaning up...');
      cleanupMemory();
    }
  }
}

/**
 * Clean up memory when usage is high
 */
function cleanupMemory() {
  // Clear analysis queue
  analysisQueue = [];
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    console.log('[ProjectUpdateWatcher] Forced garbage collection');
  }
  
  // Clear any cached data
  if (analysisDB && analysisDB.clearCache) {
    analysisDB.clearCache();
  }
}

/**
 * Start watching for new project updates
 */
function startWatching() {
  if (isWatching) {
    console.log('[ProjectUpdateWatcher] Already watching for updates');
    return;
  }

  console.log('[ProjectUpdateWatcher] Starting to watch for project updates...');
  isWatching = true;

  // Check immediately
  checkForNewUpdates();

  // Set up periodic checking
  watchInterval = setInterval(checkForNewUpdates, WATCH_INTERVAL);
}

/**
 * Stop watching for updates
 */
function stopWatching() {
  if (!isWatching) return;

  console.log('[ProjectUpdateWatcher] Stopping update watcher...');
  isWatching = false;

  if (watchInterval) {
    clearInterval(watchInterval);
    watchInterval = null;
  }
}

/**
 * Check for new project updates that need analysis
 */
async function checkForNewUpdates() {
  try {
    // Don't start new check if previous one is still running
    if (activeAnalyses > 0) {
      console.log(`[ProjectUpdateWatcher] Skipping check - ${activeAnalyses} analyses still running`);
      return;
    }
    
    console.log('[ProjectUpdateWatcher] Checking for new updates...');
    
    // Get recent updates from Dexie (you'll need to adapt this to your existing database structure)
    const newUpdates = await getNewUpdatesFromDexie();
    
    if (newUpdates.length === 0) {
      console.log('[ProjectUpdateWatcher] No new updates found');
      return;
    }

    console.log(`[ProjectUpdateWatcher] Found ${newUpdates.length} new updates to analyze`);
    
    // Limit batch size to prevent memory issues
    const updatesToProcess = newUpdates.slice(0, MAX_UPDATES_PER_BATCH);
    
    // Process updates with rate limiting
    for (const update of updatesToProcess) {
      await processUpdateWithRateLimit(update);
    }

    lastUpdateCheck = new Date();
    console.log('[ProjectUpdateWatcher] Update check completed');
    
  } catch (error) {
    console.error('[ProjectUpdateWatcher] Failed to check for updates:', error);
  }
}

/**
 * Process update with rate limiting and memory management
 */
async function processUpdateWithRateLimit(update) {
  // Wait if we're at the concurrent limit
  while (activeAnalyses >= MAX_CONCURRENT_ANALYSES) {
    console.log('[ProjectUpdateWatcher] Waiting for analysis slot...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  activeAnalyses++;
  
  try {
    await analyzeAndStoreUpdate(update);
  } finally {
    activeAnalyses--;
  }
}

/**
 * Get new updates from your existing Dexie database
 * You'll need to adapt this to match your database structure
 */
async function getNewUpdatesFromDexie() {
  try {
    // This is a placeholder - you'll need to implement this based on your existing database
    // Example: check for updates that don't have analysis results yet
    
    // For now, return empty array - implement based on your existing database schema
    return [];
    
  } catch (error) {
    console.error('[ProjectUpdateWatcher] Failed to get updates from Dexie:', error);
    return [];
  }
}

/**
 * Analyze a project update and store the results
 */
async function analyzeAndStoreUpdate(update) {
  try {
    const { projectId, updateId, text } = update;
    
    console.log(`[ProjectUpdateWatcher] Analyzing update ${updateId} for project ${projectId}`);
    
    // Check if we already have analysis for this update
    const existingAnalysis = await analysisDB.getAnalysis(projectId, updateId);
    if (existingAnalysis) {
      console.log(`[ProjectUpdateWatcher] Analysis already exists for update ${updateId}`);
      return;
    }

    // Check cache first
    const textHash = generateTextHash(text);
    const cachedAnalysis = await analysisDB.getCachedAnalysis(textHash, CACHE_DURATION_HOURS);
    
    let analysis;
    if (cachedAnalysis) {
      console.log(`[ProjectUpdateWatcher] Using cached analysis for update ${updateId}`);
      analysis = cachedAnalysis;
    } else {
      // Perform new analysis with timeout protection
      console.log(`[ProjectUpdateWatcher] Performing new analysis for update ${updateId}`);
      
      // Truncate text if too long
      const truncatedText = text.length > MAX_TEXT_LENGTH 
        ? text.substring(0, MAX_TEXT_LENGTH) + '...'
        : text;
      
      // Add timeout protection
      const analysisPromise = analyzeProjectUpdate(truncatedText);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Analysis timeout')), ANALYSIS_TIMEOUT);
      });
      
      try {
        analysis = await Promise.race([analysisPromise, timeoutPromise]);
        
        // Cache the result
        await analysisDB.cacheAnalysis(textHash, analysis);
      } catch (error) {
        console.error(`[ProjectUpdateWatcher] Analysis failed for update ${updateId}:`, error);
        // Return fallback analysis
        analysis = {
          sentiment: { score: 0.5, label: 'neutral' },
          analysis: [],
          summary: 'Analysis failed - fallback result',
          timestamp: new Date()
        };
      }
    }

    // Store analysis results
    await analysisDB.storeAnalysis(projectId, updateId, text, analysis);
    
    console.log(`[ProjectUpdateWatcher] Successfully analyzed and stored update ${updateId}`);
    
    // Show notification for completed analysis
    await showAnalysisCompleteNotification(projectId, updateId, analysis);
    
  } catch (error) {
    console.error(`[ProjectUpdateWatcher] Failed to analyze update ${update.updateId}:`, error);
  }
}

/**
 * Generate a hash for text to use as cache key
 */
function generateTextHash(text) {
  // Simple hash function - you might want to use a more robust one
  let hash = 0;
  if (text.length === 0) return hash.toString();
  
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString();
}

/**
 * Show notification when analysis is complete
 */
async function showAnalysisCompleteNotification(projectId, updateId, analysis) {
  try {
    const notificationId = `analysis-complete-${Date.now()}`;
    
    await chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
      title: 'Project Update Analyzed',
      message: `Analysis complete for project ${projectId}. Sentiment: ${analysis.sentiment.label}`,
      priority: 1
    });

    // Auto-clear notification after 10 seconds
    chrome.alarms.create(`clear-${notificationId}`, { when: Date.now() + 10000 });
    
  } catch (error) {
    console.warn('[ProjectUpdateWatcher] Failed to show notification:', error);
  }
}

/**
 * Handle manual analysis request from popup or content script
 */
async function handleManualAnalysisRequest(request, sender, sendResponse) {
  try {
    const { projectId, updateId, text } = request;
    
    console.log(`[ProjectUpdateWatcher] Manual analysis requested for update ${updateId}`);
    
    // Check if analysis already exists
    const existingAnalysis = await analysisDB.getAnalysis(projectId, updateId);
    if (existingAnalysis) {
      sendResponse({ 
        success: true, 
        analysis: existingAnalysis.analysis,
        message: 'Analysis already exists'
      });
      return;
    }

    // Perform analysis
    const analysis = await analyzeProjectUpdate(text);
    
    // Store results
    await analysisDB.storeAnalysis(projectId, updateId, text, analysis);
    
    sendResponse({ 
      success: true, 
      analysis,
      message: 'Analysis completed successfully'
    });
    
  } catch (error) {
    console.error('[ProjectUpdateWatcher] Manual analysis failed:', error);
    sendResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Handle alarm events for notification clearing
 */
function handleAlarm(alarm) {
  if (alarm.name.startsWith('clear-')) {
    const notificationId = alarm.name.replace('clear-', '');
    chrome.notifications.clear(notificationId);
  }
}

// Event listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANALYZE_UPDATE') {
    handleManualAnalysisRequest(request, sender, sendResponse);
    return true; // Keep message channel open for async response
  }
});

chrome.alarms.onAlarm.addListener(handleAlarm);

// Initialize when service worker starts
initializeWatcher();

// Cleanup when service worker stops
self.addEventListener('beforeunload', () => {
  stopWatching();
});

console.log('[ProjectUpdateWatcher] Service worker loaded');
