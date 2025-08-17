import { getItem, setItem, setProjectView, upsertProjectStatusHistory, upsertProjectUpdates } from "../utils/database";
import { apolloClient } from "../services/apolloClient";
import { gql } from "@apollo/client";
import { PROJECT_VIEW_QUERY } from "../graphql/projectViewQuery";
import { PROJECT_STATUS_HISTORY_QUERY } from "../graphql/projectStatusHistoryQuery";
import { PROJECT_UPDATES_QUERY } from "../graphql/projectUpdatesQuery";

// Regex for /o/{cloudId}/s/{sectionId}/project/{ORG-123}
const projectLinkPattern = /\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/;

export function findMatchingProjectLinksFromHrefs(hrefs) {
  const seen = new Set();
  const results = [];
  hrefs.forEach(href => {
    const match = href.match(projectLinkPattern);
    if (match && match[3]) {
      const cloudId = match[1];
      const projectId = match[3];
      const key = `${cloudId}:${projectId}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({ projectId, cloudId });
      }
    }
  });
  return results;
}

async function fetchAndStoreProjectData(projectId, cloudId) {
  const variables = {
    key: projectId,
    trackViewEvent: "DIRECT",
    workspaceId: null,
    onboardingKeyFilter: "PROJECT_SPOTLIGHT",
    areMilestonesEnabled: false,
    cloudId: cloudId || "",
    isNavRefreshEnabled: true
  };
  
  // ProjectView
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_VIEW_QUERY}`,
      variables
    });
    await setProjectView(projectId, data);
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch project view data for projectId: ${projectId}`, err);
  }



  // ProjectStatusHistory (normalize and store one row per status change)
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_STATUS_HISTORY_QUERY}`,
      variables: { projectKey: projectId }
    });
    console.log("[AtlasXray] Status history API response for", projectId, data);
    // Normalize: extract all .node from edges
    if (!projectId) {
      console.error('[AtlasXray] projectId is undefined when saving status history!');
    }
    const nodes = data?.project?.updates?.edges?.map(edge => edge.node).filter(Boolean) || [];
    console.log('[AtlasXray] Calling upsertProjectStatusHistory with projectId:', projectId, nodes);
    if (nodes.length > 0) {
      await upsertProjectStatusHistory(nodes, projectId);
    }
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch project status history for projectId: ${projectId}`, err);
  }




  // ProjectUpdates (normalize and store flat rows)
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_UPDATES_QUERY}`,
      variables: { key: projectId, isUpdatesTab: true }
    });
    // Normalize: extract all .node from edges
    const nodes = data?.project?.updates?.edges?.map(edge => edge.node).filter(Boolean) || [];
    if (nodes.length > 0) {
      await upsertProjectUpdates(nodes, projectId);
    }
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch [ProjectUpdatesQuery] for projectId: ${projectId}`, err);
  }
}

export async function downloadProjectData() {
  const links = Array.from(document.querySelectorAll('a[href]'));
  const hrefs = links.map(link => link.getAttribute('href'));
  const matches = findMatchingProjectLinksFromHrefs(hrefs);
  for (const { projectId, cloudId } of matches) {
    const key = `projectId:${projectId}`;
    const existing = await getItem(key);
    if (!existing) {
      await setItem(key, projectId);
      await fetchAndStoreProjectData(projectId, cloudId);
    }
  }
  return matches;
}
