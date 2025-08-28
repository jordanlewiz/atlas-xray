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
  class MockDexie {
    constructor(dbName) {
      this.dbName = dbName;
      this.version = jest.fn().mockReturnThis();
      this.stores = jest.fn().mockReturnThis();
      this.open = jest.fn().mockResolvedValue(undefined);
      this.close = jest.fn().mockResolvedValue(undefined);
      
      // In-memory storage for tests
      this._storage = {
        projectList: new Map(),
        projectSummaries: new Map(),
        projectUpdates: new Map(),
        projectDependencies: new Map(),
        meta: new Map(),
        storedAnalyses: new Map(),
        analysisCache: new Map()
      };
      
      // Mock table properties with working storage
      this.projectList = {
        clear: jest.fn().mockImplementation(() => {
          this._storage.projectList.clear();
          return Promise.resolve(undefined);
        }),
        toArray: jest.fn().mockImplementation(() => {
          return Promise.resolve(Array.from(this._storage.projectList.values()));
        }),
        count: jest.fn().mockImplementation(() => {
          return Promise.resolve(this._storage.projectList.size);
        }),
        add: jest.fn().mockImplementation((item) => {
          this._storage.projectList.set(item.projectKey, item);
          return Promise.resolve(undefined);
        }),
        get: jest.fn().mockImplementation((key) => {
          return Promise.resolve(this._storage.projectList.get(key));
        }),
        put: jest.fn().mockImplementation((item) => {
          this._storage.projectList.set(item.projectKey, item);
          return Promise.resolve(undefined);
        }),
        delete: jest.fn().mockImplementation((key) => {
          this._storage.projectList.delete(key);
          return Promise.resolve(undefined);
        })
      };
      
      this.projectSummaries = {
        clear: jest.fn().mockImplementation(() => {
          this._storage.projectSummaries.clear();
          return Promise.resolve(undefined);
        }),
        toArray: jest.fn().mockImplementation(() => {
          return Promise.resolve(Array.from(this._storage.projectSummaries.values()));
        }),
        count: jest.fn().mockImplementation(() => {
          return Promise.resolve(this._storage.projectSummaries.size);
        }),
        add: jest.fn().mockImplementation((item) => {
          this._storage.projectSummaries.set(item.projectKey, item);
          return Promise.resolve(undefined);
        }),
        get: jest.fn().mockImplementation((key) => {
          return Promise.resolve(this._storage.projectSummaries.get(key));
        }),
        put: jest.fn().mockImplementation((item) => {
          this._storage.projectSummaries.set(item.projectKey, item);
          return Promise.resolve(undefined);
        }),
        delete: jest.fn().mockImplementation((key) => {
          this._storage.projectSummaries.delete(key);
          return Promise.resolve(undefined);
        })
      };
      
      this.projectUpdates = {
        clear: jest.fn().mockImplementation(() => {
          this._storage.projectUpdates.clear();
          return Promise.resolve(undefined);
        }),
        toArray: jest.fn().mockImplementation(() => {
          return Promise.resolve(Array.from(this._storage.projectUpdates.values()));
        }),
        count: jest.fn().mockImplementation(() => {
          return Promise.resolve(this._storage.projectUpdates.size);
        }),
        add: jest.fn().mockImplementation((item) => {
          this._storage.projectUpdates.set(item.uuid, item);
          return Promise.resolve(undefined);
        }),
        get: jest.fn().mockImplementation((key) => {
          return Promise.resolve(this._storage.projectUpdates.get(key));
        }),
        put: jest.fn().mockImplementation((item) => {
          // Validate required fields and throw error for invalid data
          if (!item.uuid || !item.projectKey || !item.creationDate) {
            return Promise.reject(new Error('Invalid project update data'));
          }
          this._storage.projectUpdates.set(item.uuid, item);
          return Promise.resolve(undefined);
        }),
        delete: jest.fn().mockImplementation((key) => {
          this._storage.projectUpdates.delete(key);
          return Promise.resolve(undefined);
        }),
        where: jest.fn().mockImplementation((field) => ({
          equals: jest.fn().mockImplementation((value) => ({
            toArray: jest.fn().mockImplementation(() => {
              const results = Array.from(this._storage.projectUpdates.values())
                .filter(item => item[field] === value);
              return Promise.resolve(results);
            })
          }))
        })),
        above: jest.fn().mockReturnThis(),
        below: jest.fn().mockReturnThis(),
        between: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis()
      };
      
      this.projectDependencies = {
        clear: jest.fn().mockImplementation(() => {
          this._storage.projectDependencies.clear();
          return Promise.resolve(undefined);
        }),
        toArray: jest.fn().mockImplementation(() => {
          return Promise.resolve(Array.from(this._storage.projectDependencies.values()));
        }),
        count: jest.fn().mockImplementation(() => {
          return Promise.resolve(this._storage.projectDependencies.size);
        }),
        add: jest.fn().mockImplementation((item) => {
          this._storage.projectDependencies.set(item.id, item);
          return Promise.resolve(undefined);
        }),
        get: jest.fn().mockImplementation((key) => {
          return Promise.resolve(this._storage.projectDependencies.get(key));
        }),
        put: jest.fn().mockImplementation((item) => {
          this._storage.projectDependencies.set(item.id, item);
          return Promise.resolve(undefined);
        }),
        delete: jest.fn().mockImplementation((key) => {
          this._storage.projectDependencies.delete(key);
          return Promise.resolve(undefined);
        }),
        bulkPut: jest.fn().mockImplementation((items) => {
          items.forEach(item => {
            this._storage.projectDependencies.set(item.id, item);
          });
          return Promise.resolve(undefined);
        }),
        where: jest.fn().mockImplementation((field) => ({
          equals: jest.fn().mockImplementation((value) => ({
            toArray: jest.fn().mockImplementation(() => {
              const results = Array.from(this._storage.projectDependencies.values())
                .filter(item => item[field] === value);
              return Promise.resolve(results);
            }),
            delete: jest.fn().mockImplementation(() => {
              const keysToDelete = Array.from(this._storage.projectDependencies.keys())
                .filter(key => {
                  const item = this._storage.projectDependencies.get(key);
                  return item[field] === value;
                });
              keysToDelete.forEach(key => this._storage.projectDependencies.delete(key));
              return Promise.resolve(undefined);
            })
          }))
        })),
        equals: jest.fn().mockReturnThis()
      };
      
      this.meta = {
        clear: jest.fn().mockResolvedValue(undefined),
        toArray: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        add: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockResolvedValue(undefined),
        put: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined)
      };
      
      this.storedAnalyses = {
        clear: jest.fn().mockResolvedValue(undefined),
        toArray: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        add: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockResolvedValue(undefined),
        put: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined)
      };
      
      this.analysisCache = {
        clear: jest.fn().mockResolvedValue(undefined),
        toArray: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        add: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockResolvedValue(undefined),
        put: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined)
      };
    }
  }
  
  MockDexie.Table = jest.fn();
  return MockDexie;
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
