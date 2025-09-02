import { extractProjectIdFromUrl } from '../utils/projectUtils';
import { db } from './DatabaseService';
import { log, setFilePrefix } from '../utils/logger';
// Import LeaderLine from leader-line-new using require
const LeaderLine = require('leader-line-new');

// Set file-level prefix for all logging in this file
setFilePrefix('[TimelineProjectService]');

export class TimelineProjectService {
  private static leaderLines: any[] = [];
  private static scrollContainer: HTMLElement | null = null;
  private static scrollListener: (() => void) | null = null;
  private static dependenciesVisible: boolean = false;
  private static urlChangeListener: (() => void) | null = null;

  /**
   * Clear all existing dependency lines
   */
  static clearAllLines(): void {
    try {
      this.leaderLines.forEach(line => {
        try {
          line.remove();
        } catch (error) {
          log.warn('Error removing leader line:', String(error));
        }
      });
      
      this.leaderLines = [];
      
      // Clean up scroll listener
      if (this.scrollContainer && this.scrollListener) {
        this.scrollContainer.removeEventListener('scroll', this.scrollListener);
        this.scrollContainer = null;
        this.scrollListener = null;
      }
      
      // Update state and notify button
      this.dependenciesVisible = false;
      this.notifyButtonStateChange();
    } catch (error) {
      log.error('Error clearing dependency lines:', String(error));
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
        log.warn('Could not find TimelineView container, falling back to body');
      }

      // Create scroll listener to reposition lines
      this.scrollListener = () => {
        this.leaderLines.forEach(line => {
          try {
            line.position();
          } catch (error) {
            log.warn('Error repositioning line:', String(error));
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
            log.warn('Error repositioning line on resize:', String(error));
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
            log.warn('Error repositioning line on DOM change:', String(error));
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
          log.warn(`Could not find source element for ${dep.source}`);
          return;
        }
        
        // Draw lines to each target
        dep.targets.forEach(targetId => {
          const targetElement = document.getElementById(targetId);
          
          if (!targetElement) {
            log.warn(`Could not find target element for ${targetId}`);
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
              path: 'magnet',
              dropShadow: false, // Add shadow for better visibility
              outline: true, // Add outline
              outlineColor: '#ffffff', // White outline
              outlineSize: 1, // Outline width
            });

            // Store the line for later removal
            this.leaderLines.push(line);
            linesDrawn++;
            

          } catch (error) {
            log.warn(`Could not create line from ${dep.source} to ${targetId}:`, String(error));
          }
        });
      });


      
    } catch (error) {
      log.error('Error drawing dependency lines:', String(error));
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
            log.warn(`ProjectBar ${index + 1} has no link element or href`);
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
          log.error(`Error processing ProjectBar ${index + 1}:`, String(error));
        }
      });



      // Step 3: Look up dependencies for each project ID
      if (projectIds.length > 0) {
        await this.lookupAndDisplayDependencies(projectIds);
      }

      return projectIds;

    } catch (error) {
      log.error('Error in findAndProcessTimelineProjects:', String(error));
      log.error(`Error processing timeline projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            log.debug(`${dependencyText}`);
          }
        } catch (error) {
          log.warn(`Could not look up dependencies for ${projectId}:`, String(error));
        }
      }

      // Display results
      if (dependencyResults.length > 0) {
        const alertMessage = dependencyResults.join('\n');
        log.info(`Dependencies found:\n\n${alertMessage}`);
        
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
        log.info(`Found ${projectIds.length} projects but no dependencies found in database`);
      }

    } catch (error) {
      log.error('Error looking up dependencies:', String(error));
      log.error(`Error looking up dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Toggle dependency lines visibility
   */
  static async toggleDependencies(): Promise<void> {
    if (this.dependenciesVisible) {
      // Hide dependencies
      this.clearAllLines();
      this.dependenciesVisible = false;
    } else {
      // Show dependencies
      await this.findAndProcessTimelineProjects();
      this.dependenciesVisible = true;
    }
  }

  /**
   * Get current dependencies visibility state
   */
  static getDependenciesVisible(): boolean {
    return this.dependenciesVisible;
  }

  /**
   * Notify button state change by dispatching custom event
   */
  private static notifyButtonStateChange(): void {
    // Dispatch custom event for button to listen to
    window.dispatchEvent(new CustomEvent('atlas-xray-dependencies-changed', {
      detail: { visible: this.dependenciesVisible }
    }));
  }

  /**
   * Setup URL change listener to clear dependencies
   */
  static setupUrlChangeListener(): void {
    // Remove existing listener if any
    if (this.urlChangeListener) {
      window.removeEventListener('popstate', this.urlChangeListener);
    }

    // Create new listener
    this.urlChangeListener = () => {
      log.debug('URL change detected (popstate/hashchange), clearing dependencies');
      this.clearAllLines();
    };

    // Add listener for browser back/forward
    window.addEventListener('popstate', this.urlChangeListener);
    
    // Also listen for hash changes (common in SPAs)
    window.addEventListener('hashchange', this.urlChangeListener);
    
    // Watch for navigation events in the DOM (Jira is a SPA)
    const navigationObserver = new MutationObserver((mutations) => {
      // Check if we're still on a timeline page
      const currentUrl = window.location.href;
      if (!currentUrl.includes('projects?view=timeline')) {
        log.debug('Navigation away from timeline detected, clearing dependencies');
        this.clearAllLines();
      }
    });
    
    // Observe the entire document for navigation changes
    navigationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Store observer for cleanup
    (this as any).navigationObserver = navigationObserver;
    
    // Also set up a more aggressive URL change detection
    let lastUrl = window.location.href;
    const urlCheckInterval = setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        log.debug('URL changed from', lastUrl, 'to', currentUrl, '- clearing dependencies');
        lastUrl = currentUrl;
        this.clearAllLines();
      }
    }, 500); // Check every 500ms
    
    // Store interval for cleanup
    (this as any).urlCheckInterval = urlCheckInterval;
  }

  /**
   * Cleanup URL change listener
   */
  static cleanupUrlChangeListener(): void {
    if (this.urlChangeListener) {
      window.removeEventListener('popstate', this.urlChangeListener);
      window.removeEventListener('hashchange', this.urlChangeListener);
      this.urlChangeListener = null;
    }
    
    // Disconnect the navigation observer
    if ((this as any).navigationObserver) {
      (this as any).navigationObserver.disconnect();
      (this as any).navigationObserver = null;
    }
    
    // Clear the URL check interval
    if ((this as any).urlCheckInterval) {
      clearInterval((this as any).urlCheckInterval);
      (this as any).urlCheckInterval = null;
    }
  }
}
