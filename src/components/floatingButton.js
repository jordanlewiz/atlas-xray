// src/components/floatingButton.js

import { apolloClient } from "../services/apolloClient";
import { gql } from "@apollo/client";
import { PROJECT_VIEW_QUERY } from "../graphql/projectViewQuery";
import { PROJECT_STATUS_HISTORY_QUERY } from "../graphql/projectStatusHistoryQuery";
import { PROJECT_UPDATES_QUERY } from "../graphql/projectUpdatesQuery";
import { downloadProjectData } from "../utils/projectIdScanner";

// Remove fetchAndLogProjectView and any references to it.

(function() {
  // Floating button code
  var button = document.createElement('button');
  button.innerText = 'Atlas Xray Loaded';
  button.style.position = 'fixed';
  button.style.top = '20px';
  button.style.right = '20px';
  button.style.zIndex = '9999';
  button.style.padding = '10px 18px';
  button.style.background = '#0052cc';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '6px';
  button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  button.style.fontSize = '16px';
  button.style.cursor = 'pointer';
  button.style.fontFamily = 'inherit';
  document.body.appendChild(button);

  async function saveProjectIdIfNew(projectId, cloudId) {
    const key = `projectId:${projectId}`;
    const existing = await getItem(key);
    if (!existing) {
      await setItem(key, projectId);
      // fetchAndLogProjectView(projectId, cloudId); // This line is removed
    }
  }

  // Remove any old project link scanning, extraction, and storage logic.
  // Only use scanAndStoreProjectIds for this purpose.
  async function triggerPageProjectScan() {
    return await downloadProjectData();
  }

  // Initial scan
  triggerPageProjectScan();

  // Watch for page changes (SPA navigation)
  var observer = new MutationObserver(() => {
    triggerPageProjectScan();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
