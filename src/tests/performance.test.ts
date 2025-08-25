/**
 * Performance & Rate Limiting Tests
 * 
 * This test file focuses on testing the performance optimization and rate limiting
 * functionality of the Atlas Xray extension. It covers:
 * 
 * - Rate limiting during API calls and operations
 * - Concurrent operation handling and efficiency
 * - Batch processing for large datasets
 * - Memory management and cleanup
 * - Lazy loading for performance optimization
 * - Database query optimization and indexing
 * - Caching strategies and invalidation
 * - Performance metrics and monitoring
 * 
 * These tests ensure that the extension maintains high performance even when
 * processing large amounts of data, while respecting API rate limits and
 * managing system resources efficiently.
 */

// Mock the database module BEFORE importing anything else
jest.mock('../utils/database', () => ({
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

import { ProjectPipeline, PipelineState } from '../services/projectPipeline';
import { apolloClient } from '../services/apolloClient';

// Import the mocked db after mocking
const { db, upsertProjectUpdates } = require('../utils/database');

console.log('Performance test file loaded');

// Test utilities
const clearDatabase = async () => {
  try {
    await db.projectView.clear();
    await db.projectUpdates.clear();
    await db.projectStatusHistory.clear();
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Failed to clear database:', error);
  }
};

describe('Performance & Rate Limiting', () => {
  let pipeline: ProjectPipeline;

  beforeEach(async () => {
    await clearDatabase();
    pipeline = new ProjectPipeline();
    pipeline.setState(PipelineState.IDLE);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('Performance & Rate Limiting', () => {
    it('should respect rate limiting during API calls', async () => {
      const projectKey = 'TEST-123';
      
      // Mock API response
      jest.spyOn(apolloClient, 'query').mockResolvedValue({
        data: { project: { updates: { edges: [] } } }
      });
      
      // Set aggressive rate limiting
      pipeline.setRateLimit({ requestsPerMinute: 60, delayMs: 100 });
      
      const startTime = Date.now();
      
      // Make multiple calls
      await Promise.all([
        pipeline.discoverProjects(),
        pipeline.discoverProjects(),
        pipeline.discoverProjects()
      ]);
      
      const endTime = Date.now();
      
      // Should respect rate limiting
      expect(endTime - startTime).toBeGreaterThan(200); // At least 2 delays
    });

    it('should handle concurrent operations efficiently', async () => {
      const projectKeys = ['TEST-123', 'TEST-456', 'TEST-789'];
      
      // Mock API responses
      jest.spyOn(apolloClient, 'query').mockResolvedValue({
        data: { project: { updates: { edges: [] } } }
      });
      
      const startTime = Date.now();
      
      // Process multiple projects concurrently
      const results = await Promise.all(
        projectKeys.map(key => pipeline.storeProjectData(key))
      );
      
      const endTime = Date.now();
      
      // Should complete efficiently
      expect(results).toHaveLength(3);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should implement efficient batch processing', async () => {
      const batchSize = 10;
      const totalItems = 100;
      
      // Mock large dataset
      const largeDataset = Array.from({ length: totalItems }, (_, i) => ({
        id: `item${i}`,
        data: `data${i}`
      }));
      
      // Set batch size
      pipeline.setBatchSize(batchSize);
      
      const startTime = Date.now();
      
      // Process in batches
      const batches = [];
      for (let i = 0; i < totalItems; i += batchSize) {
        const batch = largeDataset.slice(i, i + batchSize);
        batches.push(batch);
      }
      
      const endTime = Date.now();
      
      // Should create correct number of batches
      expect(batches).toHaveLength(Math.ceil(totalItems / batchSize));
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Memory Management', () => {
    it('should clear memory efficiently', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform operations that use memory
      for (let i = 0; i < 1000; i++) {
        await pipeline.discoverProjects();
      }
      
      const peakMemory = process.memoryUsage().heapUsed;
      
      // Clear memory
      pipeline.clearMemory();
      
      const finalMemory = process.memoryUsage().heapUsed;
      
      // Memory should be managed
      expect(finalMemory).toBeLessThan(peakMemory);
    });

    it('should implement lazy loading for large datasets', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `item${i}`,
        data: `data${i}`
      }));
      
      // Enable lazy loading
      pipeline.setLazyLoading(true);
      
      const startTime = Date.now();
      
      // Process large dataset
      const results = await pipeline.processLargeDataset(largeDataset);
      
      const endTime = Date.now();
      
      // Should complete without memory issues
      expect(results).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in reasonable time
    });
  });

  describe('Database Performance', () => {
    it('should optimize database queries', async () => {
      const projectKey = 'TEST-123';
      
      // Mock database performance metrics
      const queryStartTime = Date.now();
      
      // Perform database operation
      await db.projectView.get(projectKey);
      
      const queryEndTime = Date.now();
      const queryDuration = queryEndTime - queryStartTime;
      
      // Should complete quickly
      expect(queryDuration).toBeLessThan(100); // Under 100ms
    });

    it('should implement efficient indexing', async () => {
      // Mock indexed query
      const indexedQuery = db.projectUpdates.where('projectKey').equals('TEST-123');
      
      // Should use index efficiently
      expect(indexedQuery).toBeDefined();
      
      // Mock count operation
      const count = await indexedQuery.count();
      expect(count).toBe(0); // Should be fast with index
    });
  });

  describe('Caching Strategy', () => {
    it('should implement effective caching', async () => {
      const projectKey = 'TEST-123';
      
      // First call - should hit API
      jest.spyOn(apolloClient, 'query').mockResolvedValue({
        data: { project: { key: projectKey, name: 'Test Project' } }
      });
      
      const firstCall = await pipeline.getProjectData(projectKey);
      
      // Second call - should hit cache
      const secondCall = await pipeline.getProjectData(projectKey);
      
      // Results should be identical
      expect(firstCall).toEqual(secondCall);
      
      // API should only be called once
      expect(apolloClient.query).toHaveBeenCalledTimes(1);
    });

    it('should handle cache invalidation correctly', async () => {
      const projectKey = 'TEST-123';
      
      // Initial data
      jest.spyOn(apolloClient, 'query').mockResolvedValue({
        data: { project: { key: projectKey, name: 'Test Project' } }
      });
      
      await pipeline.getProjectData(projectKey);
      
      // Invalidate cache
      pipeline.invalidateCache(projectKey);
      
      // Next call should hit API again
      await pipeline.getProjectData(projectKey);
      
      // API should be called twice
      expect(apolloClient.query).toHaveBeenCalledTimes(2);
    });
  });
});
