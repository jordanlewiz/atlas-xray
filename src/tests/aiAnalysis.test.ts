/**
 * AI Analysis & Processing Tests
 * 
 * This test file focuses on testing the AI-powered analysis and processing
 * functionality of the Atlas Xray extension. It covers:
 * 
 * - AI analysis pipeline for project updates (sentiment analysis, confidence scoring)
 * - Quality analysis integration with AI processing
 * - Local language model integration and fallback mechanisms
 * - Performance optimization through batch processing
 * - Rate limiting during AI operations
 * - Error handling for AI analysis failures
 * - Analysis quality standards and validation
 * 
 * These tests ensure that the extension can reliably process project updates
 * through AI analysis while maintaining performance and quality standards.
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

import { ProjectPipeline, PipelineState } from '../services/projectPipeline';
import { apolloClient } from '../services/apolloClient';

// Import the mocked db after mocking
const { db, upsertProjectUpdates } = require('../utils/databaseMocks');

console.log('AI Analysis test file loaded');

// Mock API response data for updates
const mockUpdateData = {
  projectUpdates: {
    data: {
      project: {
        updates: {
          edges: [
            { 
              node: { 
                id: 'update1', 
                summary: 'Test update 1 with positive sentiment', 
                state: 'on-track',
                content: 'This is a great update with excellent progress'
              } 
            },
            { 
              node: { 
                id: 'update2', 
                summary: 'Test update 2 with concerns', 
                state: 'at-risk',
                content: 'We are facing some challenges and delays'
              } 
            }
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
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Failed to clear database:', error);
  }
};

describe('AI Analysis & Processing', () => {
  let pipeline: ProjectPipeline;

  beforeEach(async () => {
    await clearDatabase();
    pipeline = new ProjectPipeline();
    pipeline.setState(PipelineState.IDLE);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('Stage 3: AI Analysis Queue', () => {
    it('should process updates through AI analysis pipeline', async () => {
      const projectKey = 'TEST-123';
      
      // Mock Apollo client response for updates
      jest.spyOn(apolloClient, 'query').mockResolvedValue(mockUpdateData.projectUpdates);
      
      // Process updates through AI analysis
      const analysisResults = await pipeline.processUpdatesWithAI(projectKey);
      
      expect(analysisResults).toBeDefined();
      expect(analysisResults.length).toBeGreaterThan(0);
    });

    it('should handle AI analysis errors gracefully', async () => {
      const projectKey = 'TEST-123';
      
      // Mock AI analysis failure
      jest.spyOn(apolloClient, 'query').mockRejectedValue(new Error('AI analysis failed'));
      
      await expect(pipeline.processUpdatesWithAI(projectKey)).rejects.toThrow('AI analysis failed');
    });

    it('should maintain analysis quality standards', async () => {
      const projectKey = 'TEST-123';
      
      // Mock successful AI analysis
      jest.spyOn(apolloClient, 'query').mockResolvedValue(mockUpdateData.projectUpdates);
      
      const analysisResults = await pipeline.processUpdatesWithAI(projectKey);
      
      // Verify analysis quality
      analysisResults.forEach(result => {
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('sentiment');
        expect(result).toHaveProperty('summary');
      });
    });
  });

  describe('Quality Analysis Integration', () => {
    it('should integrate quality analysis with AI processing', async () => {
      const projectKey = 'TEST-123';
      
      // Mock quality analysis data
      const qualityData = {
        overallQuality: 'high',
        criteria: ['clarity', 'completeness', 'accuracy'],
        score: 0.85
      };
      
      jest.spyOn(apolloClient, 'query').mockResolvedValue(mockUpdateData.projectUpdates);
      
      const results = await pipeline.processUpdatesWithAI(projectKey);
      
      // Verify quality integration
      expect(results).toBeDefined();
    });

    it('should handle quality analysis failures gracefully', async () => {
      const projectKey = 'TEST-123';
      
      // Mock quality analysis failure
      jest.spyOn(apolloClient, 'query').mockResolvedValue(mockUpdateData.projectUpdates);
      
      // Mock quality analysis to fail
      const mockQualityAnalysis = jest.fn().mockRejectedValue(new Error('Quality analysis failed'));
      pipeline.qualityAnalysis = mockQualityAnalysis;
      
      await expect(pipeline.processUpdatesWithAI(projectKey)).rejects.toThrow('Quality analysis failed');
    });
  });

  describe('Local Language Model Integration', () => {
    it('should support local language model processing', async () => {
      const projectKey = 'TEST-123';
      
      // Mock local model configuration
      const localModelConfig = {
        modelType: 'local',
        modelPath: '/path/to/local/model',
        maxTokens: 1000
      };
      
      jest.spyOn(apolloClient, 'query').mockResolvedValue(mockUpdateData.projectUpdates);
      
      // Configure pipeline for local model
      pipeline.setModelConfig(localModelConfig);
      
      const results = await pipeline.processUpdatesWithAI(projectKey);
      
      expect(results).toBeDefined();
    });

    it('should fallback to cloud model when local model fails', async () => {
      const projectKey = 'TEST-123';
      
      // Mock local model failure
      const localModelConfig = {
        modelType: 'local',
        modelPath: '/path/to/local/model',
        maxTokens: 1000
      };
      
      jest.spyOn(apolloClient, 'query').mockResolvedValue(mockUpdateData.projectUpdates);
      
      // Configure pipeline for local model
      pipeline.setModelConfig(localModelConfig);
      
      // Mock local model to fail
      const mockLocalModel = jest.fn().mockRejectedValue(new Error('Local model unavailable'));
      pipeline.localModel = mockLocalModel;
      
      // Should fallback to cloud model
      const results = await pipeline.processUpdatesWithAI(projectKey);
      
      expect(results).toBeDefined();
    });
  });

  describe('Performance & Batch Processing', () => {
    it('should process updates in batches for performance', async () => {
      const projectKey = 'TEST-123';
      const batchSize = 5;
      
      // Mock large number of updates
      const largeUpdateData = {
        projectUpdates: {
          data: {
            project: {
              updates: {
                edges: Array.from({ length: 20 }, (_, i) => ({
                  node: {
                    id: `update${i}`,
                    summary: `Update ${i}`,
                    state: 'on-track',
                    content: `Content for update ${i}`
                  }
                }))
              }
            }
          }
        }
      };
      
      jest.spyOn(apolloClient, 'query').mockResolvedValue(largeUpdateData.projectUpdates);
      
      // Process with batching
      pipeline.setBatchSize(batchSize);
      const results = await pipeline.processUpdatesWithAI(projectKey);
      
      expect(results).toHaveLength(20);
    });

    it('should respect rate limiting during AI processing', async () => {
      const projectKey = 'TEST-123';
      
      jest.spyOn(apolloClient, 'query').mockResolvedValue(mockUpdateData.projectUpdates);
      
      // Set aggressive rate limiting
      pipeline.setRateLimit({ requestsPerMinute: 10, delayMs: 100 });
      
      const startTime = Date.now();
      await pipeline.processUpdatesWithAI(projectKey);
      const endTime = Date.now();
      
      // Should respect rate limiting
      expect(endTime - startTime).toBeGreaterThan(100);
    });
  });
});
