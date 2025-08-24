/**
 * Memory Management Utility
 * 
 * This utility helps manage memory usage and prevent crashes by:
 * 1. Monitoring memory usage
 * 2. Cleaning up resources when memory is high
 * 3. Providing memory usage statistics
 * 4. Managing cleanup intervals
 */

export interface MemoryStats {
  used: number; // MB
  total: number; // MB
  limit: number; // MB
  percentage: number; // Usage percentage
  timestamp: number;
}

export interface CleanupOptions {
  forceGC?: boolean;
  clearCaches?: boolean;
  clearModels?: boolean;
  clearDatabases?: boolean;
}

class MemoryManager {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private memoryThreshold = 0.8; // 80% memory usage threshold
  private checkInterval = 300000; // 5 minutes
  private onHighMemoryCallback: ((stats: MemoryStats) => void) | null = null;
  private memoryHistory: MemoryStats[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.startMonitoring();
  }

  /**
   * Start memory monitoring
   */
  startMonitoring(): void {
    if (this.cleanupInterval) {
      this.stopMonitoring();
    }

    this.cleanupInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, this.checkInterval);

    console.log('[MemoryManager] Memory monitoring started');
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[MemoryManager] Memory monitoring stopped');
    }
  }

  /**
   * Check current memory usage
   */
  checkMemoryUsage(): MemoryStats | null {
    if (!performance.memory) {
      return null;
    }

    const stats: MemoryStats = {
      used: performance.memory.usedJSHeapSize / 1024 / 1024,
      total: performance.memory.totalJSHeapSize / 1024 / 1024,
      limit: performance.memory.jsHeapSizeLimit / 1024 / 1024,
      percentage: 0,
      timestamp: Date.now()
    };

    stats.percentage = (stats.used / stats.limit) * 100;

    // Store in history
    this.memoryHistory.push(stats);
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }

    // Log memory usage
    console.log(`[MemoryManager] Memory: ${stats.used.toFixed(2)}MB / ${stats.limit.toFixed(2)}MB (${stats.percentage.toFixed(1)}%)`);

    // Check if memory usage is high
    if (stats.percentage > this.memoryThreshold * 100) {
      console.warn(`[MemoryManager] High memory usage detected: ${stats.percentage.toFixed(1)}%`);
      
      if (this.onHighMemoryCallback) {
        this.onHighMemoryCallback(stats);
      }

      // Auto-cleanup
      this.performCleanup({
        forceGC: true,
        clearCaches: true
      });
    }

    return stats;
  }

  /**
   * Get current memory stats
   */
  getCurrentMemoryStats(): MemoryStats | null {
    return this.checkMemoryUsage();
  }

  /**
   * Get memory usage history
   */
  getMemoryHistory(): MemoryStats[] {
    return [...this.memoryHistory];
  }

  /**
   * Set callback for high memory usage
   */
  onHighMemory(callback: (stats: MemoryStats) => void): void {
    this.onHighMemoryCallback = callback;
  }

  /**
   * Set memory threshold (0.0 to 1.0)
   */
  setMemoryThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Memory threshold must be between 0.0 and 1.0');
    }
    this.memoryThreshold = threshold;
    console.log(`[MemoryManager] Memory threshold set to ${threshold * 100}%`);
  }

  /**
   * Set check interval in milliseconds
   */
  setCheckInterval(interval: number): void {
    this.checkInterval = interval;
    if (this.cleanupInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  /**
   * Perform memory cleanup
   */
  async performCleanup(options: CleanupOptions = {}): Promise<void> {
    console.log('[MemoryManager] Starting memory cleanup...');

    try {
      // Clear caches if requested
      if (options.clearCaches) {
        await this.clearCaches();
      }

      // Clear models if requested
      if (options.clearModels) {
        await this.clearModels();
      }

      // Clear databases if requested
      if (options.clearDatabases) {
        await this.clearDatabases();
      }

      // Force garbage collection if available
      if (options.forceGC && global.gc) {
        global.gc();
        console.log('[MemoryManager] Forced garbage collection');
      }

      // Wait a bit for cleanup to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check memory again
      const newStats = this.checkMemoryUsage();
      if (newStats) {
        console.log(`[MemoryManager] Cleanup complete. New memory usage: ${newStats.percentage.toFixed(1)}%`);
      }

    } catch (error) {
      console.error('[MemoryManager] Cleanup failed:', error);
    }
  }

  /**
   * Clear various caches
   */
  private async clearCaches(): Promise<void> {
    try {
      // Clear localStorage if available
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
        console.log('[MemoryManager] localStorage cleared');
      }

      // Clear sessionStorage if available
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
        console.log('[MemoryManager] sessionStorage cleared');
      }

      // Clear any other caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('[MemoryManager] Cache storage cleared');
      }

    } catch (error) {
      console.warn('[MemoryManager] Error clearing caches:', error);
    }
  }

  /**
   * Clear AI models
   */
  private async clearModels(): Promise<void> {
    try {
          // Import and cleanup models from AnalysisService
      const { analysisService } = await import('../services/AnalysisService');
      if (analysisService) {
        analysisService.cleanupAIModels();
        console.log('[MemoryManager] AI models cleared');
      }
    } catch (error) {
      console.warn('[MemoryManager] Error clearing models:', error);
    }
  }

  /**
   * Clear databases
   */
  private async clearDatabases(): Promise<void> {
    try {
      // Clear IndexedDB if available
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        }
        console.log('[MemoryManager] IndexedDB databases cleared');
      }
    } catch (error) {
      console.warn('[MemoryManager] Error clearing databases:', error);
    }
  }

  /**
   * Get memory usage summary
   */
  getMemorySummary(): string {
    if (this.memoryHistory.length === 0) {
      return 'No memory data available';
    }

    const latest = this.memoryHistory[this.memoryHistory.length - 1];
    const average = this.memoryHistory.reduce((sum, stat) => sum + stat.percentage, 0) / this.memoryHistory.length;
    const peak = Math.max(...this.memoryHistory.map(stat => stat.percentage));

    return `Current: ${latest.percentage.toFixed(1)}%, Average: ${average.toFixed(1)}%, Peak: ${peak.toFixed(1)}%`;
  }

  /**
   * Dispose of the memory manager
   */
  dispose(): void {
    this.stopMonitoring();
    this.memoryHistory = [];
    this.onHighMemoryCallback = null;
    console.log('[MemoryManager] Disposed');
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    memoryManager.dispose();
  });
}

export default memoryManager;
