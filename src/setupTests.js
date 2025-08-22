import '@testing-library/jest-dom';

// Suppress specific console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

// Helper function to check if message should be suppressed
const shouldSuppressMessage = (message) => {
  if (typeof message === 'string') {
    return (
      message.includes('feature gate') ||
      message.includes('Client must be initialized') ||
      message.includes('analytics-next-use-modern-context') ||
      message.includes('layering-tree-graph') ||
      message.includes('AnalyticsContext uses the legacy childContextTypes') ||
      message.includes('LockToggle: Support for defaultProps') ||
      message.includes('Failed to analyze update: Error: Analysis failed') ||
      message.includes('Warning: LockToggle') ||
      message.includes('Warning: AnalyticsContext') ||
      message.includes('defaultProps will be removed from function components') ||
      message.includes('childContextTypes API which is no longer supported')
    );
  }
  
  // Handle object messages (like feature gate warnings)
  if (typeof message === 'object' && message?.msg) {
    return (
      message.msg.includes('feature gate') ||
      message.msg.includes('Client must be initialized')
    );
  }
  
  return false;
};

console.warn = (...args) => {
  if (shouldSuppressMessage(args[0])) {
    return; // Suppress this warning
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  if (shouldSuppressMessage(args[0])) {
    return; // Suppress this error
  }
  originalError.apply(console, args);
};
