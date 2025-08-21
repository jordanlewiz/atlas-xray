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
        
        // Test AI analysis capability
        // console.log('[AtlasXray] 🧪 Testing AI analysis capability...');
        // const testResponse = await chrome.runtime.sendMessage({
        //   type: 'ANALYZE_UPDATE_QUALITY',
        //   updateId: 'test_initial',
        //   updateText: 'Initial test of AI analysis system',
        //   updateType: 'general',
        //   state: 'on-track'
        // });
        // 
        // if (testResponse && testResponse.success) {
        //   console.log('[AtlasXray] ✅ AI analysis system ready:', testResponse.result);
        // } else {
        //   console.warn('[AtlasXray] ⚠️ AI analysis test failed:', testResponse?.error);
        // }
        
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

// Initial project data download using new pipeline
setTimeout(async () => {
  try {
    const { projectPipeline } = await import('../services/projectPipeline');
    console.log('[AtlasXray] 🚀 Starting initial project scan with new pipeline...');
    const count = await projectPipeline.scanProjectsOnPage();
    console.log(`[AtlasXray] ✅ Initial scan complete. Found ${count} projects on page.`);
  } catch (error) {
    console.error('[AtlasXray] ❌ Initial project scan failed:', error);
  }
}, 2000); // Wait 2 seconds for DOM to be fully loaded

// Monitor DOM changes for new projects
const observer = new MutationObserver((mutations) => {
  let shouldRescan = false;
  
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if new project links were added
          const projectLinks = node.querySelectorAll && node.querySelectorAll('a[href*="/project/"]');
          if (projectLinks && projectLinks.length > 0) {
            shouldRescan = true;
          }
        }
      });
    }
  });
  
  if (shouldRescan) {
    console.log('[AtlasXray] 🔄 DOM changes detected, rescanning for new projects...');
    // Use the new pipeline system for scanning
    import('../services/projectPipeline').then(({ projectPipeline }) => {
      projectPipeline.scanProjectsOnPage().then((count) => {
        console.log(`[AtlasXray] ✅ Rescan complete. Found ${count} projects on page.`);
      }).catch((error) => {
        console.error('[AtlasXray] ❌ Rescan failed:', error);
      });
    }).catch((error) => {
      console.error('[AtlasXray] ❌ Failed to import pipeline:', error);
    });
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Add test functions to window for debugging
window.testAtlasXray = async () => {
  console.log('[AtlasXray] 🧪 Manual test triggered...');
  try {
    const response = await chrome.runtime.sendMessage({ type: 'PING' });
    console.log('[AtlasXray] Test response:', response);
    
    // Test analysis
    // const analysisResponse = await chrome.runtime.sendMessage({
    //   type: 'ANALYZE_UPDATE_QUALITY',
    //   updateId: 'manual_test',
    //   updateText: 'Manual test of the analysis system',
    //   updateType: 'general',
    //   state: 'on-track'
    // });
    // console.log('[AtlasXray] Analysis test response:', analysisResponse);
    
  } catch (error) {
    console.error('[AtlasXray] Test failed:', error);
  }
};

console.log('[AtlasXray] 🚀 Content script loaded and ready');
console.log('[AtlasXray] 💡 Use window.testAtlasXray() in console to test the system');
