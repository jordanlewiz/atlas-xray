/**
 * Simple, unified logging utility that wraps browser console methods
 * with file-level prefix control and debug toggle integration
 */

export interface Logger {
  debug: (prefixOrMessage: string, messageOrArgs?: string, ...args: any[]) => void;
  info: (prefixOrMessage: string, messageOrArgs?: string, ...args: any[]) => void;
  warn: (prefixOrMessage: string, messageOrArgs?: string, ...args: any[]) => void;
  error: (prefixOrMessage: string, messageOrArgs?: string, ...args: any[]) => void;
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

// File-level prefix management
let currentFilePrefix = '[Default]';

/**
 * Set the default prefix for the current file
 * @param prefix - The prefix to use for all log calls in this file (e.g., '[PageTypeDetector]')
 */
export function setFilePrefix(prefix: string): void {
  currentFilePrefix = prefix;
}

/**
 * Get the current file prefix
 * @returns The current file prefix
 */
function getFilePrefix(): string {
  return currentFilePrefix;
}

/**
 * Determine if a string is a prefix (starts with '[' and ends with ']')
 * @param str - The string to check
 * @returns true if it's a prefix, false otherwise
 */
function isPrefix(str: string): boolean {
  return str.startsWith('[') && str.endsWith(']');
}

/**
 * Unified logger instance with file-level prefix control
 * Only logs when debug toggle is enabled (except errors which always show)
 */
export const log: Logger = {
  /**
   * Debug level logging - only shows when debug toggle is ON
   * @param prefixOrMessage - Either a prefix (e.g., '[ServiceName]') or the message
   * @param messageOrArgs - The message if first param was prefix, or first argument
   * @param args - Additional arguments to log
   */
  debug: (prefixOrMessage: string, messageOrArgs?: string, ...args: any[]) => {
    if (isDebugEnabled()) {
      if (isPrefix(prefixOrMessage)) {
        // First param is a prefix override
        const prefix = prefixOrMessage;
        const message = messageOrArgs || '';
        console.log(`${prefix} 🔍 ${message}`, ...args);
      } else {
        // First param is the message, use file prefix
        const prefix = getFilePrefix();
        const message = prefixOrMessage;
        const allArgs = messageOrArgs ? [messageOrArgs, ...args] : args;
        console.log(`${prefix} 🔍 ${message}`, ...allArgs);
      }
    }
  },

  /**
   * Info level logging - only shows when debug toggle is ON
   * @param prefixOrMessage - Either a prefix (e.g., '[ServiceName]') or the message
   * @param messageOrArgs - The message if first param was prefix, or first argument
   * @param args - Additional arguments to log
   */
  info: (prefixOrMessage: string, messageOrArgs?: string, ...args: any[]) => {
    if (isDebugEnabled()) {
      if (isPrefix(prefixOrMessage)) {
        // First param is a prefix override
        const prefix = prefixOrMessage;
        const message = messageOrArgs || '';
        console.log(`${prefix} ℹ️ ${message}`, ...args);
      } else {
        // First param is the message, use file prefix
        const prefix = getFilePrefix();
        const message = prefixOrMessage;
        const allArgs = messageOrArgs ? [messageOrArgs, ...args] : args;
        console.log(`${prefix} ℹ️ ${message}`, ...allArgs);
      }
    }
  },

  /**
   * Warning level logging - only shows when debug toggle is ON
   * @param prefixOrMessage - Either a prefix (e.g., '[ServiceName]') or the message
   * @param messageOrArgs - The message if first param was prefix, or first argument
   * @param args - Additional arguments to log
   */
  warn: (prefixOrMessage: string, messageOrArgs?: string, ...args: any[]) => {
    if (isDebugEnabled()) {
      if (isPrefix(prefixOrMessage)) {
        // First param is a prefix override
        const prefix = prefixOrMessage;
        const message = messageOrArgs || '';
        console.log(`${prefix} ⚠️ ${message}`, ...args);
      } else {
        // First param is the message, use file prefix
        const prefix = getFilePrefix();
        const message = prefixOrMessage;
        const allArgs = messageOrArgs ? [messageOrArgs, ...args] : args;
        console.log(`${prefix} ⚠️ ${message}`, ...allArgs);
      }
    }
  },

  /**
   * Error level logging - ALWAYS shows regardless of debug toggle
   * @param prefixOrMessage - Either a prefix (e.g., '[ServiceName]') or the message
   * @param messageOrArgs - The message if first param was prefix, or first argument
   * @param args - Additional arguments to log
   */
  error: (prefixOrMessage: string, messageOrArgs?: string, ...args: any[]) => {
    // Errors always show - they're critical
    if (isPrefix(prefixOrMessage)) {
      // First param is a prefix override
      const prefix = prefixOrMessage;
      const message = messageOrArgs || '';
      console.error(`${prefix} ❌ ${message}`, ...args);
    } else {
      // First param is the message, use file prefix
      const prefix = getFilePrefix();
      const message = prefixOrMessage;
      const allArgs = messageOrArgs ? [messageOrArgs, ...args] : args;
      console.error(`${prefix} ❌ ${message}`, ...allArgs);
    }
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
