// src/components/floatingButton.js

import { downloadProjectData } from "../utils/projectIdScanner";

// Remove fetchAndLogProjectView and any references to it.

(function() {
  // Floating button code
  var button = document.createElement('button');
  button.innerText = 'Atlas Xray Loaded';
  button.className = 'atlas-xray-floating-btn';
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
