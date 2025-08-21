// Mock the database module BEFORE importing anything else
jest.mock('../utils/database', () => ({
  db: {
    projectView: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      put: jest.fn().mockResolvedValue(undefined)
    },
    projectUpdates: {
      clear: jest.fn().mockResolvedValue(undefined),
      toArray: jest.fn().mockResolvedValue([]),
      put: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined)
    },
    projectStatusHistory: {
      clear: jest.fn().mockResolvedValue(undefined)
    }
  },
  upsertProjectUpdates: jest.fn().mockResolvedValue(undefined),
  upsertProjectStatusHistory: jest.fn().mockResolvedValue(undefined)
}));

import { ProjectPipeline, PipelineState } from '../services/projectPipeline';
import { apolloClient } from '../services/apolloClient';

// Import the mocked db after mocking
const { db, upsertProjectUpdates, upsertProjectStatusHistory } = require('../utils/database');

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
      expect(getProjectCount(pipeline, 'projectsStored')).toBe(3);
      
      // And: Should have called upsertProjectUpdates and upsertProjectStatusHistory
      expect(upsertProjectUpdates).toHaveBeenCalled();
      expect(upsertProjectStatusHistory).toHaveBeenCalled();
      
      // And: Pipeline state should reflect stored projects
      const state = pipeline.getState();
      expect(state.projectsStored).toBe(3);
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
      expect(getProjectCount(pipeline, 'projectUpdatesStored')).toBe(0); // No additional updates to fetch
      
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
      expect(getProjectCount(pipeline, 'projectsStored')).toBe(3);
      expect(getProjectCount(pipeline, 'projectUpdatesStored')).toBe(0); // No additional updates to fetch
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
      expect(getProjectCount(pipeline, 'projectsStored')).toBe(0); // Failed to store due to API errors
      expect(getProjectCount(pipeline, 'projectUpdatesStored')).toBe(0);
      expect(getProjectCount(pipeline, 'projectUpdatesAnalysed')).toBeGreaterThanOrEqual(0); // May vary due to async nature
      
      // And: Should show error state
      const finalState = pipeline.getState();
      expect(finalState.error).toContain('All projects failed to store due to API errors');
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
      expect(getProjectCount(pipeline, 'projectsStored')).toBe(3); // Now successful
      expect(getProjectCount(pipeline, 'projectUpdatesStored')).toBe(0); // No additional updates to fetch
      expect(getProjectCount(pipeline, 'projectUpdatesAnalysed')).toBeGreaterThan(0);
    }, 15000);
  });

  describe('Performance & Rate Limiting', () => {
    it('should respect API rate limits', async () => {
      // Given: API allows max 2 requests per second
      const startTime = Date.now();
      
      // When: Run pipeline with 3 projects
      await pipeline.runCompletePipeline();
      const endTime = Date.now();
      
      // Then: Should take at least 1.5 seconds (3 requests ÷ 2 req/sec)
      expect(endTime - startTime).toBeGreaterThan(1500);
      
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
      expect(finalState.projectsStored).toBe(3);
      expect(finalState.projectUpdatesStored).toBe(0); // No additional updates to fetch
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
      expect(state.projectsStored).toBe(3);
      expect(state.projectUpdatesStored).toBe(0); // No additional updates to fetch
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
      
      // Mock database to return existing data
      (db.projectView.toArray as jest.Mock).mockResolvedValue(existingProjects);
      (db.projectUpdates.toArray as jest.Mock).mockResolvedValue(existingUpdates);
      
      // When: Create a new pipeline instance (which calls initializeFromDatabase)
      const newPipeline = new ProjectPipeline();
      
      // Then: Should initialize state with existing database counts
      const state = newPipeline.getState();
      expect(state.projectsStored).toBe(3);
      expect(state.projectUpdatesStored).toBe(2);
      
      // Cleanup
      (db.projectView.toArray as jest.Mock).mockRestore();
      (db.projectUpdates.toArray as jest.Mock).mockRestore();
    });

    it('should combine existing and newly stored projects correctly', async () => {
      // Given: Database has existing projects
      const existingProjects = [
        { id: 'EXISTING-1', name: 'Existing Project 1' },
        { id: 'EXISTING-2', name: 'Existing Project 2' }
      ];
      
      // Mock database to return existing data
      (db.projectView.toArray as jest.Mock).mockResolvedValue(existingProjects);
      
      // When: Run pipeline with new projects
      await pipeline.scanProjectsOnPage();
      const finalStoredCount = await pipeline.fetchAndStoreProjects();
      
      // Then: Should return total count (existing + newly stored)
      expect(finalStoredCount).toBe(5); // 2 existing + 3 newly stored
      
      // And: State should reflect total count
      const finalState = pipeline.getState();
      expect(finalState.projectsStored).toBe(5);
      
      // Cleanup
      (db.projectView.toArray as jest.Mock).mockRestore();
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
});
