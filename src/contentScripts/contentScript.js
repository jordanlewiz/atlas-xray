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

// Initialize simple project fetching on page load
console.log('[AtlasXray] 🚀 Initializing simple project fetcher...');

// Start simple project fetching after a short delay to ensure page is loaded
setTimeout(async () => {
  try {
    console.log('[AtlasXray] 📥 Starting simple project fetch on page load...');
    
    // First, ensure bootstrap service is loaded
    const { bootstrapService } = await import('../services/bootstrapService.js');
    await bootstrapService.loadBootstrapData();
    
    // Import and run the simple project list fetcher (only runs once per page load)
    const { simpleProjectListFetcher } = await import('../services/simpleProjectListFetcher.js');
    console.log('[AtlasXray] ✅ Simple project list fetcher imported');
    
    // Fetch projects on page load (no periodic fetching)
    await simpleProjectListFetcher.fetchProjectsOnPageLoad();
    
  } catch (error) {
    console.error('[AtlasXray] ❌ Failed to start simple project fetcher:', error);
  }
}, 2000); // Wait 2 seconds for page to fully load



console.log('[AtlasXray] 🚀 Content script loaded and ready');
