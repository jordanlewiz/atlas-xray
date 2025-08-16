import { getItem, setItem } from "../utils/dexieDB";

// Regex for /o/{cloudId}/s/{sectionId}/project/{ORG-123}
const projectLinkPattern = /\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/;

/**
 * Given an array of href strings, extract unique {projectId, cloudId} pairs.
 * @param {string[]} hrefs
 * @returns {Array<{projectId: string, cloudId: string}>}
 */
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

/**
 * Scans the page for project links, extracts unique projectId/cloudId pairs, and stores them in the DB.
 * Returns the list of found projects.
 */
export async function scanAndStoreProjectIds() {
  const links = Array.from(document.querySelectorAll('a[href]'));
  const hrefs = links.map(link => link.getAttribute('href'));
  const matches = findMatchingProjectLinksFromHrefs(hrefs);
  for (const { projectId, cloudId } of matches) {
    const key = `projectId:${projectId}`;
    const existing = await getItem(key);
    if (!existing) {
      await setItem(key, projectId);
    }
  }
  return matches;
}
