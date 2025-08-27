import { extractProjectIdFromUrl } from '../utils/projectUtils';

export class TimelineProjectService {
  /**
   * Search for projects in the timeline and add IDs to their first inner divs
   * @returns Array of project IDs found and processed
   */
  static async findAndProcessTimelineProjects(): Promise<string[]> {
    try {
      console.log('[AtlasXray] 🔍 Searching for timeline projects...');
      
      // Find all elements with data-sentry-component="ProjectBar"
      const projectBars = document.querySelectorAll('[data-sentry-component="ProjectBar"]');
      
      if (projectBars.length === 0) {
        console.log('[AtlasXray] ℹ️ No ProjectBar elements found');
        return [];
      }

      console.log(`[AtlasXray] 📊 Found ${projectBars.length} ProjectBar elements`);
      
      const projectIds: string[] = [];
      let processedCount = 0;

      // Process each ProjectBar element
      projectBars.forEach((projectBar, index) => {
        try {
          // Step 1: Search within the element for an <a> tag
          const linkElement = projectBar.querySelector('a[href]');
          
          if (!linkElement || !linkElement.getAttribute('href')) {
            console.log(`[AtlasXray] ⚠️ ProjectBar ${index + 1} has no link element or href`);
            return;
          }

          const href = linkElement.getAttribute('href')!;
          console.log(`[AtlasXray] 🔗 Found href: ${href}`);

          // Extract project ID from URL using utility function
          const projectId = extractProjectIdFromUrl(href);

          if (!projectId) {
            console.log(`[AtlasXray] ⚠️ Could not extract project ID from href: ${href}`);
            return;
          }

          console.log(`[AtlasXray] 🔑 Extracted project ID "${projectId}"`);

          // Step 2: Add that ID to the ProjectBar's first inner div
          const firstInnerDiv = projectBar.querySelector('div');
          
          if (!firstInnerDiv) {
            console.log(`[AtlasXray] ⚠️ ProjectBar ${index + 1} has no inner div elements`);
            return;
          }

          // Add the project ID to the first inner div
          firstInnerDiv.setAttribute('id', projectId);
          firstInnerDiv.setAttribute('data-project-id', projectId);
          
          // Add to our results array
          projectIds.push(projectId);
          processedCount++;
          
          console.log(`[AtlasXray] ✅ Added ID "${projectId}" to ProjectBar ${index + 1}`);

        } catch (error) {
          console.error(`[AtlasXray] ❌ Error processing ProjectBar ${index + 1}:`, error);
        }
      });

      console.log(`[AtlasXray] ✅ Successfully processed ${processedCount} ProjectBar elements`);
      console.log(`[AtlasXray] 📊 Project IDs found: ${projectIds.join(', ')}`);

      // Alert the array of project IDs found
      if (projectIds.length > 0) {
        alert(`🎯 Found ${projectIds.length} projects: ${projectIds.join(', ')}`);
      } else {
        alert('❌ No projects found on this timeline page');
      }

      return projectIds;

    } catch (error) {
      console.error('[AtlasXray] ❌ Error in findAndProcessTimelineProjects:', error);
      alert(`❌ Error processing timeline projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
}
