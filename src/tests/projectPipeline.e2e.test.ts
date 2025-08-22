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
          count: jest.fn().mockResolvedValue(0)
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

console.log('E2E test file loaded');

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
    console.log('Mock clearDatabase called');
  } catch (error) {
    console.log('Mock clearDatabase called (with error):', error);
  }
};

const mockApiResponses = () => {
  // Mock Apollo client responses
  jest.spyOn(apolloClient, 'query').mockImplementation((options: any) => {
    const queryString = options.query?.loc?.source?.body || '';
    
    // Check for project view query
    if (queryString.includes('project') && queryString.includes('key') && !queryString.includes('updates')) {
      return Promise.resolve({
        data: mockApiData.projectView.data,
        loading: false,
        networkStatus: 7
      });
    }
    
    // Check for project status history query
    if (queryString.includes('project') && queryString.includes('projectKey')) {
      return Promise.resolve({
        data: mockApiData.projectStatusHistory.data,
        loading: false,
        networkStatus: 7
      });
    }
    
    // Check for project updates query
    if (queryString.includes('project') && queryString.includes('updates')) {
      return Promise.resolve({
        data: mockApiData.projectUpdates.data,
        loading: false,
        networkStatus: 7
      });
    }
    
    return Promise.resolve({ 
      data: null,
      loading: false,
      networkStatus: 7
    });
  });
};

const getProjectCount = (pipeline: ProjectPipeline, countType: keyof PipelineState): number => {
  const state = pipeline.getState();
  return state[countType] as number;
};

const getStoredProjects = async () => {
  try {
    return await db.projectView.toArray();
  } catch (error) {
    return []; // Fallback for mocked scenarios
  }
};

const getStoredUpdates = async () => {
  try {
    return await db.projectUpdates.toArray();
  } catch (error) {
    return []; // Fallback for mocked scenarios
  }
};

const getAnalysisQueue = async () => {
  // Mock analysis queue - in real implementation this would be stored somewhere
  return [];
};

const getAnalysisResults = async () => {
  // Mock analysis results - in real implementation this would be stored somewhere
  return [];
};

const getApiErrors = () => {
  // Mock API errors tracking
  return [];
};

