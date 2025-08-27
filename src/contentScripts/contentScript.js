/**
 * Atlas Xray Chrome Extension - Content Script
 * 
 * This content script is injected into Atlassian project pages to:
 * 1. Inject a floating button UI component for user interaction
 * 2. Scan the page for project data and download it to IndexedDB
 * 3. Monitor DOM changes to continuously capture new project data
 * 4. Trigger AI analysis for all project updates
 * 
 * The script runs on pages matching the host_permissions in manifest.json
 * and provides the core functionality for data extraction and UI injection.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import FloatingButton from "../components/FloatingButton/FloatingButton";
import "../components/FloatingButton/FloatingButton.scss";

// Custom styles will be merged with contentScript.css during build


const container = document.createElement("div");
document.body.appendChild(container);
createRoot(container).render(<FloatingButton />);

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

// ✅ NEW: Clean page load - nothing happens automatically
console.log('[AtlasXray] 🚀 Extension loaded - waiting for user interaction');


console.log('[AtlasXray] 🚀 Content script loaded and ready');

// Listen for URL changes to detect timeline view
function checkForTimelineView() {
  const currentUrl = window.location.href;
  if (currentUrl.includes('projects?view=timeline')) {
    alert('🎯 Timeline view detected! This page contains projects?view=timeline');
  }
}

// Check on initial load
checkForTimelineView();

// Listen for URL changes (for SPAs)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    checkForTimelineView();
  }
});

// Start observing
observer.observe(document.body, { childList: true, subtree: true });

// Also listen for popstate events (browser back/forward)
window.addEventListener('popstate', checkForTimelineView);
