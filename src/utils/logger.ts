import debug from 'debug';

export interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

/**
 * Creates a logger instance for a specific service with consistent debug namespaces
 * @param serviceName - The name of the service (e.g., 'PageTypeDetector', 'TimelineProjectService')
 * @returns Logger instance with methods for different log levels
 */
export function createLogger(serviceName: string): Logger {
  const namespace = `atlas-xray:${serviceName}`;
  const debugInstance = debug(namespace);
  
  return {
    debug: (message: string, ...args: any[]) => {
      // Let debug package handle the conditional logging
      debugInstance(message, ...args);
    },
    info: (message: string, ...args: any[]) => {
      // Let debug package handle the conditional logging
      debugInstance(`ℹ️ ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      // Always show warnings - they're important
      console.warn(`[${namespace}] ⚠️ ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      // Always show errors - they're critical
      console.error(`[${namespace}] ❌ ${message}`, ...args);
    }
  };
}
