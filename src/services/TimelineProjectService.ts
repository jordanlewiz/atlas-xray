import { extractProjectIdFromUrl } from '../utils/projectUtils';
import { db } from './DatabaseService';

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

      // Step 3: Look up dependencies for each project ID
      if (projectIds.length > 0) {
        await this.lookupAndDisplayDependencies(projectIds);
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

  /**
   * Look up dependencies for each project ID and display them
   * @param projectIds Array of project IDs to look up dependencies for
   */
  private static async lookupAndDisplayDependencies(projectIds: string[]): Promise<void> {
    try {
      console.log('[AtlasXray] 🔍 Looking up dependencies for projects...');
      
      const dependencyResults: string[] = [];

      // Look up dependencies for each project
      for (const projectId of projectIds) {
        try {
          // Get dependencies where this project is the source (depends on others)
          const dependencies = await db.getAllProjectDependencies();
          
          const dependsOn = dependencies
            .filter(dep => dep.sourceProjectKey === projectId && dep.linkType === 'DEPENDS_ON')
            .map(dep => dep.targetProjectKey);

          if (dependsOn.length > 0) {
            const dependencyText = `${projectId} depends on ${dependsOn.join(' ')}`;
            dependencyResults.push(dependencyText);
            console.log(`[AtlasXray] 🔗 ${dependencyText}`);
          }
        } catch (error) {
          console.warn(`[AtlasXray] ⚠️ Could not look up dependencies for ${projectId}:`, error);
        }
      }

      // Display results
      if (dependencyResults.length > 0) {
        const alertMessage = dependencyResults.join('\n');
        alert(`🔗 Dependencies found:\n\n${alertMessage}`);
      } else {
        alert(`🎯 Found ${projectIds.length} projects but no dependencies found in database`);
      }

    } catch (error) {
      console.error('[AtlasXray] ❌ Error looking up dependencies:', error);
      alert(`❌ Error looking up dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
