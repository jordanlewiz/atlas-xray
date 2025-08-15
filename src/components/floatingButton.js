// src/components/floatingButton.js

import { setItem, getItem } from "../utils/dexieDB";
import { apolloClient } from "../services/apolloClient";
import { gql } from "@apollo/client";
import { PROJECT_VIEW_QUERY } from "../graphql/projectViewQuery";

// Fetch and log project view GraphQL data for a given projectId using Apollo
async function fetchAndLogProjectView(projectId, cloudId) {
  const variables = {
    key: projectId,
    trackViewEvent: "DIRECT",
    workspaceId: "V29ya3NwYWNlLU3VtbWFyeTo5MDgx", 
    onboardingKeyFilter: "PROJECT_SPOTLIGHT", 
    areMilestonesEnabled: false,
    cloudId: cloudId || "", // Use extracted cloudId
    isNavRefreshEnabled: true
  };
  console.log(`[AtlasXray] Triggering Apollo GraphQL fetch for projectId: ${projectId}, cloudId: ${cloudId}`);
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_VIEW_QUERY}`,
      variables
    });
    console.log(`[AtlasXray] Apollo GraphQL fetch successful for projectId: ${projectId}`, data);
    // TODO: store the result in IndexedDB or handle as needed
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch project view data for projectId: ${projectId}`, err);
  }
}

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

  // Regex for /o/{cloudId}/s/{sectionId}/project/{ORG-123}
  var projectLinkPattern = /\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/;

  async function saveProjectIdIfNew(projectId, cloudId) {
    const key = `projectId:${projectId}`;
    const existing = await getItem(key);
    if (!existing) {
      await setItem(key, projectId);
      fetchAndLogProjectView(projectId, cloudId);
    }
  }

  function findMatchingProjectLinks() {
    var links = Array.from(document.querySelectorAll('a[href]'));
    var matches = links.filter(link => projectLinkPattern.test(link.getAttribute('href')));
    matches.forEach(link => {
      var match = link.getAttribute('href').match(projectLinkPattern);
      if (match && match[3]) {
        const cloudId = match[1];
        const projectId = match[3];
        saveProjectIdIfNew(projectId, cloudId);
      }
    });
    return matches;
  }

  // Initial scan
  findMatchingProjectLinks();

  // Watch for page changes (SPA navigation)
  var observer = new MutationObserver(() => {
    findMatchingProjectLinks();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
