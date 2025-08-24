/**
 * Project Update Watcher - Background Service Worker
 * 
 * This service worker monitors Dexie database for new project updates
 * and automatically analyzes them using Transformers.js
 */

// Use dynamic imports for ES6 modules in background script
let analysisDB, initializeDatabase, analyzeUpdateQuality;

// Initialize imports when script loads
async function initializeImports() {
  try {
    const dbModule = await import('../services/DatabaseService');
    const analysisModule = await import('../services/AnalysisService');
    
    analysisDB = dbModule.analysisDB;
    initializeDatabase = dbModule.initializeDatabase;
    analyzeUpdateQuality = analysisModule.analyzeUpdateQuality;
    
    console.log('[ProjectUpdateWatcher] ✅ Imports initialized successfully');
    return true;
  } catch (error) {
    console.error('[ProjectUpdateWatcher] ❌ Failed to initialize imports:', error);
    return false;
  }
}

// Performance optimizations - SIMPLIFIED
const WATCH_INTERVAL = 60000; // Check every 60 seconds
const MAX_TEXT_LENGTH = 1500; // Limit text length for AI
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
    
    // First initialize imports
    const importsReady = await initializeImports();
    if (!importsReady) {
      console.error('[ProjectUpdateWatcher] Failed to initialize imports, aborting');
      return;
    }
    
    // Initialize database (this will trigger background analysis of unanalyzed updates)
    await initializeDatabase();
    
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
 * This fetches updates that haven't been analyzed yet
 */
async function getNewUpdatesFromDexie() {
  try {
    // Debug: Check total updates first
    const totalUpdates = await analysisDB.countProjectUpdates();
    const analyzedUpdates = await analysisDB.countAnalyzedUpdates();
    
    console.log(`[ProjectUpdateWatcher] Database status: ${totalUpdates} total updates, ${analyzedUpdates} analyzed`);
    
    // Get unanalyzed updates from the database
    const unanalyzedUpdates = await analysisDB.getUnanalyzedUpdates();
    
    if (unanalyzedUpdates.length === 0) {
      console.log(`[ProjectUpdateWatcher] No unanalyzed updates found. Total: ${totalUpdates}, Analyzed: ${analyzedUpdates}`);
      return [];
    }
    
    console.log(`[ProjectUpdateWatcher] Found ${unanalyzedUpdates.length} unanalyzed updates`);
    
    // Convert to the format expected by analyzeAndStoreUpdate
    return unanalyzedUpdates.map(update => ({
      projectId: update.projectKey,
      updateId: update.uuid,
      text: update.summary || ''
    }));
    
  } catch (error) {
    console.error('[ProjectUpdateWatcher] Failed to get updates from Dexie:', error);
    return [];
  }
}

/**
 * Analyze a project update and store the results DIRECTLY in ProjectUpdate
 */
async function analyzeAndStoreUpdate(update) {
  try {
    const { projectId, updateId, text } = update;
    
    console.log(`[ProjectUpdateWatcher] Analyzing update ${updateId} for project ${projectId}`);
    
    // Check if already analyzed
    const existingUpdate = await analysisDB.projectUpdates.where('uuid').equals(updateId).first();
    if (existingUpdate?.analyzed) {
      console.log(`[ProjectUpdateWatcher] Update ${updateId} already analyzed`);
      return;
    }

    // Truncate text if too long
    const truncatedText = text.length > MAX_TEXT_LENGTH 
      ? text.substring(0, MAX_TEXT_LENGTH) + '...'
      : text;
    
    console.log(`[ProjectUpdateWatcher] Performing AI analysis for update ${updateId}`);
    
    // Add timeout protection
    const analysisPromise = analyzeUpdateQuality(truncatedText);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Analysis timeout')), ANALYSIS_TIMEOUT);
    });
    
    try {
      const qualityResult = await Promise.race([analysisPromise, timeoutPromise]);
      
      // Update ProjectUpdate record directly - SIMPLE!
      await analysisDB.updateProjectUpdateQuality(updateId, qualityResult);
      
      console.log(`[ProjectUpdateWatcher] ✅ Successfully analyzed update ${updateId} with quality score: ${qualityResult.overallScore}%`);
      
    } catch (error) {
      console.error(`[ProjectUpdateWatcher] AI Analysis failed for update ${updateId}:`, error);
      
      // Mark as analyzed but with error state
      if (existingUpdate) {
        await analysisDB.projectUpdates.update(existingUpdate.uuid, {
          analyzed: true,
          updateQuality: 0,
          qualityLevel: 'poor',
          analysisDate: new Date().toISOString()
        });
      }
    }
    
  } catch (error) {
    console.error(`[ProjectUpdateWatcher] Failed to analyze update ${update.updateId}:`, error);
  }
}

// REMOVED: Unused functions - Keep it simple!

// REMOVED: Unused alarm handler

// NO MESSAGE LISTENERS - Keep it simple!

// Initialize when service worker starts
initializeWatcher();

// Cleanup when service worker stops
self.addEventListener('beforeunload', () => {
  stopWatching();
});

// Export functions for use by background script
self.analyzeAndStoreUpdate = analyzeAndStoreUpdate;

console.log('[ProjectUpdateWatcher] Service worker loaded');
