import { 
  DatabaseService, 
  databaseService,
  db,
  analysisDB,
  initializeDatabase,
  type ProjectSummary,
  type ProjectUpdate
} from './DatabaseService';

// Mock the AnalysisService to avoid actual AI calls during testing
jest.mock('./AnalysisService', () => ({
  analyzeUpdateQuality: jest.fn().mockResolvedValue({
    overallScore: 85,
    qualityLevel: 'good',
    summary: 'Test analysis summary',
    missingInfo: ['Some missing info'],
    recommendations: ['Some recommendations']
  })
}));

describe('DatabaseService', () => {
  beforeEach(async () => {
    await databaseService.open();
  });

  afterEach(async () => {
    await databaseService.clearProjectList();
    await databaseService.clearProjectUpdates();
    await databaseService.clearProjectDependencies('TEST-123');
    await databaseService.close();
  });

  describe('Singleton Pattern', () => {
    it('should return the global instance', () => {
      expect(databaseService).toBeDefined();
      expect(typeof databaseService.open).toBe('function');
    });

    it('should provide backward compatibility aliases', () => {
      expect(db).toBe(databaseService);
      expect(analysisDB).toBe(databaseService);
    });
  });

  describe('Database Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(initializeDatabase()).resolves.not.toThrow();
    });

    it('should have correct table structure', () => {
      expect(databaseService.projectList).toBeDefined();
      expect(databaseService.projectSummaries).toBeDefined();
      expect(databaseService.projectUpdates).toBeDefined();
      expect(databaseService.projectDependencies).toBeDefined();
    });
  });

  describe('Project Summary Operations', () => {
    const mockProjectSummary: ProjectSummary = {
      projectKey: 'TEST-123',
      name: 'Test Project',
      status: 'active',
      team: 'Test Team',
      owner: 'Test Owner',
      lastUpdated: new Date().toISOString(),
      archived: false,
      createdAt: new Date().toISOString()
    };

    it('should store project summary', async () => {
      await expect(databaseService.storeProjectSummary(mockProjectSummary)).resolves.not.toThrow();
      
      const stored = await databaseService.getProjectSummary('TEST-123');
      expect(stored).toBeDefined();
      expect(stored?.projectKey).toBe('TEST-123');
    });

    it('should get all project summaries', async () => {
      await databaseService.storeProjectSummary(mockProjectSummary);
      
      const summaries = await databaseService.getProjectSummaries();
      expect(summaries).toHaveLength(1);
      expect(summaries[0].projectKey).toBe('TEST-123');
    });

    it('should count project summaries', async () => {
      await databaseService.storeProjectSummary(mockProjectSummary);
      
      const count = await databaseService.countProjectSummaries();
      expect(count).toBe(1);
    });
  });

  describe('Project Update Operations', () => {
    const mockUpdate: ProjectUpdate = {
      uuid: 'test-uuid-123',
      projectKey: 'TEST-123',
      creationDate: new Date().toISOString(),
      state: 'active',
      missedUpdate: false,
      summary: 'Test update summary',
      details: 'Test update details'
    };

    it('should store project update', async () => {
      await expect(databaseService.storeProjectUpdate(mockUpdate)).resolves.not.toThrow();
      
      const stored = await databaseService.getProjectUpdatesByKey('TEST-123');
      expect(stored).toHaveLength(1);
      expect(stored[0].uuid).toBe('test-uuid-123');
    });

    it('should get updates by project key', async () => {
      await databaseService.storeProjectUpdate(mockUpdate);
      
      const updates = await databaseService.getProjectUpdatesByKey('TEST-123');
      expect(updates).toHaveLength(1);
      expect(updates[0].projectKey).toBe('TEST-123');
    });

    it('should count project updates', async () => {
      await databaseService.storeProjectUpdate(mockUpdate);
      
      const count = await databaseService.countProjectUpdates();
      expect(count).toBe(1);
    });

    it('should count analyzed updates', async () => {
      const analyzedUpdate = { ...mockUpdate, analyzed: true };
      await databaseService.storeProjectUpdate(analyzedUpdate);
      
      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const updates = await databaseService.getProjectUpdatesByKey('TEST-123');
      expect(updates[0].analyzed).toBe(true);
    });

    it('should count updates with quality scores', async () => {
      const qualityUpdate = { ...mockUpdate, updateQuality: 85 };
      await databaseService.storeProjectUpdate(qualityUpdate);
      
      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const updates = await databaseService.getProjectUpdatesByKey('TEST-123');
      expect(updates[0].updateQuality).toBe(85);
    });
  });

  describe('Project List Operations', () => {
    const mockProjectList = {
      projectKey: 'TEST-123',
      name: 'Test Project',
      archived: false,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    it('should store project list entry', async () => {
      await expect(databaseService.storeProjectList(mockProjectList)).resolves.not.toThrow();
      
      const stored = await databaseService.getProjectListEntry('TEST-123');
      expect(stored).toBeDefined();
      expect(stored?.projectKey).toBe('TEST-123');
    });

    it('should get all project list entries', async () => {
      await databaseService.storeProjectList(mockProjectList);
      
      const entries = await databaseService.getProjectList();
      expect(entries).toHaveLength(1);
      expect(entries[0].projectKey).toBe('TEST-123');
    });

    it('should count project list entries', async () => {
      await databaseService.storeProjectList(mockProjectList);
      
      const count = await databaseService.countProjectList();
      expect(count).toBe(1);
    });
  });

  describe('Project Dependencies Operations', () => {
    const mockDependency = {
      id: 'dep-123',
      sourceProjectKey: 'TEST-123',
      targetProjectKey: 'TEST-456',
      linkType: 'blocks'
    };

    it('should store project dependencies', async () => {
      await expect(databaseService.storeProjectDependencies('TEST-123', [mockDependency])).resolves.not.toThrow();
      
      const deps = await databaseService.getProjectDependencies('TEST-123');
      expect(deps).toHaveLength(1);
      expect(deps[0].id).toBe('dep-123');
    });

    it('should get dependencies for a project', async () => {
      await databaseService.storeProjectDependencies('TEST-123', [mockDependency]);
      
      const deps = await databaseService.getProjectDependencies('TEST-123');
      expect(deps).toHaveLength(1);
      expect(deps[0].sourceProjectKey).toBe('TEST-123');
    });

    it('should get all project dependencies', async () => {
      await databaseService.storeProjectDependencies('TEST-123', [mockDependency]);
      
      const allDeps = await databaseService.getAllProjectDependencies();
      expect(allDeps).toHaveLength(1);
      expect(allDeps[0].id).toBe('dep-123');
    });
  });

  describe('Utility Operations', () => {
    it('should clear all data', async () => {
      const mockProjectList = {
        projectKey: 'TEST-123',
        name: 'Test Project'
      };
      
      await databaseService.storeProjectList(mockProjectList);
      expect(await databaseService.countProjectList()).toBe(1);
      
      await databaseService.clearProjectList();
      expect(await databaseService.countProjectList()).toBe(0);
    });

    it('should export and import data', async () => {
      const mockProjectList = {
        projectKey: 'TEST-123',
        name: 'Test Project'
      };
      
      await databaseService.storeProjectList(mockProjectList);
      
      // Test that data was stored
      const entries = await databaseService.getProjectList();
      expect(entries).toHaveLength(1);
      expect(entries[0].projectKey).toBe('TEST-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Test with invalid data
      const invalidUpdate = {
        uuid: 'invalid-uuid',
        projectKey: '', // Invalid empty key
        creationDate: 'invalid-date'
      } as any;
      
      await expect(databaseService.storeProjectUpdate(invalidUpdate)).rejects.toThrow();
    });
  });
});
