import '@testing-library/jest-dom';

// Mock IndexedDB for tests
const indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
  databases: jest.fn()
};

Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: indexedDB
});

// Mock Dexie for tests
jest.mock('dexie', () => {
  const mockDexie = jest.fn().mockImplementation(() => ({
    version: jest.fn().mockReturnThis(),
    stores: jest.fn().mockReturnThis(),
    open: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    projectList: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      add: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined)
    },
    projectSummaries: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      add: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined)
    },
    projectUpdates: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      add: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      where: jest.fn().mockReturnThis(),
      equals: jest.fn().mockReturnThis(),
      above: jest.fn().mockReturnThis(),
      below: jest.fn().mockReturnThis(),
      between: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis()
    },
    projectDependencies: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      add: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined)
    },
    meta: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      add: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined)
    },
    storedAnalyses: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      add: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined)
    },
    analysisCache: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      add: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined)
    }
  }));
  
  mockDexie.Table = jest.fn();
  return mockDexie;
});



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
