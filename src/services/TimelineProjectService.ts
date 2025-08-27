import { extractProjectIdFromUrl } from '../utils/projectUtils';
import { db } from './DatabaseService';
// Import LeaderLine from leader-line-new using require
const LeaderLine = require('leader-line-new');

export class TimelineProjectService {
  private static leaderLines: any[] = [];
  private static scrollContainer: HTMLElement | null = null;
  private static scrollListener: (() => void) | null = null;

  /**
   * Clear all existing dependency lines
   */
  private static clearAllLines(): void {
    try {
      this.leaderLines.forEach(line => {
        try {
          line.remove();
        } catch (error) {
          console.warn('[AtlasXray] ⚠️ Error removing leader line:', error);
        }
      });
      
      this.leaderLines = [];
      
      // Clean up scroll listener
      if (this.scrollContainer && this.scrollListener) {
        this.scrollContainer.removeEventListener('scroll', this.scrollListener);
        this.scrollContainer = null;
        this.scrollListener = null;
      }
    } catch (error) {
      console.error('[AtlasXray] ❌ Error clearing dependency lines:', error);
    }
  }

  /**
   * Draw dependency lines between projects
   * @param dependencies Array of dependency objects with source and target project IDs
   */
  private static drawDependencyLines(dependencies: Array<{ source: string; targets: string[] }>): void {
    try {
      // Clear existing lines first
      this.clearAllLines();
      
      // Find the scrollable container for the timeline
      this.scrollContainer = document.querySelector('[data-sentry-component="TimelineView"]') as HTMLElement;
      if (!this.scrollContainer) {
        this.scrollContainer = document.querySelector('body') as HTMLElement; // Fallback to body
        console.warn('[AtlasXray] ⚠️ Could not find TimelineView container, falling back to body');
      }

      // Create scroll listener to reposition lines
      this.scrollListener = () => {
        this.leaderLines.forEach(line => {
          try {
            line.position();
          } catch (error) {
            console.warn('[AtlasXray] ⚠️ Error repositioning line:', error);
          }
        });
      };

      // Add scroll listener
      if (this.scrollContainer) {
        this.scrollContainer.addEventListener('scroll', this.scrollListener);
      }

      // Also add window resize listener for responsive behavior
      const resizeListener = () => {
        this.leaderLines.forEach(line => {
          try {
            line.position();
          } catch (error) {
            console.warn('[AtlasXray] ⚠️ Error repositioning line on resize:', error);
          }
        });
      };
      
      window.addEventListener('resize', resizeListener);
      
      // Add MutationObserver to handle DOM changes
      const observer = new MutationObserver(() => {
        this.leaderLines.forEach(line => {
          try {
            line.position();
          } catch (error) {
            console.warn('[AtlasXray] ⚠️ Error repositioning line on DOM change:', error);
          }
        });
      });
      
      // Observe the document body for changes
      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      
      let linesDrawn = 0;
      
      // Draw lines for each dependency
      dependencies.forEach(dep => {
        const sourceElement = document.getElementById(dep.source);
        
        if (!sourceElement) {
          console.warn(`[AtlasXray] ⚠️ Could not find source element for ${dep.source}`);
          return;
        }
        
        // Draw lines to each target
        dep.targets.forEach(targetId => {
          const targetElement = document.getElementById(targetId);
          
          if (!targetElement) {
            console.warn(`[AtlasXray] ⚠️ Could not find target element for ${targetId}`);
            return;
          }
          
          try {
            // Create a new LeaderLine
            const line = new LeaderLine(sourceElement, targetElement, {
              color: '#dc3545', // Red color for dependencies
              size: 3, // Line width
              startSocket: 'left', // Connect to left side of source
              endSocket: 'left', // Connect to left side of target
              startPlug: 'disc', // Small disc at start
              endPlug: 'arrow2', // Arrow at end
              path: 'grid',
              dropShadow: false, // Add shadow for better visibility
              outline: true, // Add outline
              outlineColor: '#ffffff', // White outline
              outlineSize: 1, // Outline width
            });

            // Store the line for later removal
            this.leaderLines.push(line);
            linesDrawn++;
            

          } catch (error) {
            console.warn(`[AtlasXray] ⚠️ Could not create line from ${dep.source} to ${targetId}:`, error);
          }
        });
      });


      
    } catch (error) {
      console.error('[AtlasXray] ❌ Error drawing dependency lines:', error);
    }
  }

  /**
   * Search for projects in the timeline and add IDs to their first inner divs
   * @returns Array of project IDs found and processed
   */
  static async findAndProcessTimelineProjects(): Promise<string[]> {
    try {
      // Find all elements with data-sentry-component="ProjectBar"
      const projectBars = document.querySelectorAll('[data-sentry-component="ProjectBar"]');
      
      if (projectBars.length === 0) {
        return [];
      }
      
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

          // Extract project ID from URL using utility function
          const projectId = extractProjectIdFromUrl(href);

          if (!projectId) {
            return;
          }

          // Step 2: Add that ID to the ProjectBar's first inner div
          const firstInnerDiv = projectBar.querySelector('div');
          
          if (!firstInnerDiv) {
            return;
          }

          // Add the project ID to the first inner div
          firstInnerDiv.setAttribute('id', projectId);
          firstInnerDiv.setAttribute('data-project-id', projectId);
          
          // Add to our results array
          projectIds.push(projectId);
          processedCount++;

        } catch (error) {
          console.error(`[AtlasXray] ❌ Error processing ProjectBar ${index + 1}:`, error);
        }
      });



      // Step 3: Look up dependencies for each project ID
      if (projectIds.length > 0) {
        await this.lookupAndDisplayDependencies(projectIds);
      }

      return projectIds;

    } catch (error) {
      console.error('[AtlasXray] ❌ Error in findAndProcessTimelineProjects:', error);
      console.log(`❌ Error processing timeline projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Look up dependencies for each project ID and display them
   * @param projectIds Array of project IDs to look up dependencies for
   */
  private static async lookupAndDisplayDependencies(projectIds: string[]): Promise<void> {
    try {
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
        console.log(`🔗 Dependencies found:\n\n${alertMessage}`);
        
        // Draw visual dependency lines
        const dependenciesForDrawing = dependencyResults.map(result => {
          const match = result.match(/^([A-Z0-9-]+) depends on (.+)$/);
          if (match) {
            return {
              source: match[1],
              targets: match[2].split(' ')
            };
          }
          return null;
        }).filter((dep): dep is { source: string; targets: string[] } => dep !== null);
        
        if (dependenciesForDrawing.length > 0) {
          this.drawDependencyLines(dependenciesForDrawing);
        }
      } else {
        console.log(`🎯 Found ${projectIds.length} projects but no dependencies found in database`);
      }

    } catch (error) {
      console.error('[AtlasXray] ❌ Error looking up dependencies:', error);
      console.log(`❌ Error looking up dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
