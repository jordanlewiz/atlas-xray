/**
 * Database Utility Module
 * Provides database-related utilities for tests
 */

export const db = {
  projectView: {
    clear: jest.fn().mockResolvedValue(undefined),
    toArray: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0)
  },
  projectUpdate: {
    clear: jest.fn().mockResolvedValue(undefined),
    toArray: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0)
  },
  projectDependency: {
    clear: jest.fn().mockResolvedValue(undefined),
    toArray: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0)
  },
  meta: {
    clear: jest.fn().mockResolvedValue(undefined),
    toArray: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0)
  }
};

export default db;
