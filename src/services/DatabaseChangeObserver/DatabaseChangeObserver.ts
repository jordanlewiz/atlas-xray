import { db } from '../DatabaseService';
import { ProjectFetchCoordinator } from '../ProjectFetchCoordinator/index';
import { bootstrapService } from '../bootstrapService';

/**
 * Monitors database tables for changes and triggers appropriate actions
 * Uses polling approach since Dexie live queries aren't enabled
 */
export class DatabaseChangeObserver {
  private static projectListPollingInterval: NodeJS.Timeout | null = null;
  private static lastProjectCount = 0;
  private static isMonitoring = false;

  /**
   * Start monitoring the projectList table for changes
   * When changes are detected, triggers the ProjectFetchCoordinator
   */
  static watchProjectList(): void {
    if (this.isMonitoring) {
      console.log('[DatabaseChangeObserver] ℹ️ Already monitoring projectList');
      return;
    }

    console.log('[DatabaseChangeObserver] 🔍 Starting projectList monitoring...');
    
    // Start polling every 2 seconds
    this.projectListPollingInterval = setInterval(async () => {
      try {
        const currentCount = await db.countProjectList();
        console.log(`[DatabaseChangeObserver] 🔍 Polling: current=${currentCount}, last=${this.lastProjectCount}`);
        
        // Check if the count has changed (indicating new projects were added)
        if (currentCount !== this.lastProjectCount) {
          console.log(`[DatabaseChangeObserver] 📊 Detected change: ${this.lastProjectCount} → ${currentCount} projects in projectList`);
          
          // Trigger coordinator for any count change (including initial load)
          if (currentCount > 0) {
            // Ensure bootstrap data is loaded before triggering coordinator
            try {
              console.log('[DatabaseChangeObserver] 🚀 Loading bootstrap data for workspace context...');
              await bootstrapService.loadBootstrapData();
              
              // Verify bootstrap data was loaded
              const workspaces = bootstrapService.getWorkspaces();
              if (!workspaces || workspaces.length === 0) {
                console.error('[DatabaseChangeObserver] ❌ Failed to load workspace context, skipping coordinator');
                return;
              }
              console.log(`[DatabaseChangeObserver] ✅ Bootstrap data loaded (${workspaces.length} workspaces available)`);
              
              const projects = await db.getProjectList();
              const projectKeys = projects.map(p => p.projectKey);
              console.log(`[DatabaseChangeObserver] 🚀 Triggering coordinator for ${projectKeys.length} projects`);
              
              try {
                await ProjectFetchCoordinator.handleNewProjects(projectKeys);
                console.log('[DatabaseChangeObserver] ✅ Coordinator completed successfully');
              } catch (coordinatorError) {
                console.error('[DatabaseChangeObserver] ❌ Coordinator failed:', coordinatorError);
              }
            } catch (bootstrapError) {
              console.error('[DatabaseChangeObserver] ❌ Failed to load bootstrap data:', bootstrapError);
            }
          }
          
          // Update the last known count
          this.lastProjectCount = currentCount;
        }
      } catch (error) {
        console.error('[DatabaseChangeObserver] ❌ Error during polling:', error);
      }
    }, 2000); // Check every 2 seconds
    
    this.isMonitoring = true;
    console.log('[DatabaseChangeObserver] ✅ ProjectList monitoring active (polling every 2s)');
  }

  /**
   * Stop monitoring the projectList table
   */
  static stopWatchingProjectList(): void {
    if (this.projectListPollingInterval) {
      clearInterval(this.projectListPollingInterval);
      this.projectListPollingInterval = null;
      this.isMonitoring = false;
      console.log('[DatabaseChangeObserver] 🛑 ProjectList monitoring stopped');
    }
  }

  /**
   * Stop all monitoring
   */
  static stopAllMonitoring(): void {
    this.stopWatchingProjectList();
    console.log('[DatabaseChangeObserver] 🛑 All monitoring stopped');
  }

  /**
   * Check if monitoring is currently active
   */
  static isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}
