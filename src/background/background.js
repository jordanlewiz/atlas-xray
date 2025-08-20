/**
 * Atlas Xray Chrome Extension - Background Service Worker
 * 
 * This background script runs in the extension's service worker context and:
 * 1. Manages extension lifecycle events (install, update, startup)
 * 2. Performs periodic version checks against GitHub releases
 * 3. Shows update notifications to users when new versions are available
 * 4. Handles extension icon clicks and other background tasks
 * 
 * The service worker remains active to handle version checking and
 * extension management even when no tabs are open.
 */

console.log('[AtlasXray] Background service worker is running');

// Import version checker (will be bundled by esbuild)
import { VersionChecker } from '../utils/versionChecker';

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
    console.log('[AtlasXray] Cleared notification:', notificationId);
  }
});

// Set up periodic version checking
chrome.alarms.create('version-check', {
  delayInMinutes: 1, // First check after 1 minute
  periodInMinutes: 1440 // Then every 24 hours
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
