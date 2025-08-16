// Utility to extract unique projectId/cloudId pairs from an array of hrefs

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
