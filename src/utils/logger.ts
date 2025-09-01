/**
 * Simple, unified logging utility that wraps browser console methods
 * with manual prefix control and debug toggle integration
 */

export interface Logger {
  debug: (prefix: string, message: string, ...args: any[]) => void;
  info: (prefix: string, message: string, ...args: any[]) => void;
  warn: (prefix: string, message: string, ...args: any[]) => void;
  error: (prefix: string, message: string, ...args: any[]) => void;
}

/**
 * Check if debug logging is enabled
 * @returns true if debug toggle is ON, false if OFF
 */
function isDebugEnabled(): boolean {
  try {
    // Check localStorage for debug toggle state
    return localStorage.getItem('atlas-xray-debug') === 'true';
  } catch (error) {
    // Fallback to false if localStorage is not available
    return false;
  }
}

/**
 * Unified logger instance with manual prefix control
 * Only logs when debug toggle is enabled (except errors which always show)
 */
export const log: Logger = {
  /**
   * Debug level logging - only shows when debug toggle is ON
   * @param prefix - Manual prefix for service identification (e.g., '[PageTypeDetector]')
   * @param message - Log message
   * @param args - Additional arguments to log
   */
  debug: (prefix: string, message: string, ...args: any[]) => {
    if (isDebugEnabled()) {
      console.log(`${prefix} 🔍 ${message}`, ...args);
    }
  },

  /**
   * Info level logging - only shows when debug toggle is ON
   * @param prefix - Manual prefix for service identification (e.g., '[ContentScript]')
   * @param message - Log message
   * @param args - Additional arguments to log
   */
  info: (prefix: string, message: string, ...args: any[]) => {
    if (isDebugEnabled()) {
      console.log(`${prefix} ℹ️ ${message}`, ...args);
    }
  },

  /**
   * Warning level logging - only shows when debug toggle is ON
   * @param prefix - Manual prefix for service identification (e.g., '[TimelineService]')
   * @param message - Log message
   * @param args - Additional arguments to log
   */
  warn: (prefix: string, message: string, ...args: any[]) => {
    if (isDebugEnabled()) {
      console.log(`${prefix} ⚠️ ${message}`, ...args);
    }
  },

  /**
   * Error level logging - ALWAYS shows regardless of debug toggle
   * @param prefix - Manual prefix for service identification (e.g., '[DatabaseService]')
   * @param message - Log message
   * @param args - Additional arguments to log
   */
  error: (prefix: string, message: string, ...args: any[]) => {
    // Errors always show - they're critical
    console.error(`${prefix} ❌ ${message}`, ...args);
  }
};

/**
 * Force enable debug logging (for testing purposes)
 * @param enabled - Whether to force enable debug logging
 */
export function forceDebugLogging(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem('atlas-xray-debug', 'true');
    } else {
      localStorage.removeItem('atlas-xray-debug');
    }
  } catch (error) {
    console.warn('[Logger] Could not set debug state:', error);
  }
}

/**
 * Get current debug state
 * @returns true if debug is enabled, false otherwise
 */
export function getDebugState(): boolean {
  return isDebugEnabled();
}
