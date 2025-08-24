import { 
  DatabaseService, 
  databaseService,
  db,
  analysisDB,
  initializeDatabase,
  type ProjectView,
  type ProjectUpdate,
  type StoredAnalysis
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
  let service: DatabaseService;

  beforeEach(async () => {
    service = new DatabaseService();
    await service.open();
  });

  afterEach(async () => {
    await service.clearAllData();
    await service.close();
  });

  describe('Singleton Pattern', () => {
    it('should return the global instance', () => {
      expect(databaseService).toBe(service);
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
      expect(service.projectViews).toBeDefined();
      expect(service.projectUpdates).toBeDefined();
      expect(service.meta).toBeDefined();
      expect(service.storedAnalyses).toBeDefined();
      expect(service.analysisCache).toBeDefined();
    });
  });

  describe('Project View Operations', () => {
    const mockProjectView: ProjectView = {
      projectKey: 'TEST-123',
      name: 'Test Project',
      status: 'active',
      team: 'Test Team',
      owner: 'Test Owner',
      lastUpdated: new Date().toISOString(),
      archived: false,
      createdAt: new Date().toISOString()
    };

    it('should store project view', async () => {
      await expect(service.storeProjectView(mockProjectView)).resolves.not.toThrow();
      
      const stored = await service.getProjectView('TEST-123');
      expect(stored).toBeDefined();
      expect(stored?.projectKey).toBe('TEST-123');
    });

    it('should get all project views', async () => {
      await service.storeProjectView(mockProjectView);
      
      const views = await service.getProjectViews();
      expect(views).toHaveLength(1);
      expect(views[0].projectKey).toBe('TEST-123');
    });

    it('should count project views', async () => {
      await service.storeProjectView(mockProjectView);
      
      const count = await service.countProjectViews();
      expect(count).toBe(1);
    });
  });

  describe('Project Update Operations', () => {
    const mockUpdate: ProjectUpdate = {
      uuid: 'update-123',
      projectKey: 'TEST-123',
      creationDate: new Date().toISOString(),
      state: 'active',
      missedUpdate: false,
      summary: 'Test update summary',
      details: 'Test update details'
    };

    it('should store project update', async () => {
      await expect(service.storeProjectUpdate(mockUpdate)).resolves.not.toThrow();
      
      const stored = await service.getProjectUpdatesByKey('TEST-123');
      expect(stored).toHaveLength(1);
      expect(stored[0].uuid).toBe('update-123');
    });

    it('should get updates by project key', async () => {
      await service.storeProjectUpdate(mockUpdate);
      
      const updates = await service.getProjectUpdatesByKey('TEST-123');
      expect(updates).toHaveLength(1);
      expect(updates[0].projectKey).toBe('TEST-123');
    });

    it('should count project updates', async () => {
      await service.storeProjectUpdate(mockUpdate);
      
      const count = await service.countProjectUpdates();
      expect(count).toBe(1);
    });

    it('should count analyzed updates', async () => {
      await service.storeProjectUpdate(mockUpdate);
      
      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const count = await service.countAnalyzedUpdates();
      expect(count).toBe(1);
    });

    it('should count updates with quality scores', async () => {
      await service.storeProjectUpdate(mockUpdate);
      
      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const count = await service.countUpdatesWithQuality(80);
      expect(count).toBe(1); // Should have quality score 85
    });
  });

  describe('Automatic Analysis', () => {
    const mockUpdate: ProjectUpdate = {
      uuid: 'update-456',
      projectKey: 'TEST-456',
      creationDate: new Date().toISOString(),
      state: 'active',
      missedUpdate: false,
      summary: 'This is a test update that should be analyzed automatically',
      details: 'Test details'
    };

    it('should automatically analyze updates when stored', async () => {
      await service.storeProjectUpdate(mockUpdate);
      
      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stored = await service.getProjectUpdatesByKey('TEST-456');
      expect(stored[0].analyzed).toBe(true);
      expect(stored[0].updateQuality).toBe(85);
      expect(stored[0].qualityLevel).toBe('good');
      expect(stored[0].qualitySummary).toBe('Test analysis summary');
    });

    it('should not analyze updates without summary', async () => {
      const updateWithoutSummary = { ...mockUpdate, summary: '' };
      await service.storeProjectUpdate(updateWithoutSummary);
      
      const stored = await service.getProjectUpdatesByKey('TEST-456');
      expect(stored[0].analyzed).toBeUndefined();
    });

    it('should not re-analyze already analyzed updates', async () => {
      const analyzedUpdate = { ...mockUpdate, analyzed: true };
      await service.storeProjectUpdate(analyzedUpdate);
      
      const stored = await service.getProjectUpdatesByKey('TEST-456');
      expect(stored[0].analyzed).toBe(true);
    });

    it('should store analysis results in analysis table', async () => {
      await service.storeProjectUpdate(mockUpdate);
      
      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const analysis = await service.getAnalysis('TEST-456', 'update-456');
      expect(analysis).toBeDefined();
      expect(analysis?.projectId).toBe('TEST-456');
      expect(analysis?.updateId).toBe('update-456');
    });
  });

  describe('Analysis Operations', () => {
    it('should get unanalyzed updates', async () => {
      const update1: ProjectUpdate = {
        uuid: 'update-1',
        projectKey: 'TEST-1',
        creationDate: new Date().toISOString(),
        missedUpdate: false,
        summary: 'Update 1'
      };
      
      const update2: ProjectUpdate = {
        uuid: 'update-2',
        projectKey: 'TEST-2',
        creationDate: new Date().toISOString(),
        missedUpdate: false,
        summary: 'Update 2'
      };
      
      await service.storeProjectUpdate(update1);
      await service.storeProjectUpdate(update2);
      
      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const unanalyzed = await service.getUnanalyzedUpdates();
      expect(unanalyzed).toHaveLength(0); // All should be analyzed
    });

    it('should get project analyses', async () => {
      const update: ProjectUpdate = {
        uuid: 'update-123',
        projectKey: 'TEST-123',
        creationDate: new Date().toISOString(),
        missedUpdate: false,
        summary: 'Test update'
      };
      
      await service.storeProjectUpdate(update);
      
      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const analyses = await service.getProjectAnalyses('TEST-123');
      expect(analyses).toHaveLength(1);
      expect(analyses[0].projectId).toBe('TEST-123');
    });
  });

  describe('Meta Data Operations', () => {
    it('should store and retrieve metadata', async () => {
      await service.storeMetaData('test-key', 'test-value');
      
      const value = await service.getMetaData('test-key');
      expect(value).toBe('test-value');
    });

    it('should return undefined for non-existent metadata', async () => {
      const value = await service.getMetaData('non-existent');
      expect(value).toBeUndefined();
    });
  });

  describe('Utility Operations', () => {
    it('should get database statistics', async () => {
      const stats = await service.getDatabaseStats();
      
      expect(stats).toHaveProperty('projectViews');
      expect(stats).toHaveProperty('projectUpdates');
      expect(stats).toHaveProperty('analyzedUpdates');
      expect(stats).toHaveProperty('totalAnalyses');
      expect(stats).toHaveProperty('cacheEntries');
    });

    it('should export and import data', async () => {
      const mockProjectView: ProjectView = {
        projectKey: 'TEST-123',
        name: 'Test Project',
        archived: false
      };
      
      await service.storeProjectView(mockProjectView);
      
      const exported = await service.exportData();
      expect(exported.projectViews).toHaveLength(1);
      expect(exported.projectViews[0].projectKey).toBe('TEST-123');
      
      // Clear data and re-import
      await service.clearAllData();
      await service.importData(exported);
      
      const reimported = await service.getProjectViews();
      expect(reimported).toHaveLength(1);
      expect(reimported[0].projectKey).toBe('TEST-123');
    });

    it('should clear all data', async () => {
      const mockProjectView: ProjectView = {
        projectKey: 'TEST-123',
        name: 'Test Project',
        archived: false
      };
      
      await service.storeProjectView(mockProjectView);
      expect(await service.countProjectViews()).toBe(1);
      
      await service.clearAllData();
      expect(await service.countProjectViews()).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis failures gracefully', async () => {
      // Mock the AnalysisService to throw an error
      const { analyzeUpdateQuality } = require('./AnalysisService');
      analyzeUpdateQuality.mockRejectedValueOnce(new Error('Analysis failed'));
      
      const mockUpdate: ProjectUpdate = {
        uuid: 'update-error',
        projectKey: 'TEST-ERROR',
        creationDate: new Date().toISOString(),
        missedUpdate: false,
        summary: 'This update will fail analysis'
      };
      
      await expect(service.storeProjectUpdate(mockUpdate)).resolves.not.toThrow();
      
      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stored = await service.getProjectUpdatesByKey('TEST-ERROR');
      expect(stored[0].analyzed).toBe(true);
      expect(stored[0].updateQuality).toBe(0);
      expect(stored[0].qualityLevel).toBe('poor');
      expect(stored[0].qualitySummary).toBe('Analysis failed');
    });
  });

  describe('Cache Management', () => {
    it('should clear expired cache entries', async () => {
      // Add a cache entry
      await service.analysisCache.add({
        id: 'test-cache',
        analysis: { test: 'data' },
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
      });
      
      expect(await service.analysisCache.count()).toBe(1);
      
      await service.clearExpiredCache();
      
      expect(await service.analysisCache.count()).toBe(0);
    });
  });
});
