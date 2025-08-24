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

// Extract and store cloud ID and section ID from URL
const extractAndStoreCloudId = () => {
  try {
    const url = window.location.href;
    console.log('[AtlasXray] 🔍 Extracting cloud ID from URL:', url);
    
    let cloudId = null;
    let sectionId = null;

    // PRIORITY 1: Extract from URL path /o/{cloudId}/s/{sectionId} (most reliable)
    const pathMatch = url.match(/\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)/);
    if (pathMatch && pathMatch[1] && pathMatch[2]) {
      cloudId = pathMatch[1];
      sectionId = pathMatch[2];
      console.log('[AtlasXray] ✅ Extracted from path:', { cloudId, sectionId });
    }

    // PRIORITY 2: Extract from URL path /o/{cloudId}/projects (fallback)
    if (!cloudId) {
      const projectsMatch = url.match(/\/o\/([a-f0-9\-]+)\/projects/);
      if (projectsMatch && projectsMatch[1]) {
        cloudId = projectsMatch[1];
        // For projects pages, try to get section ID from URL parameter
        const sectionIdParam = url.match(/[?&]cloudId=([a-f0-9\-]+)/);
        if (sectionIdParam && sectionIdParam[1]) {
          sectionId = sectionIdParam[1];
        } else {
          sectionId = 'default';
        }
        console.log('[AtlasXray] ✅ Extracted from projects path:', { cloudId, sectionId });
      }
    }

    // PRIORITY 3: Extract from URL parameter cloudId=... (least reliable, only if path fails)
    if (!cloudId) {
      const cloudIdParam = url.match(/[?&]cloudId=([a-f0-9\-]+)/);
      if (cloudIdParam && cloudIdParam[1]) {
        cloudId = cloudIdParam[1];
        sectionId = 'default';
        console.log('[AtlasXray] ✅ Extracted from URL parameter:', { cloudId, sectionId });
      }
    }

    if (cloudId) {
      // Store in global state
      if (typeof window !== 'undefined') {
        window.atlasXrayCloudId = cloudId;
        window.atlasXraySectionId = sectionId;
        console.log('[AtlasXray] 🌐 Cloud ID stored in window:', { cloudId, sectionId });
      }
    } else {
      console.warn('[AtlasXray] ⚠️ Could not extract cloud ID from URL');
    }
  } catch (error) {
    console.error('[AtlasXray] ❌ Error extracting cloud ID:', error);
  }
};

// Extract cloud ID immediately
extractAndStoreCloudId();

// Debug: Check what was extracted
setTimeout(() => {
  console.log('[AtlasXray] 🔍 Debug - Window cloud ID:', window.atlasXrayCloudId);
  console.log('[AtlasXray] 🔍 Debug - Window section ID:', window.atlasXraySectionId);
}, 100);

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

// Initialize project discovery service on page load
console.log('[AtlasXray] 🚀 Initializing project discovery service...');

// Start project discovery after a short delay to ensure page is loaded
setTimeout(async () => {
  try {
    console.log('[AtlasXray] 📥 Starting project discovery on page load...');
    
    // Import and run the project discovery service (only runs once per page load)
    const { projectDiscoveryService } = await import('../services/ProjectDiscoveryService.js');
    console.log('[AtlasXray] ✅ Project discovery service imported');
    
    // Fetch projects on page load (no periodic fetching)
    await projectDiscoveryService.discoverProjectsOnPage();
    
  } catch (error) {
    console.error('[AtlasXray] ❌ Failed to start project discovery service:', error);
  }
}, 2000); // Wait 2 seconds for page to fully load

// Add test functions to window for debugging
if (typeof window !== 'undefined') {
  window.testAtlasXray = async () => {
    console.log('[AtlasXray] 🧪 Manual test triggered...');
    try {
      const response = await chrome.runtime.sendMessage({ type: 'PING' });
      console.log('[AtlasXray] Test response:', response);
      
      // Test bootstrap service
      try {
        const { bootstrapService } = await import('../services/bootstrapService.js');
        console.log('[AtlasXray] 🧪 Testing bootstrap service...');
        const bootstrapData = await bootstrapService.loadBootstrapData();
        console.log('[AtlasXray] ✅ Bootstrap test result:', bootstrapData);
      } catch (error) {
        console.error('[AtlasXray] ❌ Bootstrap test failed:', error);
      }
      
      // Test project discovery service
      try {
        const { projectDiscoveryService } = await import('../services/ProjectDiscoveryService.js');
        console.log('[AtlasXray] 🧪 Testing project discovery service...');
        const projects = await projectDiscoveryService.discoverProjectsOnPage();
        console.log('[AtlasXray] ✅ Project discovery test result:', projects);
      } catch (error) {
        console.error('[AtlasXray] ❌ Project discovery test failed:', error);
      }
      
      // Test modal data fetching
      try {
        const { modalDataFetcher } = await import('../services/modalDataFetcher.js');
        console.log('[AtlasXray] 🧪 Testing modal data fetch...');
        const result = await modalDataFetcher.fetchProjectUpdatesForModal();
        console.log('[AtlasXray] ✅ Modal data fetch test result:', result);
      } catch (error) {
        console.error('[AtlasXray] ❌ Modal data fetch test failed:', error);
      }
      
    } catch (error) {
      console.error('[AtlasXray] Test failed:', error);
    }
  };
  
  console.log('[AtlasXray] 🧪 Test function added to window.testAtlasXray()');
}

console.log('[AtlasXray] 🚀 Content script loaded and ready');
console.log('[AtlasXray] 💡 Use window.testAtlasXray() in console to test the system');
