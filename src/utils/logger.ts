import log from 'loglevel';

export interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

/**
 * Creates a logger instance for a specific service with consistent log namespaces
 * @param serviceName - The name of the service (e.g., 'PageTypeDetector', 'TimelineProjectService')
 * @returns Logger instance with methods for different log levels
 */
export function createLogger(serviceName: string): Logger {
  // Create a namespaced logger
  const logger = log.getLogger(serviceName);
  
  // Set default level to info (can be overridden)
  logger.setLevel(log.levels.INFO);
  
  return {
    debug: (message: string, ...args: any[]) => {
      logger.debug(`🔍 ${message}`, ...args);
    },
    info: (message: string, ...args: any[]) => {
      logger.info(`ℹ️ ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      logger.warn(`⚠️ ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      logger.error(`❌ ${message}`, ...args);
    }
  };
}

/**
 * Sets the global log level for all loggers
 * @param level - The log level ('trace', 'debug', 'info', 'warn', 'error', 'silent')
 */
export function setGlobalLogLevel(level: string): void {
  const logLevel = log.levels[level.toUpperCase() as keyof typeof log.levels];
  if (logLevel !== undefined) {
    log.setLevel(logLevel);
    console.log(`[Logger] 🔧 Global log level set to: ${level}`);
  } else {
    console.warn(`[Logger] ⚠️ Invalid log level: ${level}. Valid levels: trace, debug, info, warn, error, silent`);
  }
}

/**
 * Gets the current global log level
 * @returns The current log level name
 */
export function getGlobalLogLevel(): string {
  const level = log.getLevel();
  const levelNames = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];
  return levelNames[level] || 'unknown';
}
