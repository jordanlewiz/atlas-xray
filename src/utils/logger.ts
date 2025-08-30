import debug from 'debug';

export interface Logger {
  debug: debug.Debugger;
  info: debug.Debugger;
  success: debug.Debugger;
  warn: debug.Debugger;
  error: debug.Debugger;
}

/**
 * Creates a logger instance for a specific service with consistent debug namespaces
 * @param serviceName - The name of the service (e.g., 'PageTypeDetector', 'TimelineProjectService')
 * @returns Logger instance with methods for different log levels
 */
export function createLogger(serviceName: string): Logger {
  const namespace = `atlas-xray:${serviceName}`;
  
  return {
    debug: debug(namespace),
    info: debug(`${namespace}:info`),
    success: debug(`${namespace}:success`),
    warn: debug(`${namespace}:warn`),
    error: debug(`${namespace}:error`)
  };
}