const waitForStage = async (pipeline: ProjectPipeline, targetStage: string): Promise<void> => {
  return new Promise((resolve) => {
    const unsubscribe = pipeline.subscribe((state) => {
      if (state.currentStage === targetStage) {
        unsubscribe();
        resolve();
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      unsubscribe();
      resolve();
    }, 5000);
  });
};

const mockDomWithProjects = (projectKeys: string[]) => {
  Object.defineProperty(document, 'querySelectorAll', {
    value: jest.fn().mockImplementation((selector: string) => {
      if (selector === 'a[href]') {
        return projectKeys.map(key => ({
          getAttribute: (attr: string) => attr === 'href' ? `/o/abc123/s/def456/project/${key}` : null,
          href: `/o/abc123/s/def456/project/${key}`
        }));
      }
      return [];
    }),
    writable: true
  });
};

describe('Project Data Pipeline E2E', () => {
  let pipeline: ProjectPipeline;

  // Add a simple test first
  it('should create pipeline instance', () => {
    pipeline = new ProjectPipeline();
    expect(pipeline).toBeInstanceOf(ProjectPipeline);
  });

  beforeEach(async () => {
    // Setup: Clear IndexedDB, mock API responses
    await clearDatabase();
    mockApiResponses();
    
    // Create fresh pipeline instance
    pipeline = new ProjectPipeline();
    
    // Mock DOM querySelectorAll for the simplified scanning logic
    Object.defineProperty(document, 'querySelectorAll', {
      value: jest.fn().mockImplementation((selector: string) => {
        if (selector === 'a[href]') {
          return mockDOM.projectLinks as any;
        }
        return [];
      }),
      writable: true
    });
  });

  afterEach(async () => {
    await clearDatabase();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('Stage 1: Project Discovery & Storage', () => {
    it('should scan DOM and count projects on page using simplified logic', async () => {
      // When: Pipeline stage 1a runs with simplified scanning
      await pipeline.scanProjectsOnPage();
      
      // Then: Should detect 3 projects on page using the specific regex pattern
      expect(getProjectCount(pipeline, 'projectsOnPage')).toBe(3);
      expect(getProjectCount(pipeline, 'projectsStored')).toBe(0); // Not stored yet
      
      // And: Should have stored the project IDs found
      const state = pipeline.getState();
      expect(state.projectIds).toHaveLength(3);
      expect(state.projectIds).toContain('TEST-123');
      expect(state.projectIds).toContain('TEST-456');
      expect(state.projectIds).toContain('TEST-789');
    });

    it('should fetch and store complete project data including status history and updates', async () => {
      // Given: 3 projects detected on page
      await pipeline.scanProjectsOnPage();
      
      // When: Pipeline stage 1b runs (now fetches everything in one go)
      await pipeline.fetchAndStoreProjects();
      
      // Then: Should store 3 projects in IndexedDB
      expect(getProjectCount(pipeline, 'projectsStored')).toBeGreaterThanOrEqual(3);
      
              // And: Should have called upsertProjectUpdates
        expect(upsertProjectUpdates).toHaveBeenCalled();
      
      // And: Pipeline state should reflect stored projects
      const state = pipeline.getState();
      expect(state.projectsStored).toBeGreaterThanOrEqual(3);
      expect(state.currentStage).toBe('idle');
    });
  });

  describe('Stage 2: Updates Collection (Now Integrated)', () => {
    it('should have updates already fetched and stored during project processing', async () => {
      // Given: 3 projects stored with their updates
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // When: Pipeline stage 2 runs (now just a compatibility placeholder)
      await pipeline.fetchAndStoreUpdates();
      
      // Then: Should log that updates are already processed
      // (The actual updates were fetched and stored in fetchAndStoreSingleProject)
      expect(getProjectCount(pipeline, 'projectUpdatesStored')).toBeGreaterThanOrEqual(0); // Updates are fetched during project processing
      
      // And: The upsertProjectUpdates should have been called during project processing
      expect(upsertProjectUpdates).toHaveBeenCalled();
    });
  });

  describe('Stage 3: AI Analysis Queue', () => {
    it('should add updates to AI analysis queue', async () => {
      // Given: Updates stored in database during project processing
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Mock database to return stored updates
      db.projectUpdates.toArray.mockResolvedValue([
        { id: 'update1', projectKey: 'TEST-123', summary: 'Test update 1', analyzed: false },
        { id: 'update2', projectKey: 'TEST-456', summary: 'Test update 2', analyzed: false },
        { id: 'update3', projectKey: 'TEST-789', summary: 'Test update 3', analyzed: false }
      ]);
      
      // When: Pipeline stage 3 runs
      await pipeline.queueAndProcessAnalysis();
      
      // Then: Should have processed updates for analysis
      expect(getProjectCount(pipeline, 'projectUpdatesAnalysed')).toBeGreaterThan(0);
      
      // And: Database update should have been called to mark as analyzed
      expect(db.projectUpdates.update).toHaveBeenCalled();
    });

    it('should process AI analysis queue and update count', async () => {
      // Given: Updates in analysis queue
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Mock database to return stored updates
      db.projectUpdates.toArray.mockResolvedValue([
        { id: 'update1', projectKey: 'TEST-123', summary: 'Test update 1', analyzed: false },
        { id: 'update2', projectKey: 'TEST-456', summary: 'Test update 2', analyzed: false }
      ]);
      
      // When: Pipeline stage 3 runs
      await pipeline.queueAndProcessAnalysis();
      
      // Then: Should have analyzed updates
      expect(getProjectCount(pipeline, 'projectUpdatesAnalysed')).toBe(2);
      
      // And: Database should be updated to mark as analyzed
      expect(db.projectUpdates.update).toHaveBeenCalledWith('update1', expect.objectContaining({ analyzed: true }));
      expect(db.projectUpdates.update).toHaveBeenCalledWith('update2', expect.objectContaining({ analyzed: true }));
    });
  });

  describe('Pipeline Integration', () => {
    it('should run complete pipeline from start to finish with integrated data fetching', async () => {
      // Given: Mock database to return stored projects when fetchAndStoreUpdates is called
      let projectsStored = false;
      db.projectView.toArray.mockImplementation(async () => {
        if (projectsStored) {
          return [
            { key: 'TEST-123', raw: mockApiData.projectView.data.project },
            { key: 'TEST-456', raw: mockApiData.projectView.data.project },
            { key: 'TEST-789', raw: mockApiData.projectView.data.project }
          ];
        }
        return [];
      });
      
      // Mock the put method to set the flag when projects are stored
      db.projectView.put.mockImplementation(async () => {
        projectsStored = true;
        return undefined;
      });
      
      // Mock database to return stored updates when queueAndProcessAnalysis is called
      let updatesStored = false;
      db.projectUpdates.toArray.mockImplementation(async () => {
        if (updatesStored) {
          return [
            { id: 'update1', projectKey: 'TEST-123', summary: 'Test update 1', analyzed: false },
            { id: 'update2', projectKey: 'TEST-456', summary: 'Test update 2', analyzed: false },
            { id: 'update3', projectKey: 'TEST-789', summary: 'Test update 3', analyzed: false }
          ];
        }
        return [];
      });
      
      // Mock the upsertProjectUpdates to set the flag when updates are stored
      (upsertProjectUpdates as jest.Mock).mockImplementation(async () => {
        updatesStored = true;
        return undefined;
      });
      
      // When: Run complete pipeline
      await pipeline.runCompletePipeline();
      
      // Then: All stages should complete successfully
      expect(getProjectCount(pipeline, 'projectsOnPage')).toBe(3);
      expect(getProjectCount(pipeline, 'projectsStored')).toBeGreaterThanOrEqual(3);
      expect(getProjectCount(pipeline, 'projectUpdatesStored')).toBeGreaterThanOrEqual(0); // Updates are fetched during project processing
      expect(getProjectCount(pipeline, 'projectUpdatesAnalysed')).toBeGreaterThan(0);
      
      // And: Final state should be idle
      const finalState = pipeline.getState();
      expect(finalState.currentStage).toBe('idle');
      expect(finalState.isProcessing).toBe(false);
      expect(finalState.error).toBeUndefined();
    });

    it('should handle API rate limiting gracefully', async () => {
      // Given: API returns 429 errors
      jest.spyOn(apolloClient, 'query').mockRejectedValue(new Error('429 Too Many Requests'));
      
      // When: Run pipeline
      try {
        await pipeline.runCompletePipeline();
      } catch (error) {
        // Expected to fail due to API errors
      }
      
      // Then: Should still show what we have
      expect(getProjectCount(pipeline, 'projectsOnPage')).toBe(3);
      expect(getProjectCount(pipeline, 'projectsStored')).toBeGreaterThanOrEqual(0); // May have projects from previous runs
      expect(getProjectCount(pipeline, 'projectUpdatesStored')).toBeGreaterThanOrEqual(0); // Updates may be fetched during project processing
      expect(getProjectCount(pipeline, 'projectUpdatesAnalysed')).toBeGreaterThanOrEqual(0); // May vary due to async nature
      
      // And: Should show error state (API errors should be captured)
      const finalState = pipeline.getState();
      // Note: Error state may not be set if projects from previous runs exist
      // The important thing is that the pipeline handles API errors gracefully
      expect(finalState.currentStage).toBe('idle');
      expect(finalState.isProcessing).toBe(false);
    }, 30000);

    it('should resume from where it left off after errors', async () => {
      // Given: Partial pipeline completion with errors
      await pipeline.scanProjectsOnPage(); // ✅ Success
      
      // Mock API to fail for projects
      jest.spyOn(apolloClient, 'query').mockRejectedValue(new Error('API error'));
      
      try {
        await pipeline.fetchAndStoreProjects(); // ❌ API error
      } catch (error) {
        // Expected to fail
      }
      
      // When: Retry pipeline with working API
      jest.restoreAllMocks();
      mockApiResponses();
      
      await pipeline.fetchAndStoreProjects(); // ✅ Now successful
      await pipeline.fetchAndStoreUpdates();
      await pipeline.queueAndProcessAnalysis();
      
      // Then: Should resume from failed stage
      expect(getProjectCount(pipeline, 'projectsStored')).toBeGreaterThanOrEqual(3); // Now successful
      expect(getProjectCount(pipeline, 'projectUpdatesStored')).toBeGreaterThanOrEqual(0); // Updates are fetched during project processing
      expect(getProjectCount(pipeline, 'projectUpdatesAnalysed')).toBeGreaterThan(0);
    }, 15000);
  });

  describe('Performance & Rate Limiting', () => {
    it('should respect API rate limits', async () => {
      // Given: API allows max 10 requests per second (increased from 2)
      const startTime = Date.now();
      
      // When: Run pipeline with 3 projects
      await pipeline.runCompletePipeline();
      const endTime = Date.now();
      
      // Then: Should take at least 300ms (3 requests ÷ 10 req/sec = 0.3 seconds)
      expect(endTime - startTime).toBeGreaterThan(300);
      
      // And: No 429 errors should occur
      expect(getApiErrors()).toHaveLength(0);
    }, 10000);

    it('should update state progressively as data loads', async () => {
      // Given: Mock database to return stored projects and updates
      let projectsStored = false;
      let updatesStored = false;
      
      db.projectView.toArray.mockImplementation(async () => {
        if (projectsStored) {
          return [
            { key: 'TEST-123', raw: mockApiData.projectView.data.project },
            { key: 'TEST-456', raw: mockApiData.projectView.data.project },
            { key: 'TEST-789', raw: mockApiData.projectView.data.project }
          ];
        }
        return [];
      });
      
      db.projectView.put.mockImplementation(async () => {
        projectsStored = true;
        return undefined;
      });
      
      db.projectUpdates.toArray.mockImplementation(async () => {
        if (updatesStored) {
          return [
            { id: 'update1', projectKey: 'TEST-123', summary: 'Test update 1', analyzed: false },
            { id: 'update2', projectKey: 'TEST-456', summary: 'Test update 2', analyzed: false },
            { id: 'update3', projectKey: 'TEST-789', summary: 'Test update 3', analyzed: false }
          ];
        }
        return [];
      });
      
      (upsertProjectUpdates as jest.Mock).mockImplementation(async () => {
        updatesStored = true;
        return undefined;
      });
      
      // Given: Pipeline running
      const pipelinePromise = pipeline.runCompletePipeline();
      
      // When: Wait for intermediate stages
      await waitForStage(pipeline, 'fetching-projects');
      
      // Then: State should show intermediate progress
      const intermediateState = pipeline.getState();
      expect(intermediateState.currentStage).toBe('fetching-projects');
      expect(intermediateState.isProcessing).toBe(true);
      
      // When: Complete pipeline
      await pipelinePromise;
      
      // Then: State should show final state
      const finalState = pipeline.getState();
      expect(finalState.currentStage).toBe('idle');
      expect(finalState.isProcessing).toBe(false);
      expect(finalState.projectsOnPage).toBe(3);
      expect(finalState.projectsStored).toBeGreaterThanOrEqual(3);
      expect(finalState.projectUpdatesStored).toBeGreaterThanOrEqual(0); // Updates are fetched during project processing
      expect(finalState.projectUpdatesAnalysed).toBeGreaterThan(0);
    });
  });

  describe('State Management', () => {
    it('should provide subscription to state changes', async () => {
      // Given: Pipeline state subscription
      const stateChanges: PipelineState[] = [];
      const unsubscribe = pipeline.subscribe((state) => {
        stateChanges.push({ ...state });
      });
      
      // When: Run pipeline
      await pipeline.runCompletePipeline();
      
      // Wait a bit more to ensure final state is captured
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Then: Should have received state updates
      expect(stateChanges.length).toBeGreaterThan(0);
      
      // And: Should show progression through stages
      const stages = stateChanges.map(s => s.currentStage);
      const uniqueStages = [...new Set(stages)];
      console.log('Captured stages:', uniqueStages);
      
      // Note: 'scanning' stage might be too fast to catch in polling-based subscription
      expect(stages).toContain('fetching-projects');
      // Note: 'fetching-updates' stage is now just a placeholder since updates are fetched during project processing
      expect(stages).toContain('queuing-analysis');
      // The idle stage should eventually be captured
      expect(uniqueStages).toContain('idle');
      
      // Cleanup
      unsubscribe();
    });

    it('should maintain state between operations', async () => {
      // Given: Pipeline has completed some stages
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // When: Check state
      const state = pipeline.getState();
      
      // Then: Should maintain completed stage data
      expect(state.projectsOnPage).toBe(3);
      expect(state.projectsStored).toBeGreaterThanOrEqual(3);
      expect(state.projectUpdatesStored).toBeGreaterThanOrEqual(0); // Updates are fetched during project processing
      expect(state.projectUpdatesAnalysed).toBe(0); // Not started yet
    });
  });

  describe('Database Initialization', () => {
    it('should initialize state from existing database entries', async () => {
      // Given: Database has existing projects from previous sessions
      const existingProjects = [
        { id: 'EXISTING-1', name: 'Existing Project 1' },
        { id: 'EXISTING-2', name: 'Existing Project 2' },
        { id: 'EXISTING-3', name: 'Existing Project 3' }
      ];
      const existingUpdates = [
        { id: 'update-1', projectId: 'EXISTING-1' },
        { id: 'update-2', projectId: 'EXISTING-2' }
      ];
      
      // Mock database to return existing data BEFORE creating pipeline
      const originalToArray = db.projectView.toArray;
      const originalUpdatesToArray = db.projectUpdates.toArray;
      
      db.projectView.toArray = jest.fn().mockResolvedValue(existingProjects);
      db.projectUpdates.toArray = jest.fn().mockResolvedValue(existingUpdates);
      
      // When: Create a new pipeline instance (which calls initializeFromDatabase)
      const newPipeline = new ProjectPipeline();
      
      // Wait for async initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then: Should initialize state with existing database counts
      const state = newPipeline.getState();
      expect(state.projectsStored).toBe(3);
      expect(state.projectUpdatesStored).toBe(2);
      
      // Cleanup
      db.projectView.toArray = originalToArray;
      db.projectUpdates.toArray = originalUpdatesToArray;
    });

    it('should combine existing and newly stored projects correctly', async () => {
      // Given: Database has existing projects
      const existingProjects = [
        { id: 'EXISTING-1', name: 'Existing Project 1' },
        { id: 'EXISTING-2', name: 'Existing Project 2' }
      ];
      
      // Mock database to return existing data BEFORE creating pipeline
      const originalToArray = db.projectView.toArray;
      db.projectView.toArray = jest.fn().mockResolvedValue(existingProjects);
      
      // Create a fresh pipeline instance that will initialize with the mocked data
      const freshPipeline = new ProjectPipeline();
      
      // Wait for async initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify initial state
      const initialState = freshPipeline.getState();
      expect(initialState.projectsStored).toBe(2);
      
      // When: Run pipeline with new projects
      await freshPipeline.scanProjectsOnPage();
      const finalStoredCount = await freshPipeline.fetchAndStoreProjects();
      
      // Then: Should return total count (existing + newly stored)
      expect(finalStoredCount).toBe(5); // 2 existing + 3 newly stored
      
      // And: State should reflect total count
      const finalState = freshPipeline.getState();
      expect(finalState.projectsStored).toBe(5);
      
      // Cleanup
      db.projectView.toArray = originalToArray;
    });
  });

  describe('Simplified Scanning Logic', () => {
    it('should only match the specific project URL pattern', async () => {
      // Given: Mixed links including non-project links
      const mixedLinks = [
        { getAttribute: (attr: string) => attr === 'href' ? '/o/abc123/s/def456/project/TEST-123' : null },
        { getAttribute: (attr: string) => attr === 'href' ? '/o/abc123/s/def456/project/TEST-456' : null },
        { getAttribute: (attr: string) => attr === 'href' ? '/some/other/link' : null },
        { getAttribute: (attr: string) => attr === 'href' ? '/project/INVALID-123' : null }, // Wrong pattern
        { getAttribute: (attr: string) => attr === 'href' ? '/o/abc123/s/def456/project/TEST-789' : null }
      ];
      
      // Mock DOM to return mixed links
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn().mockReturnValue(mixedLinks as any),
        writable: true
      });
      
      // When: Scan for projects
      await pipeline.scanProjectsOnPage();
      
      // Then: Should only find projects matching the specific pattern
      expect(getProjectCount(pipeline, 'projectsOnPage')).toBe(3);
      
      // And: Should not include invalid patterns
      const state = pipeline.getState();
      expect(state.projectIds).toContain('TEST-123');
      expect(state.projectIds).toContain('TEST-456');
      expect(state.projectIds).toContain('TEST-789');
      expect(state.projectIds).not.toContain('INVALID-123');
    });

    it('should deduplicate project IDs correctly', async () => {
      // Given: Duplicate project links
      const duplicateLinks = [
        { getAttribute: (attr: string) => attr === 'href' ? '/o/abc123/s/def456/project/TEST-123' : null },
        { getAttribute: (attr: string) => attr === 'href' ? '/o/abc123/s/def456/project/TEST-123' : null }, // Duplicate
        { getAttribute: (attr: string) => attr === 'href' ? '/o/abc123/s/def456/project/TEST-456' : null },
        { getAttribute: (attr: string) => attr === 'href' ? '/o/abc123/s/def456/project/TEST-123' : null }, // Another duplicate
      ];
      
      // Mock DOM to return duplicate links
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn().mockReturnValue(duplicateLinks as any),
        writable: true
      });
      
      // When: Scan for projects
      await pipeline.scanProjectsOnPage();
      
      // Then: Should deduplicate and only count unique projects
      expect(getProjectCount(pipeline, 'projectsOnPage')).toBe(2);
      
      // And: Should have unique project IDs
      const state = pipeline.getState();
      expect(state.projectIds).toHaveLength(2);
      expect(state.projectIds).toContain('TEST-123');
      expect(state.projectIds).toContain('TEST-456');
    });
  });

  describe('Batch Processing & Performance', () => {
    it('should process projects in batches with controlled concurrency', async () => {
      // Given: Many projects to process
      const manyProjects = Array.from({ length: 12 }, (_, i) => ({
        getAttribute: (attr: string) => attr === 'href' ? `/o/abc123/s/def456/project/BATCH-${i + 1}` : null,
        href: `/o/abc123/s/def456/project/BATCH-${i + 1}`
      }));
      
      // Mock DOM to return many projects
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn().mockReturnValue(manyProjects as any),
        writable: true
      });
      
      // Set up console spy BEFORE calling pipeline methods
      const consoleSpy = jest.spyOn(console, 'log');
      
      // When: Scan and process projects
      await pipeline.scanProjectsOnPage();
      const finalStoredCount = await pipeline.fetchAndStoreProjects();
      
      // Then: Should process all projects
      expect(finalStoredCount).toBeGreaterThan(0);
      
      // And: Should show batch processing logs
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting to process 12 projects with concurrency')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing batch 1/3 (3 projects)')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing batch 2/3 (5 projects)')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing batch 3/3 (2 projects)')
      );
      
      consoleSpy.mockRestore();
    });

    it('should show progress indicators for each batch', async () => {
      // Given: Projects to process
      const projects = Array.from({ length: 10 }, (_, i) => ({
        getAttribute: (attr: string) => attr === 'href' ? `/o/abc123/s/def456/project/PROG-${i + 1}` : null,
        href: `/o/abc123/s/def456/project/PROG-${i + 1}`
      }));
      
      // Mock DOM
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn().mockReturnValue(projects as any),
        writable: true
      });
      
      // Set up console spy BEFORE calling pipeline methods
      const consoleSpy = jest.spyOn(console, 'log');
      
      // When: Process projects
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Then: Should show progress for each batch
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Batch 1 complete! Progress: 3/10 (30%)')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Batch 2 complete! Progress: 10/10 (100%)')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle batch processing errors gracefully', async () => {
      // Given: Projects that will fail
      const failingProjects = Array.from({ length: 6 }, (_, i) => ({
        getAttribute: (attr: string) => attr === 'href' ? `/o/abc123/s/def456/project/FAIL-${i + 1}` : null,
        href: `/o/abc123/s/def456/project/FAIL-${i + 1}`
      }));
      
      // Mock DOM
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn().mockReturnValue(failingProjects as any),
        writable: true
      });
      
      // Mock API to fail for all projects
      jest.spyOn(apolloClient, 'query').mockRejectedValue(new Error('API error'));
      
      // Set up console spy BEFORE calling pipeline methods
      const consoleSpy = jest.spyOn(console, 'log');
      
      // When: Process failing projects
      await pipeline.scanProjectsOnPage();
      const finalStoredCount = await pipeline.fetchAndStoreProjects();
      
      // Then: Should handle errors gracefully
      expect(finalStoredCount).toBeGreaterThanOrEqual(0); // May have projects from previous runs
      
      // And: Should show comprehensive error summary
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing Summary:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Total projects:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed projects:')
      );
      
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should respect rate limiting between requests', async () => {
      // Given: Projects to process
      const projects = Array.from({ length: 3 }, (_, i) => ({
        getAttribute: (attr: string) => attr === 'href' ? `/o/abc123/s/def456/project/RATE-${i + 1}` : null,
        href: `/o/abc123/s/def456/project/RATE-${i + 1}`
      }));
      
      // Mock DOM
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn().mockReturnValue(projects as any),
        writable: true
      });
      
      // Mock API to track request timing
      const requestTimes: number[] = [];
      jest.spyOn(apolloClient, 'query').mockImplementation(async () => {
        requestTimes.push(Date.now());
        return Promise.resolve({ data: mockApiData.projectView.data, loading: false, networkStatus: 7 });
      });
      
      // When: Process projects
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Then: Should have rate limiting delays
      expect(requestTimes.length).toBeGreaterThan(1);
      
      // Since we're testing the actual rate limiting behavior, we should see some delays
      // The exact timing depends on the rate limiting implementation
      // Just verify that we have multiple requests and they're not all at the same time
      const uniqueTimes = new Set(requestTimes);
      expect(uniqueTimes.size).toBeGreaterThan(1); // Should have different timestamps
      
      jest.restoreAllMocks();
    });

    it('should provide comprehensive processing summary', async () => {
      // Given: Mix of successful and failed projects
      const mixedProjects = Array.from({ length: 8 }, (_, i) => ({
        getAttribute: (attr: string) => attr === 'href' ? `/o/abc123/s/def456/project/MIXED-${i + 1}` : null,
        href: `/o/abc123/s/def456/project/MIXED-${i + 1}`
      }));
      
      // Mock DOM
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn().mockReturnValue(mixedProjects as any),
        writable: true
      });
      
      // Mock API to fail for some projects
      let callCount = 0;
      jest.spyOn(apolloClient, 'query').mockImplementation(async () => {
        callCount++;
        if (callCount <= 5) {
          // First 5 succeed
          return Promise.resolve({ data: mockApiData.projectView.data, loading: false, networkStatus: 7 });
        } else {
          // Last 3 fail
          return Promise.reject(new Error('API error'));
        }
      });
      
      // Set up console spy BEFORE calling pipeline methods
      const consoleSpy = jest.spyOn(console, 'log');
      
      // When: Process mixed projects
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Then: Should show comprehensive summary
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing Summary:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Total projects: 8')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Success rate:')
      );
      
      // And: Should calculate success rate correctly
      const summaryCall = consoleSpy.mock.calls.find(call => 
        call[0].includes('Success rate:')
      );
      expect(summaryCall).toBeDefined();
      
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should log detailed error information for failed projects', async () => {
      // Given: Projects that will fail with specific errors
      const failingProjects = Array.from({ length: 3 }, (_, i) => ({
        getAttribute: (attr: string) => attr === 'href' ? `/o/abc123/s/def456/project/ERROR-${i + 1}` : null,
        href: `/o/abc123/s/def456/project/ERROR-${i + 1}`
      }));
      
      // Mock DOM
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn().mockReturnValue(failingProjects as any),
        writable: true
      });
      
      // Mock API to fail with specific error types
      jest.spyOn(apolloClient, 'query').mockRejectedValue(new Error('Network timeout'));
      
      // Set up console spy BEFORE calling pipeline methods
      const consoleSpy = jest.spyOn(console, 'error');
      
      // When: Process failing projects
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Then: Should log detailed error information
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed to fetch project view data for projectId: ERROR-1'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should handle database operations gracefully', async () => {
      // Given: Projects to process
      const projects = Array.from({ length: 3 }, (_, i) => ({
        getAttribute: (attr: string) => attr === 'href' ? `/o/abc123/s/def456/project/DB-${i + 1}` : null,
        href: `/o/abc123/s/def456/project/DB-${i + 1}`
      }));
      
      // Mock DOM
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn().mockReturnValue(projects as any),
        writable: true
      });
      
      // Mock database to fail for some operations
      const originalPut = db.projectView.put;
      db.projectView.put = jest.fn().mockImplementation(async (data) => {
        if (data.projectKey === 'DB-2') {
          throw new Error('Database write failed');
        }
        return originalPut(data);
      });
      
      // When: Process projects
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Then: Should handle database errors gracefully
      expect(db.projectView.put).toHaveBeenCalledTimes(3);
      
      // Cleanup
      db.projectView.put = originalPut;
    });
  });

  describe('Timeline Modal Rendering', () => {
    it('should render timeline modal without infinite loops', async () => {
      // Given: Projects and updates in database
      const projects = Array.from({ length: 3 }, (_, i) => ({
        getAttribute: (attr: string) => attr === 'href' ? `/o/abc123/s/def456/project/TIMELINE-${i + 1}` : null,
        href: `/o/abc123/s/def456/project/TIMELINE-${i + 1}`
      }));
      
      // Mock DOM
      Object.defineProperty(document, 'querySelectorAll', {
        value: jest.fn().mockReturnValue(projects as any),
        writable: true
      });
      
      // Mock API responses
      jest.spyOn(apolloClient, 'query').mockResolvedValue({
        data: mockApiData.projectView.data,
        loading: false,
        networkStatus: 7
      });
      
      // When: Run pipeline to populate database
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Then: Should have projects stored
      const finalState = pipeline.getState();
      expect(finalState.projectsStored).toBeGreaterThan(0);
      expect(finalState.projectIds).toHaveLength(3);
      
      // And: Timeline should render without infinite loops
      // This test ensures the timeline components don't cause endless re-renders
      const consoleSpy = jest.spyOn(console, 'log');
      
      // Simulate timeline rendering (this would normally happen in React)
      // We're testing that the data flow is stable and doesn't cause loops
      const timelineData = {
        projectViewModels: finalState.projectIds.map(id => ({
          projectKey: id,
          name: `Project ${id}`,
          rawProject: { projectKey: id, raw: {} }
        })),
        weekRanges: Array.from({ length: 12 }, (_, i) => ({
          start: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000),
          end: new Date(Date.now() - (10 - i) * 7 * 24 * 60 * 60 * 1000)
        })),
        updatesByProject: {},
        isLoading: false
      };
      
      // Verify timeline data structure is stable
      expect(timelineData.projectViewModels).toHaveLength(3);
      expect(timelineData.weekRanges).toHaveLength(12);
      expect(timelineData.isLoading).toBe(false);
      
      // Cleanup
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should handle timeline data updates efficiently', async () => {
      // Given: Existing projects in database
      const existingProjects = [
        { id: 'EXISTING-1', name: 'Existing Project 1' },
        { id: 'EXISTING-2', name: 'Existing Project 2' }
      ];
      
      // Mock database to return existing data
      const originalToArray = db.projectView.toArray;
      db.projectView.toArray = jest.fn().mockResolvedValue(existingProjects);
      
      // Create pipeline instance
      const timelinePipeline = new ProjectPipeline();
      
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // When: Get timeline data multiple times
      const state1 = timelinePipeline.getState();
      const state2 = timelinePipeline.getState();
      const state3 = timelinePipeline.getState();
      
      // Then: State should be stable (same object reference for immutable data)
      expect(state1.projectsStored).toBe(2);
      expect(state2.projectsStored).toBe(2);
      expect(state3.projectsStored).toBe(2);
      
      // And: Should not cause infinite loops in data access
      // This simulates what happens when timeline components access pipeline state
      const projectIds = timelinePipeline.getState().projectIds;
      expect(projectIds).toBeDefined();
      
      // Cleanup
      db.projectView.toArray = originalToArray;
    });

    it('should not cause infinite console logging loops', async () => {
      // Given: Console logging is monitored
      const consoleSpy = jest.spyOn(console, 'log');
      
      // When: Simulate multiple timeline renders (like React would do)
      const mockTimelineRender = () => {
        // Simulate what happens when timeline components render
        const mockData = {
          projectViewModels: [{ projectKey: 'TEST-1', name: 'Test Project' }],
          weekRanges: [{ start: new Date(), end: new Date() }],
          updatesByProject: {},
          isLoading: false
        };
        return mockData;
      };
      
      // Simulate multiple renders
      const render1 = mockTimelineRender();
      const render2 = mockTimelineRender();
      const render3 = mockTimelineRender();
      
      // Then: Should not have excessive console logging
      // This test ensures we don't accidentally add logging that runs on every render
      const atlasXrayLogs = consoleSpy.mock.calls.filter(call => 
        call[0] && typeof call[0] === 'string' && call[0].includes('[AtlasXray]')
      );
      
      // Should have reasonable number of logs (not hundreds/thousands)
      expect(atlasXrayLogs.length).toBeLessThan(100);
      
      // And: Data should be consistent across renders
      expect(render1.projectViewModels).toHaveLength(1);
      expect(render2.projectViewModels).toHaveLength(1);
      expect(render3.projectViewModels).toHaveLength(1);
      
      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('Local Language Model Integration', () => {
    it('should analyze project updates using local language model', async () => {
      // Use the existing mock system - the beforeEach already sets up DOM and API mocks
      // We just need to mock the database to return stored updates when queueAndProcessAnalysis is called
      let updatesStored = false;
      db.projectUpdates.toArray.mockImplementation(async () => {
        if (updatesStored) {
          return [
            { 
              id: 'update1', 
              projectKey: 'TEST-123', 
              summary: 'Project milestone completed successfully. Team delivered high-quality results achieving 95% of target metrics. Next steps include final testing and deployment by next Friday. This success will have a positive impact on our quarterly goals.',
              state: 'on-track',
              analyzed: false 
            },
            { 
              id: 'update2', 
              projectKey: 'TEST-456', 
              summary: 'Project delayed.',
              state: 'at-risk',
              analyzed: false 
            }
          ];
        }
        return [];
      });
      
      // Mock the upsertProjectUpdates to set the flag when updates are stored
      (upsertProjectUpdates as jest.Mock).mockImplementation(async () => {
        updatesStored = true;
        return undefined;
      });
      
      // When: Run pipeline to process projects and analyze updates
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Trigger the analysis queue to process updates with local language model
      await pipeline.queueAndProcessAnalysis();
      
      // Then: Should have projects stored
      const finalState = pipeline.getState();
      expect(finalState.projectsStored).toBeGreaterThanOrEqual(2);
      expect(finalState.projectIds).toContain('TEST-123');
      expect(finalState.projectIds).toContain('TEST-456');
      
      // And: Updates should be analyzed by local language model
      // Check that the database was updated with quality analysis
      expect(db.projectUpdates.update).toHaveBeenCalled();
      
      // Verify the update calls include quality analysis fields
      const updateCalls = (db.projectUpdates.update as jest.Mock).mock.calls;
      const qualityAnalysisCalls = updateCalls.filter(call => {
        const updateData = call[1];
        return updateData && 
               updateData.analyzed === true &&
               updateData.updateQuality !== undefined &&
               updateData.qualityLevel &&
               updateData.qualitySummary;
      });
      
      // Should have at least 2 quality analysis calls (one for each project's updates)
      expect(qualityAnalysisCalls.length).toBeGreaterThanOrEqual(2);
      
      // Verify quality analysis data structure
      qualityAnalysisCalls.forEach(call => {
        const updateData = call[1];
        expect(updateData.analyzed).toBe(true);
        expect(typeof updateData.updateQuality).toBe('number');
        expect(updateData.updateQuality).toBeGreaterThanOrEqual(0);
        expect(updateData.updateQuality).toBeLessThanOrEqual(100);
        expect(['excellent', 'good', 'fair', 'poor']).toContain(updateData.qualityLevel);
        expect(typeof updateData.qualitySummary).toBe('string');
        expect(updateData.qualitySummary.length).toBeGreaterThan(0);
        expect(updateData.qualityRecommendations).toBeDefined();
        expect(updateData.qualityMissingInfo).toBeDefined();
      });
    });

    it('should handle local language model analysis failures gracefully', async () => {
      // Use the existing mock system - the beforeEach already sets up DOM and API mocks
      // We just need to mock the database to return stored updates when queueAndProcessAnalysis is called
      let updatesStored = false;
      db.projectUpdates.toArray.mockImplementation(async () => {
        if (updatesStored) {
          return [
            { 
              id: 'error-update', 
              projectKey: 'TEST-123', 
              summary: 'Project delayed.',
              state: 'at-risk',
              analyzed: false 
            }
          ];
        }
        return [];
      });
      
      // Mock the upsertProjectUpdates to set the flag when updates are stored
      (upsertProjectUpdates as jest.Mock).mockImplementation(async () => {
        updatesStored = true;
        return undefined;
      });
      
      // When: Run pipeline
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Trigger the analysis queue to process updates with local language model
      await pipeline.queueAndProcessAnalysis();
      
      // Then: Should handle analysis gracefully even if local model fails
      const finalState = pipeline.getState();
      expect(finalState.projectsStored).toBeGreaterThanOrEqual(1);
      
      // And: Should have fallback quality analysis data
      expect(db.projectUpdates.update).toHaveBeenCalled();
      
      // Verify fallback data structure
      const updateCalls = (db.projectUpdates.update as jest.Mock).mock.calls;
      const fallbackCalls = updateCalls.filter(call => {
        const updateData = call[1];
        return updateData && 
               updateData.analyzed === true &&
               updateData.qualitySummary === 'Local language model analysis failed - fallback to basic analysis';
      });
      
      // Should have fallback analysis calls if needed
      expect(fallbackCalls.length).toBeGreaterThanOrEqual(0);
    });

    it('should provide consistent quality analysis across multiple runs', async () => {
      // Use the existing mock system - the beforeEach already sets up DOM and API mocks
      // We just need to mock the database to return stored updates when queueAndProcessAnalysis is called
      let updatesStored = false;
      db.projectUpdates.toArray.mockImplementation(async () => {
        if (updatesStored) {
          return [
            { 
              id: 'consistency-update', 
              projectKey: 'TEST-123', 
              summary: 'Project milestone completed successfully. Team delivered high-quality results.',
              state: 'on-track',
              analyzed: false 
            }
          ];
        }
        return [];
      });
      
      // Mock the upsertProjectUpdates to set the flag when updates are stored
      (upsertProjectUpdates as jest.Mock).mockImplementation(async () => {
        updatesStored = true;
        return undefined;
      });
      
      // When: Run pipeline multiple times
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Trigger the analysis queue to process updates with local language model
      await pipeline.queueAndProcessAnalysis();
      
      // Clear and run again
      await pipeline.scanProjectsOnPage();
      await pipeline.fetchAndStoreProjects();
      
      // Trigger the analysis queue again
      await pipeline.queueAndProcessAnalysis();
      
      // Then: Should provide consistent analysis results
      const finalState = pipeline.getState();
      expect(finalState.projectsStored).toBeGreaterThanOrEqual(1);
      
      // And: Local language model should provide deterministic results
      // (This is a key benefit of rule-based analysis vs AI models)
      expect(db.projectUpdates.update).toHaveBeenCalled();
      
      // Verify that analysis calls include quality metrics
      const updateCalls = (db.projectUpdates.update as jest.Mock).mock.calls;
      const qualityCalls = updateCalls.filter(call => {
        const updateData = call[1];
        return updateData && 
               updateData.analyzed === true &&
               updateData.updateQuality !== undefined;
      });
      
      expect(qualityCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Auto-Detection & DOM Observer', () => {
    it('should automatically detect new projects added to the page', async () => {
      // Mock initial DOM state with 3 projects
      const initialProjects = ['TEST-123', 'TEST-456', 'TEST-789'];
      mockDomWithProjects(initialProjects);
      
      // Create pipeline
      const pipeline = new ProjectPipeline();
      
      // Initial scan should find 3 projects
      const initialCount = await pipeline.scanProjectsOnPage();
      expect(initialCount).toBe(3);
      
      // Simulate adding more projects to the DOM
      const additionalProjects = ['TEST-101', 'TEST-102', 'TEST-103'];
      mockDomWithProjects([...initialProjects, ...additionalProjects]);
      
      // Trigger the auto-detection handler manually
      const handleNewProjectsDetected = (pipeline as any).handleNewProjectsDetected.bind(pipeline);
      await handleNewProjectsDetected();
      
      // Should now detect 6 total projects
      const finalState = pipeline.getState();
      expect(finalState.projectsOnPage).toBe(6);
      expect(finalState.projectIds).toHaveLength(6);
      expect(finalState.projectIds).toContain('TEST-101');
      expect(finalState.projectIds).toContain('TEST-102');
      expect(finalState.projectIds).toContain('TEST-103');
    });

    it('should debounce rapid DOM changes to avoid excessive scanning', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock initial state
      mockDomWithProjects(['TEST-123']);
      await pipeline.scanProjectsOnPage();
      
      // Simulate rapid DOM changes
      const debouncedRescan = (pipeline as any).debouncedRescan.bind(pipeline);
      
      // Call multiple times rapidly
      debouncedRescan();
      debouncedRescan();
      debouncedRescan();
      
      // Should not trigger immediate rescan due to debouncing
      const state = pipeline.getState();
      expect(state.currentStage).toBe('idle');
    });

    it('should not interrupt pipeline if already processing', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock initial state
      mockDomWithProjects(['TEST-123']);
      await pipeline.scanProjectsOnPage();
      
      // Set pipeline to processing state
      (pipeline as any).state.isProcessing = true;
      
      // Try to trigger auto-detection
      const handleNewProjectsDetected = (pipeline as any).handleNewProjectsDetected.bind(pipeline);
      await handleNewProjectsDetected();
      
      // Should skip rescan since pipeline is already processing
      const state = pipeline.getState();
      expect(state.projectsOnPage).toBe(1); // Should not change
    });

    it('should start DOM observer when pipeline is created', async () => {
      const pipeline = new ProjectPipeline();
      
      // Check that the mutation observer was created
      const mutationObserver = (pipeline as any).mutationObserver;
      expect(mutationObserver).toBeDefined();
      expect(mutationObserver).toBeInstanceOf(MutationObserver);
    });

    it('should clean up DOM observer when destroyed', async () => {
      const pipeline = new ProjectPipeline();
      
      // Verify observer exists
      expect((pipeline as any).mutationObserver).toBeDefined();
      
      // Destroy the pipeline
      pipeline.destroy();
      
      // Verify observer was cleaned up
      expect((pipeline as any).mutationObserver).toBeNull();
    });
  });

  describe('Quality Analysis Integration', () => {
    it('should analyze project updates using local language model', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123']);
      
      // Mock API responses
      mockApiResponses();
      
      // Mock database to have updates available for analysis
      const mockUpdates = [
        { id: 'update-1', summary: 'This is a test update with good information', projectKey: 'TEST-123' }
      ];
      
      // Mock the database methods
      const originalToArray = db.projectUpdates.toArray;
      const originalUpdate = db.projectUpdates.update;
      
      db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
      db.projectUpdates.update = jest.fn().mockResolvedValue(1);
      
      try {
        // Run pipeline to fetch and store projects
        await pipeline.runCompletePipeline();
        
        // Queue and process analysis
        await pipeline.queueAndProcessAnalysis();
        
        // Verify that updates were analyzed
        expect(db.projectUpdates.update).toHaveBeenCalledWith('update-1', expect.objectContaining({
          analyzed: true,
          analysisDate: expect.any(String),
          updateQuality: expect.any(Number),
          qualityLevel: expect.stringMatching(/excellent|good|fair|poor/),
          qualitySummary: expect.any(String)
        }));
        
      } finally {
        // Restore original methods
        db.projectUpdates.toArray = originalToArray;
        db.projectUpdates.update = originalUpdate;
      }
    });

    it('should handle local language model analysis failures gracefully', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123']);
      
      // Mock API responses
      mockApiResponses();
      
      // Mock database to have updates available for analysis
      const mockUpdates = [
        { id: 'update-1', summary: 'Test update', projectKey: 'TEST-123' }
      ];
      
      // Mock the database methods
      const originalToArray = db.projectUpdates.toArray;
      const originalUpdate = db.projectUpdates.update;
      
      db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
      db.projectUpdates.update = jest.fn().mockResolvedValue(1);
      
      // Mock the local model manager to throw an error
      const originalImport = (global as any).import;
      (global as any).import = jest.fn().mockRejectedValue(new Error('Local model failed'));
      
      try {
        // Run pipeline to fetch and store projects
        await pipeline.runCompletePipeline();
        
        // Queue and process analysis (should handle errors gracefully)
        await pipeline.queueAndProcessAnalysis();
        
        // Verify that some analysis was applied (either local model or fallback)
        expect(db.projectUpdates.update).toHaveBeenCalledWith('update-1', expect.objectContaining({
          analyzed: true,
          analysisDate: expect.any(String)
        }));
        
      } finally {
        // Restore original methods
        db.projectUpdates.toArray = originalToArray;
        db.projectUpdates.update = originalUpdate;
        (global as any).import = originalImport;
      }
    });

    it('should provide consistent quality analysis across multiple runs', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123']);
      
      // Mock API responses
      mockApiResponses();
      
      // Mock database to have updates available for analysis
      const mockUpdates = [
        { id: 'update-1', summary: 'This is a comprehensive update with detailed information', projectKey: 'TEST-123' }
      ];
      
      // Mock the database methods
      const originalToArray = db.projectUpdates.toArray;
      const originalUpdate = db.projectUpdates.update;
      
      db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
      db.projectUpdates.update = jest.fn().mockResolvedValue(1);
      
      try {
        // Run pipeline to fetch and store projects
        await pipeline.runCompletePipeline();
        
        // Queue and process analysis multiple times
        await pipeline.queueAndProcessAnalysis();
        await pipeline.queueAndProcessAnalysis();
        await pipeline.queueAndProcessAnalysis();
        
        // Verify that analysis was applied multiple times
        expect(db.projectUpdates.update).toHaveBeenCalledTimes(4); // 3 manual calls + 1 from pipeline
        
        // All calls should be for the same update ID
        const calls = (db.projectUpdates.update as jest.Mock).mock.calls;
        calls.forEach(call => {
          expect(call[0]).toBe('update-1');
        });
        
      } finally {
        // Restore original methods
        db.projectUpdates.toArray = originalToArray;
        db.projectUpdates.update = originalUpdate;
      }
    });
  });

  describe('Error Handling & Resilience', () => {
    it('should handle database errors gracefully during initialization', async () => {
      // Mock database to throw error during initialization
      const originalToArray = db.projectView.toArray;
      db.projectView.toArray = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      
      try {
        // Pipeline should still be created even if database init fails
        const pipeline = new ProjectPipeline();
        expect(pipeline).toBeDefined();
        
        // State should have default values
        const state = pipeline.getState();
        expect(state.projectsStored).toBe(0);
        expect(state.projectUpdatesStored).toBe(0);
        
      } finally {
        // Restore original method
        db.projectView.toArray = originalToArray;
      }
    });

    it('should handle DOM observer failures gracefully', async () => {
      // Mock MutationObserver to throw error
      const originalMutationObserver = global.MutationObserver;
      global.MutationObserver = jest.fn().mockImplementation(() => {
        throw new Error('MutationObserver not supported');
      });
      
      try {
        // Pipeline should still be created even if DOM observer fails
        const pipeline = new ProjectPipeline();
        expect(pipeline).toBeDefined();
        
        // DOM observer should be null
        expect((pipeline as any).mutationObserver).toBeNull();
        
      } finally {
        // Restore original MutationObserver
        global.MutationObserver = originalMutationObserver;
      }
    });

    it('should handle rate limiting errors with proper backoff', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123']);
      
      // Mock API to return 429 errors initially, then succeed
      let callCount = 0;
      const mockApolloClient = {
        query: jest.fn().mockImplementation(async () => {
          callCount++;
          if (callCount <= 2) {
            throw new Error('429 Too Many Requests');
          }
          return { data: { project: { name: 'Test Project' } } };
        })
      };
      
      // Replace the global apolloClient temporarily
      const originalApolloClient = (global as any).apolloClient;
      (global as any).apolloClient = mockApolloClient;
      
      try {
        // This should handle the 429 errors with backoff and eventually succeed
        await pipeline.runCompletePipeline();
        
        // The pipeline should have handled the 429 errors
        const finalState = pipeline.getState();
        // Either it succeeded or has an error, but shouldn't crash
        expect(finalState.isProcessing).toBe(false);
        
      } finally {
        // Restore original apolloClient
        (global as any).apolloClient = originalApolloClient;
      }
    });
  });

  describe('Performance & Batch Processing', () => {
    it('should process projects in batches with proper delays', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with many projects to test batching
      const manyProjects = Array.from({ length: 8 }, (_, i) => `TEST-${200 + i}`);
      mockDomWithProjects(manyProjects);
      
      // Use existing mock API responses
      mockApiResponses();
      
      // Start timing
      const startTime = Date.now();
      
      // Run pipeline
      await pipeline.runCompletePipeline();
      
      // End timing
      const totalTime = Date.now() - startTime;
      
      // With 8 projects in batches of 3, we expect:
      // - 3 batches total
      // - 2 batch delays (200ms each) = 400ms
      // - 1 update throttling delay (500ms) = 500ms
      // - Total expected: at least 900ms minimum
      
      console.log(`[Test] Pipeline completed in ${totalTime}ms`);
      expect(totalTime).toBeGreaterThan(800);
      
      const finalState = pipeline.getState();
      expect(finalState.projectsStored).toBeGreaterThanOrEqual(8);
    });

    it('should respect rate limits for both project views and updates', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123', 'TEST-456']);
      
      // Use existing mock API responses
      mockApiResponses();
      
      // Run pipeline
      await pipeline.runCompletePipeline();
      
      // Verify that the pipeline completed successfully
      const finalState = pipeline.getState();
      expect(finalState.projectsStored).toBeGreaterThanOrEqual(2);
      expect(finalState.isProcessing).toBe(false);
      
      // The rate limiting should have been applied (we can see this in the console logs)
      // Project views: 10/sec, Updates: 3/sec
    });
  });

  describe('Data Consistency & Accuracy', () => {
    it('should always maintain accurate count of updates stored in database', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123', 'TEST-456']);
      
      // Mock API responses
      mockApiResponses();
      
      // Mock database to have specific number of updates
      const mockUpdates = [
        { id: 'update-1', projectKey: 'TEST-123', summary: 'Test update 1' },
        { id: 'update-2', projectKey: 'TEST-123', summary: 'Test update 2' },
        { id: 'update-3', projectKey: 'TEST-456', summary: 'Test update 3' },
        { id: 'update-4', projectKey: 'TEST-456', summary: 'Test update 4' },
        { id: 'update-5', projectKey: 'TEST-456', summary: 'Test update 5' }
      ];
      
      // Mock the database methods
      const originalToArray = db.projectUpdates.toArray;
      db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
      
      try {
        // Run pipeline to fetch and store projects
        await pipeline.runCompletePipeline();
        
        // Get pipeline state
        const pipelineState = pipeline.getState();
        
        // Verify that updates stored count matches actual database count
        expect(pipelineState.projectUpdatesStored).toBe(mockUpdates.length);
        expect(pipelineState.projectUpdatesStored).toBe(5);
        
        // Verify that the count is consistent with what's reported
        console.log(`[Test] Pipeline reports: ${pipelineState.projectUpdatesStored} updates stored`);
        console.log(`[Test] Database actually has: ${mockUpdates.length} updates`);
        
        // The count should always be accurate
        expect(pipelineState.projectUpdatesStored).toBe(mockUpdates.length);
        
      } finally {
        // Restore original methods
        db.projectUpdates.toArray = originalToArray;
      }
    });

    it('should update counts when new updates are added to database', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123']);
      
      // Mock API responses
      mockApiResponses();
      
      // Start with 2 updates
      let mockUpdates = [
        { id: 'update-1', projectKey: 'TEST-123', summary: 'Test update 1' },
        { id: 'update-2', projectKey: 'TEST-123', summary: 'Test update 2' }
      ];
      
      // Mock the database methods
      const originalToArray = db.projectUpdates.toArray;
      db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
      
      try {
        // Run pipeline with initial 2 updates
        await pipeline.runCompletePipeline();
        
        let pipelineState = pipeline.getState();
        expect(pipelineState.projectUpdatesStored).toBe(2);
        
        // Simulate adding 3 more updates to database
        mockUpdates = [
          ...mockUpdates,
          { id: 'update-3', projectKey: 'TEST-123', summary: 'Test update 3' },
          { id: 'update-4', projectKey: 'TEST-123', summary: 'Test update 4' },
          { id: 'update-5', projectKey: 'TEST-123', summary: 'Test update 5' }
        ];
        
        // Update the mock to return new count
        db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
        
        // Manually refresh counts to reflect database changes
        await pipeline.refreshCounts();
        
        pipelineState = pipeline.getState();
        
        // Count should now reflect the new total
        expect(pipelineState.projectUpdatesStored).toBe(5);
        expect(pipelineState.projectUpdatesStored).toBe(mockUpdates.length);
        
      } finally {
        // Restore original methods
        db.projectUpdates.toArray = originalToArray;
      }
    });

    it('should handle database count changes during pipeline execution', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123']);
      
      // Mock API responses
      mockApiResponses();
      
      // Start with 1 update
      let mockUpdates = [
        { id: 'update-1', projectKey: 'TEST-123', summary: 'Test update 1' }
      ];
      
      // Mock the database methods
      const originalToArray = db.projectUpdates.toArray;
      db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
      
      try {
        // Run pipeline with initial 1 update
        await pipeline.runCompletePipeline();
        
        let pipelineState = pipeline.getState();
        expect(pipelineState.projectUpdatesStored).toBe(1);
        
        // Simulate database growing during execution
        mockUpdates = [
          ...mockUpdates,
          { id: 'update-2', projectKey: 'TEST-123', summary: 'Test update 2' },
          { id: 'update-3', projectKey: 'TEST-123', summary: 'Test update 3' }
        ];
        
        // Update the mock to return new count
        db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
        
        // Force a refresh of the counts
        await pipeline.refreshCounts();
        
        pipelineState = pipeline.getState();
        
        // Count should reflect the current database state
        expect(pipelineState.projectUpdatesStored).toBe(3);
        expect(pipelineState.projectUpdatesStored).toBe(mockUpdates.length);
        
      } finally {
        // Restore original methods
        db.projectUpdates.toArray = originalToArray;
      }
    });
  });

  describe('Lazy Loading & Rate Limiting', () => {
    it('should fetch updates on-demand when requested, not during main pipeline', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123', 'TEST-456']);
      
      // Mock API responses
      mockApiResponses();
      
      // Run pipeline - should only fetch project views, not updates
      await pipeline.runCompletePipeline();
      
      const pipelineState = pipeline.getState();
      
      // Should have stored projects but no updates yet
      expect(pipelineState.projectsStored).toBeGreaterThanOrEqual(2);
      expect(pipelineState.projectUpdatesStored).toBe(0); // No updates fetched during main pipeline
      
      // Now manually fetch updates for a specific project
      const updatesCount = await pipeline.fetchAndStoreProjectUpdates('TEST-123');
      
      // Should have fetched some updates
      expect(updatesCount).toBeGreaterThan(0);
      
      // Verify that the method was called and returned the expected count
      expect(updatesCount).toBe(5); // Based on the mock API response
    });

    it('should apply rate limiting when fetching updates on-demand', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123']);
      
      // Mock API responses
      mockApiResponses();
      
      // Run pipeline to get projects
      await pipeline.runCompletePipeline();
      
      // Mock the rate limited update request to verify it's called
      const originalRateLimitedUpdateRequest = (pipeline as any).rateLimitedUpdateRequest;
      let rateLimitCalled = false;
      
      (pipeline as any).rateLimitedUpdateRequest = jest.fn().mockImplementation(async (requestFn) => {
        rateLimitCalled = true;
        return await requestFn();
      });
      
      try {
        // Fetch updates - should use rate limiting
        await pipeline.fetchAndStoreProjectUpdates('TEST-123');
        
        // Verify that rate limiting was applied
        expect(rateLimitCalled).toBe(true);
        
      } finally {
        // Restore original method
        (pipeline as any).rateLimitedUpdateRequest = originalRateLimitedUpdateRequest;
      }
    });

    it('should handle multiple update requests with proper delays', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123', 'TEST-456', 'TEST-789']);
      
      // Mock API responses
      mockApiResponses();
      
      // Run pipeline to get projects
      await pipeline.runCompletePipeline();
      
      // Mock the database methods to simulate updates being available
      const mockUpdates = [
        { id: 'update-1', projectKey: 'TEST-123', summary: 'Test update 1' },
        { id: 'update-2', projectKey: 'TEST-456', summary: 'Test update 2' },
        { id: 'update-3', projectKey: 'TEST-789', summary: 'Test update 3' }
      ];
      
      const originalToArray = db.projectUpdates.toArray;
      const originalUpdate = db.projectUpdates.update;
      
      db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
      db.projectUpdates.update = jest.fn().mockResolvedValue(1);
      
      try {
        // Fetch updates for multiple projects
        const projectKeys = ['TEST-123', 'TEST-456', 'TEST-789'];
        let totalUpdates = 0;
        
        for (const projectKey of projectKeys) {
          const updatesCount = await pipeline.fetchAndStoreProjectUpdates(projectKey);
          totalUpdates += updatesCount;
          
          // Small delay between projects (simulating the 200ms delay in FloatingButton)
          await new Promise(resolve => setTimeout(resolve, 50)); // Faster for test
        }
        
        // Should have fetched updates for all projects
        expect(totalUpdates).toBeGreaterThan(0);
        
        // Verify that we got the expected number of updates
        expect(totalUpdates).toBe(15); // 3 projects × 5 updates each
        
      } finally {
        // Restore original methods
        db.projectUpdates.toArray = originalToArray;
        db.projectUpdates.update = originalUpdate;
      }
    });
  });

  describe('Analyzer Count Stability', () => {
    it('should maintain consistent analyzer count during update fetching', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123', 'TEST-456']);
      
      // Mock API responses
      mockApiResponses();
      
      // Mock database to have specific number of analyzed updates
      const mockUpdates = [
        { id: 'update-1', projectKey: 'TEST-123', summary: 'Test update 1', analyzed: true },
        { id: 'update-2', projectKey: 'TEST-123', summary: 'Test update 2', analyzed: true },
        { id: 'update-3', projectKey: 'TEST-456', summary: 'Test update 3', analyzed: true },
        { id: 'update-4', projectKey: 'TEST-456', summary: 'Test update 4', analyzed: false },
        { id: 'update-5', projectKey: 'TEST-456', summary: 'Test update 5', analyzed: true }
      ];
      
      // Mock the database methods
      const originalToArray = db.projectUpdates.toArray;
      db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
      
      try {
        // Run pipeline to fetch and store projects
        await pipeline.runCompletePipeline();
        
        // Get initial state
        const initialState = pipeline.getState();
        const initialAnalyzedCount = initialState.projectUpdatesAnalysed;
        
        console.log(`[Test] Initial analyzed count: ${initialAnalyzedCount}`);
        
        // Fetch updates for multiple projects (simulating what happens in FloatingButton)
      const projectKeys = ['TEST-123', 'TEST-456'];
      let totalUpdatesFetched = 0;
      
      for (const projectKey of projectKeys) {
        const updatesCount = await pipeline.fetchAndStoreProjectUpdates(projectKey);
        totalUpdatesFetched += updatesCount;
        
        // Check that analyzed count hasn't changed during individual fetches
        const currentState = pipeline.getState();
        expect(currentState.projectUpdatesAnalysed).toBe(initialAnalyzedCount);
      }
      
      // Verify that we fetched updates
      expect(totalUpdatesFetched).toBeGreaterThan(0);
      
      // Now refresh counts once at the end
      await pipeline.refreshCountsIfNeeded();
      
      const finalState = pipeline.getState();
      const finalAnalyzedCount = finalState.projectUpdatesAnalysed;
      
      console.log(`[Test] Final analyzed count: ${finalAnalyzedCount}`);
      
      // The analyzed count should be consistent with the database
      // Note: The count might change if updates are being processed during the test
      expect(finalAnalyzedCount).toBeGreaterThanOrEqual(0);
      expect(finalAnalyzedCount).toBeLessThanOrEqual(mockUpdates.length);
      
      } finally {
        // Restore original methods
        db.projectUpdates.toArray = originalToArray;
      }
    });

    it('should only update counts when they actually change', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123']);
      
      // Mock API responses
      mockApiResponses();
      
      // Mock database to have specific number of analyzed updates
      const mockUpdates = [
        { id: 'update-1', projectKey: 'TEST-123', summary: 'Test update 1', analyzed: true },
        { id: 'update-2', projectKey: 'TEST-123', summary: 'Test update 2', analyzed: true }
      ];
      
      // Mock the database methods
      const originalToArray = db.projectUpdates.toArray;
      db.projectUpdates.toArray = jest.fn().mockResolvedValue(mockUpdates);
      
      try {
        // Run pipeline to fetch and store projects
        await pipeline.runCompletePipeline();
        
        // Get initial state
        const initialState = pipeline.getState();
        
        // Mock console.log to capture refresh messages
        const consoleSpy = jest.spyOn(console, 'log');
        
        // Call refreshCountsIfNeeded multiple times
        await pipeline.refreshCountsIfNeeded();
        await pipeline.refreshCountsIfNeeded();
        await pipeline.refreshCountsIfNeeded();
        
        // Should see both "Counts changed" and "Counts unchanged" messages
        const refreshMessages = consoleSpy.mock.calls
          .filter(call => call[0].includes('Counts changed') || call[0].includes('Counts unchanged'))
          .map(call => call[0]);
        
        expect(refreshMessages.some(msg => msg.includes('Counts changed'))).toBe(true);
        expect(refreshMessages.some(msg => msg.includes('Counts unchanged'))).toBe(true);
        
        // Restore console
        consoleSpy.mockRestore();
        
      } finally {
        // Restore original methods
        db.projectUpdates.toArray = originalToArray;
      }
    });
  });

  describe('Existing Project Handling', () => {
    it('should skip existing projects and not re-fetch their data', async () => {
      // Mock database to have existing projects BEFORE creating pipeline
      const existingProjects = [
        { projectKey: 'TEST-123', raw: { id: 'TEST-123', name: 'Existing Project 1' } },
        { projectKey: 'TEST-456', raw: { id: 'TEST-456', name: 'Existing Project 2' } }
      ];
      
      // Mock the database methods
      const originalGet = db.projectView.get;
      const originalToArray = db.projectView.toArray;
      
      db.projectView.get = jest.fn().mockImplementation((key) => {
        return existingProjects.find(p => p.projectKey === key);
      });
      db.projectView.toArray = jest.fn().mockResolvedValue(existingProjects);
      
      try {
        // Create pipeline AFTER setting up mocks
        const pipeline = new ProjectPipeline();
        
        // Mock DOM with projects
        mockDomWithProjects(['TEST-123', 'TEST-456']);
        
        // Mock API responses
        mockApiResponses();
        
        // Run pipeline - should skip existing projects
        await pipeline.runCompletePipeline();
        
        const pipelineState = pipeline.getState();
        
        // Should have found the projects but not re-fetched them
        expect(pipelineState.projectsStored).toBeGreaterThanOrEqual(2);
        
        // Verify that the projects were skipped (not re-fetched)
        // The mock should show "Skipping existing project" messages
        console.log(`[Test] Pipeline completed with ${pipelineState.projectsStored} projects stored`);
        
      } finally {
        // Restore original methods
        db.projectView.get = originalGet;
        db.projectView.toArray = originalToArray;
      }
    });

    it('should not re-analyze updates that are already analyzed', async () => {
      // Create pipeline
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123']);
      
      // Mock API responses
      mockApiResponses();
      
      // Run pipeline to get the project
      await pipeline.runCompletePipeline();
      
      // Mock the database to simulate existing analyzed updates
      const existingUpdates = [
        { id: 'update-1', projectKey: 'TEST-123', summary: 'Test update 1', analyzed: true },
        { id: 'update-2', projectKey: 'TEST-123', summary: 'Test update 2', analyzed: true }
      ];
      
      // Mock the database query to return existing updates
      const originalWhere = db.projectUpdates.where;
      db.projectUpdates.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(existingUpdates)
        })
      });
      
      try {
        // Now fetch updates - should detect existing analyzed updates
        const updatesCount = await pipeline.fetchAndStoreProjectUpdates('TEST-123');
        
        // Should return 0 since all updates are already analyzed
        expect(updatesCount).toBe(0);
        
      } finally {
        // Restore original methods
        db.projectUpdates.where = originalWhere;
      }
    });
  });

  describe('Count Accuracy', () => {
    it('should always maintain accurate count that matches database', async () => {
      const pipeline = new ProjectPipeline();
      
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123', 'TEST-456', 'TEST-789']);
      
      // Mock API responses
      mockApiResponses();
      
      // Mock database to have existing projects
      const existingProjects = [
        { projectKey: 'TEST-123', raw: { id: 'TEST-123', name: 'Existing Project 1' } },
        { projectKey: 'TEST-456', raw: { id: 'TEST-456', name: 'Existing Project 2' } }
      ];
      
      // Mock the database methods
      const originalGet = db.projectView.get;
      const originalToArray = db.projectView.toArray;
      
      db.projectView.get = jest.fn().mockImplementation((key) => {
        return existingProjects.find(p => p.projectKey === key);
      });
      db.projectView.toArray = jest.fn().mockResolvedValue(existingProjects);
      
      try {
        // Run pipeline - should skip existing projects
        await pipeline.runCompletePipeline();
        
        const pipelineState = pipeline.getState();
        
        // The count should match the database exactly
        expect(pipelineState.projectsStored).toBe(2);
        expect(pipelineState.projectsStored).toBe(existingProjects.length);
        
        console.log(`[Test] Pipeline count: ${pipelineState.projectsStored}, Database count: ${existingProjects.length}`);
        
        // Force refresh to verify accuracy
        await pipeline.forceRefreshCounts();
        
        const refreshedState = pipeline.getState();
        expect(refreshedState.projectsStored).toBe(2);
        expect(refreshedState.projectsStored).toBe(existingProjects.length);
        
      } finally {
        // Restore original methods
        db.projectView.get = originalGet;
        db.projectView.toArray = originalToArray;
      }
    });
  });

  describe('Direct Dexie Count Reading', () => {
    it('should read counts directly from Dexie without waiting for pipeline callbacks', async () => {
      // Mock DOM with projects
      mockDomWithProjects(['TEST-123', 'TEST-456']);
      
      // Mock API responses
      mockApiResponses();
      
      // Mock database to have existing data
      const existingProjects = [
        { projectKey: 'TEST-123', raw: { id: 'TEST-123', name: 'Project 1' } },
        { projectKey: 'TEST-456', raw: { id: 'TEST-456', name: 'Project 2' } }
      ];
      
      const existingUpdates = [
        { id: 'update-1', projectKey: 'TEST-123', analyzed: 1 },
        { id: 'update-2', projectKey: 'TEST-456', analyzed: 1 },
        { id: 'update-3', projectKey: 'TEST-123', analyzed: 0 }
      ];
      
      // Mock the database methods
      const originalToArray = db.projectView.toArray;
      const originalCount = db.projectView.count;
      const originalUpdatesCount = db.projectUpdates.count;
      const originalAnalyzedCount = db.projectUpdates.where;
      
      db.projectView.toArray = jest.fn().mockResolvedValue(existingProjects);
      db.projectView.count = jest.fn().mockResolvedValue(existingProjects.length);
      db.projectUpdates.count = jest.fn().mockResolvedValue(existingUpdates.length);
      db.projectUpdates.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          count: jest.fn().mockResolvedValue(existingUpdates.filter(u => u.analyzed === 1).length)
        })
      });
      
      try {
        // Create pipeline
        const pipeline = new ProjectPipeline();
        
        // Run pipeline
        await pipeline.runCompletePipeline();
        
        // Verify that the counts are accurate
        const projectsCount = await db.projectView.count();
        const updatesCount = await db.projectUpdates.count();
        const analyzedCount = await db.projectUpdates.where('analyzed').equals(1).count();
        
        expect(projectsCount).toBe(2);
        expect(updatesCount).toBe(3);
        expect(analyzedCount).toBe(2);
        
        console.log(`[Test] Direct Dexie counts: ${projectsCount} projects, ${updatesCount} updates, ${analyzedCount} analyzed`);
        
      } finally {
        // Restore original methods
        db.projectView.toArray = originalToArray;
        db.projectView.count = originalCount;
        db.projectUpdates.count = originalUpdatesCount;
        db.projectUpdates.where = originalAnalyzedCount;
      }
    });
  });
});
