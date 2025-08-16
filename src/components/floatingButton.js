// src/components/floatingButton.js

import { setItem, getItem, setProjectView, setProjectStatusHistory, setProjectUpdates, setUpdate } from "../utils/dexieDB";
import { apolloClient } from "../services/apolloClient";
import { gql } from "@apollo/client";
import { PROJECT_VIEW_QUERY } from "../graphql/projectViewQuery";
import { PROJECT_STATUS_HISTORY_QUERY } from "../graphql/projectStatusHistoryQuery";
import { PROJECT_UPDATES_QUERY } from "../graphql/projectUpdatesQuery";
import { scanAndStoreProjectIds, findMatchingProjectLinksFromHrefs } from "../utils/projectIdScanner";

// Fetch and log project view GraphQL data for a given projectId using Apollo
async function fetchAndLogProjectView(projectId, cloudId) {
  const variables = {
    key: projectId,
    trackViewEvent: "DIRECT",
    workspaceId: null,
    onboardingKeyFilter: "PROJECT_SPOTLIGHT",
    areMilestonesEnabled: false,
    cloudId: cloudId || "",
    isNavRefreshEnabled: true
  };
  console.log(`[AtlasXray] Triggering Apollo GraphQL fetch for projectId: ${projectId}, cloudId: ${cloudId}, workspaceId: ${variables.workspaceId}`);
  
  // Fetch ProjectViewQuery
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_VIEW_QUERY}`,
      variables
    });
    console.log(`[AtlasXray] Apollo GraphQL fetch successful for [ProjectViewQuery] projectId: ${projectId}`, data);
    await setProjectView(projectId, data); // Store the result in projectView store
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch project view data for projectId: ${projectId}`, err);
  }

  // Fetch ProjectStatusHistoryQuery
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_STATUS_HISTORY_QUERY}`,
      variables: { projectKey: projectId }
    });
    console.log(`[AtlasXray] Apollo GraphQL fetch successful for [ProjectStatusHistoryQuery] projectId: ${projectId}`, data);
    await setProjectStatusHistory(projectId, data); // Store the result in projectStatusHistory store
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch project status history for projectId: ${projectId}`, err);
  }

  // Fetch ProjectUpdatesQuery
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_UPDATES_QUERY}`,
      variables: { key: projectId, isUpdatesTab: true }
    });
    console.log(`[AtlasXray] Apollo GraphQL fetch successful for [ProjectUpdatesQuery] projectId: ${projectId}`, data);
    await setProjectUpdates(projectId, data); // Store the result in projectUpdates store
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch [ProjectUpdatesQuery] for projectId: ${projectId}`, err);
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

  // Replace findMatchingProjectLinks with scanAndStoreProjectIds
  async function findMatchingProjectLinks() {
    return await scanAndStoreProjectIds();
  }

  // Initial scan
  findMatchingProjectLinks();

  // Watch for page changes (SPA navigation)
  var observer = new MutationObserver(() => {
    findMatchingProjectLinks();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
