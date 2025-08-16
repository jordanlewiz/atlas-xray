import { getItem, setItem, setProjectView, setProjectStatusHistory, setProjectUpdates } from "../utils/database";
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
  // ProjectStatusHistory
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_STATUS_HISTORY_QUERY}`,
      variables: { projectKey: projectId }
    });
    await setProjectStatusHistory(projectId, data);
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch project status history for projectId: ${projectId}`, err);
  }
  // ProjectUpdates
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_UPDATES_QUERY}`,
      variables: { key: projectId, isUpdatesTab: true }
    });
    await setProjectUpdates(projectId, data);
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
