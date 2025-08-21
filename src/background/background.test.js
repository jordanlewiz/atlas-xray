/**
 * Background Script Tests
 * 
 * Tests for the Chrome extension background service worker
 * focusing on update quality analysis functionality.
 */

// Mock Chrome APIs
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    onStartup: {
      addListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    },
    getManifest: jest.fn(() => ({ version: '0.1.2' })),
    sendMessage: jest.fn()
  },
  storage: {
    local: {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({})
    }
  },
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn()
    },
    get: jest.fn()
  },
  action: {
    onClicked: {
      addListener: jest.fn()
    }
  },
  notifications: {
    clear: jest.fn()
  }
};

// Mock VersionChecker
jest.mock('../utils/versionChecker', () => ({
  VersionChecker: {
    checkForUpdates: jest.fn().mockResolvedValue({ hasUpdate: false }),
    showUpdateNotification: jest.fn(),
    cleanupNotification: jest.fn()
  }
}));

describe('Background Script Analysis', () => {
  let messageListener;
  let handleUpdateAnalysis;
  let performRuleBasedAnalysis;
  let storeAnalysisResult;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Import the background script functions
    // Since it's a service worker script, we need to evaluate it in context
    const backgroundScript = require('./background.js');
    
    // Extract the message listener that was registered
    const addListenerCalls = chrome.runtime.onMessage.addListener.mock.calls;
    if (addListenerCalls.length > 0) {
      messageListener = addListenerCalls[0][0];
    }
  });

  describe('Message Handling', () => {
    test('should handle PING messages', () => {
      const mockSendResponse = jest.fn();
      const message = { type: 'PING' };
      const sender = { tab: { url: 'https://example.com' } };

      const result = messageListener(message, sender, mockSendResponse);

      expect(result).toBe(true);
      expect(mockSendResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Pong from background script',
        timestamp: expect.any(String)
      });
    });

    test('should handle OPEN_TIMELINE messages', () => {
      const mockSendResponse = jest.fn();
      const message = { type: 'OPEN_TIMELINE' };
      const sender = { tab: { url: 'https://example.com' } };

      const result = messageListener(message, sender, mockSendResponse);

      expect(result).toBe(true);
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    test('should handle unknown message types', () => {
      const mockSendResponse = jest.fn();
      const message = { type: 'UNKNOWN_TYPE' };
      const sender = { tab: { url: 'https://example.com' } };

      const result = messageListener(message, sender, mockSendResponse);

      expect(result).toBe(true);
      expect(mockSendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Unknown message type'
      });
    });

    test('should handle ANALYZE_UPDATE_QUALITY messages', () => {
      const mockSendResponse = jest.fn();
      const message = {
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'test-update-1',
        updateText: 'This project is paused due to resource constraints',
        updateType: 'paused',
        state: 'paused'
      };
      const sender = { tab: { url: 'https://example.com' } };

      const result = messageListener(message, sender, mockSendResponse);

      expect(result).toBe(true);
      // The actual analysis is async, so we just verify the message was accepted
    });
  });

  describe('Rule-Based Analysis', () => {
    // Since the functions are not exported, we'll test through message handling
    // This is an integration test approach for the service worker context

    test('should analyze paused project updates', async () => {
      const mockSendResponse = jest.fn();
      const message = {
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'paused-update-1',
        updateText: 'This project is paused due to resource constraints. We will resume when the team is available. The impact is minimal as this is not a critical path item.',
        updateType: 'paused',
        state: 'paused'
      };
      const sender = { tab: { url: 'https://example.com' } };

      messageListener(message, sender, mockSendResponse);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(chrome.storage.local.set).toHaveBeenCalled();
      const setCall = chrome.storage.local.set.mock.calls[0];
      const [storageData] = setCall;
      const qualityKey = `quality:${message.updateId}`;
      
      expect(storageData).toHaveProperty(qualityKey);
      const result = storageData[qualityKey];
      
      expect(result).toMatchObject({
        updateId: message.updateId,
        overallScore: expect.any(Number),
        qualityLevel: expect.any(String),
        confidence: 0.8,
        reasoning: expect.any(String),
        timestamp: expect.any(String),
        analysis: expect.any(Array),
        missingInfo: expect.any(Array),
        recommendations: expect.any(Array),
        summary: expect.any(String)
      });

      expect(result.overallScore).toBeGreaterThan(50); // Should score well with comprehensive text
      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.qualityLevel);
    });

    test('should analyze off-track project updates', async () => {
      const mockSendResponse = jest.fn();
      const message = {
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'off-track-update-1',
        updateText: 'This project is off-track because of technical challenges. We are taking steps to resolve the issues and get back on schedule.',
        updateType: 'off-track',
        state: 'off-track'
      };
      const sender = { tab: { url: 'https://example.com' } };

      messageListener(message, sender, mockSendResponse);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(chrome.storage.local.set).toHaveBeenCalled();
      const setCall = chrome.storage.local.set.mock.calls[0];
      const [storageData] = setCall;
      const qualityKey = `quality:${message.updateId}`;
      const result = storageData[qualityKey];
      
      expect(result.analysis[0].criteriaId).toBe('off-track');
      expect(result.overallScore).toBeGreaterThan(40); // Should have decent score
    });

    test('should analyze at-risk project updates', async () => {
      const mockSendResponse = jest.fn();
      const message = {
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'at-risk-update-1',
        updateText: 'Project is at-risk due to budget constraints. We have a mitigation plan in place.',
        updateType: 'at-risk',
        state: 'at-risk'
      };
      const sender = { tab: { url: 'https://example.com' } };

      messageListener(message, sender, mockSendResponse);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(chrome.storage.local.set).toHaveBeenCalled();
      const setCall = chrome.storage.local.set.mock.calls[0];
      const [storageData] = setCall;
      const qualityKey = `quality:${message.updateId}`;
      const result = storageData[qualityKey];
      
      expect(result.analysis[0].criteriaId).toBe('at-risk');
    });

    test('should analyze prioritization updates', async () => {
      const mockSendResponse = jest.fn();
      const message = {
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'prioritization-update-1',
        updateText: 'New initiative prioritised because of high impact on customer satisfaction. Decision made by leadership team.',
        updateType: 'prioritization',
        state: 'in-progress'
      };
      const sender = { tab: { url: 'https://example.com' } };

      messageListener(message, sender, mockSendResponse);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(chrome.storage.local.set).toHaveBeenCalled();
      const setCall = chrome.storage.local.set.mock.calls[0];
      const [storageData] = setCall;
      const qualityKey = `quality:${message.updateId}`;
      const result = storageData[qualityKey];
      
      expect(result.analysis[0].criteriaId).toBe('prioritization');
      expect(result.overallScore).toBeGreaterThan(60); // Should score well with impact and decision info
    });

    test('should handle short updates with lower scores', async () => {
      const mockSendResponse = jest.fn();
      const message = {
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'short-update-1',
        updateText: 'Paused.',
        updateType: 'paused',
        state: 'paused'
      };
      const sender = { tab: { url: 'https://example.com' } };

      messageListener(message, sender, mockSendResponse);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(chrome.storage.local.set).toHaveBeenCalled();
      const setCall = chrome.storage.local.set.mock.calls[0];
      const [storageData] = setCall;
      const qualityKey = `quality:${message.updateId}`;
      const result = storageData[qualityKey];
      
      expect(result.overallScore).toBeLessThan(60); // Should score lower due to lack of detail
      expect(result.qualityLevel).toMatch(/^(fair|poor)$/);
      expect(result.recommendations).toContain('Add more context and details');
    });

    test('should handle general updates', async () => {
      const mockSendResponse = jest.fn();
      const message = {
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'general-update-1',
        updateText: 'Project is progressing well. Team is working on the next milestone.',
        updateType: 'general',
        state: 'in-progress'
      };
      const sender = { tab: { url: 'https://example.com' } };

      messageListener(message, sender, mockSendResponse);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(chrome.storage.local.set).toHaveBeenCalled();
      const setCall = chrome.storage.local.set.mock.calls[0];
      const [storageData] = setCall;
      const qualityKey = `quality:${message.updateId}`;
      const result = storageData[qualityKey];
      
      expect(result.analysis[0].criteriaId).toBe('general');
      expect(result.overallScore).toBeGreaterThan(40); // Decent score for general update
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors gracefully', async () => {
      // Mock storage to throw an error
      chrome.storage.local.set.mockRejectedValueOnce(new Error('Storage quota exceeded'));
      
      const mockSendResponse = jest.fn();
      const message = {
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'error-update-1',
        updateText: 'Test update',
        updateType: 'general',
        state: 'in-progress'
      };
      const sender = { tab: { url: 'https://example.com' } };

      messageListener(message, sender, mockSendResponse);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should still attempt to respond even if storage fails
      expect(mockSendResponse).toHaveBeenCalled();
    });

    test('should handle analysis errors', async () => {
      const mockSendResponse = jest.fn();
      const message = {
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'error-update-2',
        updateText: null, // Invalid input
        updateType: 'general',
        state: 'in-progress'
      };
      const sender = { tab: { url: 'https://example.com' } };

      messageListener(message, sender, mockSendResponse);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSendResponse).toHaveBeenCalled();
      const response = mockSendResponse.mock.calls[0][0];
      expect(response).toHaveProperty('success');
    });
  });
});
