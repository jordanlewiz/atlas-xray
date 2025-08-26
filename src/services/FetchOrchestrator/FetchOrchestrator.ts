import { DatabaseChangeObserver } from '../DatabaseChangeObserver';

/**
 * High-level orchestrator for the entire fetch system
 * Controls starting and stopping of database monitoring
 */
export class FetchOrchestrator {
  private static isMonitoring = false;

  /**
   * Start the entire fetch system
   * This will begin monitoring the database for changes
   */
  static startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('[Orchestrator] ℹ️ Monitoring already active');
      return;
    }

    console.log('[Orchestrator] 🚀 Starting database change monitoring...');
    
    try {
      // Start monitoring the projectList table
      DatabaseChangeObserver.watchProjectList();
      
      this.isMonitoring = true;
      console.log('[Orchestrator] ✅ Monitoring started successfully');
    } catch (error) {
      console.error('[Orchestrator] ❌ Failed to start monitoring:', error);
      this.isMonitoring = false;
    }
  }

  /**
   * Stop the entire fetch system
   * This will stop all database monitoring
   */
  static stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.log('[Orchestrator] ℹ️ Monitoring not active');
      return;
    }

    console.log('[Orchestrator] 🛑 Stopping database change monitoring...');
    
    try {
      // Stop all monitoring
      DatabaseChangeObserver.stopAllMonitoring();
      
      this.isMonitoring = false;
      console.log('[Orchestrator] ✅ Monitoring stopped successfully');
    } catch (error) {
      console.error('[Orchestrator] ❌ Failed to stop monitoring:', error);
    }
  }

  /**
   * Check if monitoring is currently active
   */
  static isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Restart monitoring (stop then start)
   */
  static restartMonitoring(): void {
    console.log('[Orchestrator] 🔄 Restarting monitoring...');
    this.stopMonitoring();
    this.startMonitoring();
  }
}
