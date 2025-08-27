/**
 * Utility functions for working with project data
 */

/**
 * Extract project ID from a URL using multiple patterns
 * @param href The URL to extract the project ID from
 * @returns The extracted project ID or null if not found
 */
export function extractProjectIdFromUrl(href: string): string | null {
  if (!href) return null;

  // Try multiple patterns to extract project key
  const projectIdPatterns = [
    /\/projects?\/([^\/\?]+)/,  // /project/ID or /projects/ID
    /project\/([^\/\?]+)/,      // project/ID
    /projects\/([^\/\?]+)/      // projects/ID
  ];
  
  for (const pattern of projectIdPatterns) {
    const match = href.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
