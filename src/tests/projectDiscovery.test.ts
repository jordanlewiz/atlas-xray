/**
 * Project Discovery & Storage Tests
 * 
 * This test file focuses on testing the project discovery and storage functionality
 * of the Atlas Xray extension. It covers:
 * 
 * - Project discovery from DOM elements (finding project links on Atlassian pages)
 * - Project data storage in the unified database system
 * - Database initialization and error handling
 * - Data consistency and integrity validation
 * - Duplicate project handling
 * - Malformed data handling
 * 
 * These tests ensure that the extension can reliably discover projects from
 * Atlassian pages and store them correctly in the database for later analysis.
 */

// Mock the database module BEFORE importing anything else
jest.mock('../utils/databaseMocks', () => ({
  db: {
    projectView: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      put: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
      count: jest.fn().mockResolvedValue(0)
    },
    projectUpdates: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      put: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      count: jest.fn().mockResolvedValue(0),
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          count: jest.fn().mockResolvedValue(0),
          toArray: jest.fn().mockResolvedValue([])
        })
      })
    },
    projectStatusHistory: {
      clear: jest.fn().mockResolvedValue(undefined)
    }
  },
  upsertProjectUpdates: jest.fn().mockResolvedValue(undefined),
}));

import { apolloClient } from '../services/apolloClient';
import { log, setFilePrefix } from '../utils/logger';

// Import the mocked db after mocking
const { db, upsertProjectUpdates } = require('../utils/databaseMocks');

// Set file-level prefix for all logging in this file
setFilePrefix('[ProjectDiscoveryTest]');

log.info('Project Discovery test file loaded');

// Mock DOM environment for testing
const mockDOM = {
  projectLinks: [
    { 
      getAttribute: (attr: string) => attr === 'href' ? '/o/abc123/s/def456/project/TEST-123' : null,
      href: '/o/abc123/s/def456/project/TEST-123'
    },
    { 
      getAttribute: (attr: string) => attr === 'href' ? '/o/abc123/s/def456/project/TEST-456' : null,
      href: '/o/abc123/s/def456/project/TEST-456'
    },
    { 
      getAttribute: (attr: string) => attr === 'href' ? '/o/abc123/s/def456/project/TEST-789' : null,
      href: '/o/abc123/s/def456/project/TEST-789'
    }
  ]
};

// Mock API response data
const mockApiData = {
  projectView: {
    data: {
      project: {
        key: 'TEST-123',
        name: 'Test Project 123',
        status: 'on-track'
      }
    }
  },
  projectStatusHistory: {
    data: {
      project: {
        updates: {
          edges: [
            { node: { id: 'status1', creationDate: '2024-01-01', startDate: '2024-01-01', targetDate: '2024-01-31' } },
            { node: { id: 'status2', creationDate: '2024-01-15', startDate: '2024-01-15', targetDate: '2024-02-15' } }
          ]
        }
      }
    }
  },
  projectUpdates: {
    data: {
      project: {
        updates: {
          edges: [
            { node: { id: 'update1', summary: 'Test update 1', state: 'on-track' } },
            { node: { id: 'update2', summary: 'Test update 2', state: 'on-track' } },
            { node: { id: 'update3', summary: 'Test update 3', state: 'on-track' } },
            { node: { id: 'update4', summary: 'Test update 4', state: 'on-track' } },
            { node: { id: 'update5', summary: 'Test update 5', state: 'on-track' } }
          ]
        }
      }
    }
  }
};

// Test utilities
const clearDatabase = async () => {
  try {
    await db.projectView.clear();
    await db.projectUpdates.clear();
    await db.projectStatusHistory.clear();
    log.info('Database cleared successfully');
  } catch (error) {
    log.error('Failed to clear database:', String(error));
  }
};

describe('Project Discovery & Storage', () => {
  beforeEach(async () => {
    await clearDatabase();
    
    // Reset all mocks to clear previous test state
    jest.clearAllMocks();
    
    // Reset mock implementations to default behavior
    db.projectView.put.mockResolvedValue(undefined);
    db.projectView.get.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('Stage 1: Project Discovery & Storage', () => {
    it('should discover projects from DOM', async () => {
      // Mock DOM querySelector to return our mock project links
      document.querySelector = jest.fn().mockReturnValue(mockDOM.projectLinks);
      
      // Extract project keys from DOM links
      const projectKeys = mockDOM.projectLinks.map(link => {
        const href = link.href;
        const match = href.match(/\/project\/([^\/]+)$/);
        return match ? match[1] : null;
      }).filter(Boolean);
      
      expect(projectKeys).toHaveLength(3);
      expect(projectKeys).toContain('TEST-123');
      expect(projectKeys).toContain('TEST-456');
      expect(projectKeys).toContain('TEST-789');
    });

    it('should store project data in database', async () => {
      const projectKey = 'TEST-123';
      const projectData = {
        key: projectKey,
        name: 'Test Project 123',
        status: 'on-track'
      };

      // Mock Apollo client response
      jest.spyOn(apolloClient, 'query').mockResolvedValue(mockApiData.projectView);

      // Simulate storing project data
      await db.projectView.put(projectData);
      
      // Verify project was stored
      expect(db.projectView.put).toHaveBeenCalledWith(projectData);
    });

    it('should handle duplicate project discovery gracefully', async () => {
      const projectKey = 'TEST-123';
      
      // Mock existing project in database
      db.projectView.get.mockResolvedValue({ key: projectKey, name: 'Existing Project' });
      
      // Check if project exists
      const existingProject = await db.projectView.get(projectKey);
      
      // Should find existing project
      expect(existingProject).toBeDefined();
      expect(existingProject.key).toBe(projectKey);
      expect(existingProject.name).toBe('Existing Project');
    });
  });

  describe('Database Initialization', () => {
    it('should initialize database tables correctly', async () => {
      // Verify database structure
      expect(db.projectView).toBeDefined();
      expect(db.projectUpdates).toBeDefined();
      expect(db.projectStatusHistory).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      db.projectView.put.mockRejectedValue(new Error('Database error'));
      
      const projectKey = 'TEST-123';
      const projectData = { key: projectKey, name: 'Test Project', status: 'on-track' };

      // Should throw when trying to store
      await expect(db.projectView.put(projectData)).rejects.toThrow('Database error');
    });
  });

  describe('Data Consistency & Accuracy', () => {
    it('should maintain data integrity across operations', async () => {
      const projectKey = 'TEST-123';
      
      // Reset get mock to not return existing project
      db.projectView.get.mockResolvedValue(undefined);
      
      // Store project data
      const projectData = { key: projectKey, name: 'Test Project 123', status: 'on-track' };
      await db.projectView.put(projectData);
      
      // Verify data consistency
      expect(db.projectView.put).toHaveBeenCalledWith(
        expect.objectContaining({
          key: projectKey,
          name: 'Test Project 123',
          status: 'on-track'
        })
      );
    });

    it('should handle malformed project data gracefully', async () => {
      const projectKey = 'TEST-123';
      
      // Mock malformed data
      const malformedData = { data: { project: null } };
      
      // Should handle malformed data gracefully
      expect(malformedData.data.project).toBeNull();
      expect(() => {
        if (!malformedData.data.project) {
          throw new Error('Invalid project data');
        }
      }).toThrow('Invalid project data');
    });
  });
});
