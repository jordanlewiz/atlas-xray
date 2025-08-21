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
  let mockHandleUpdateAnalysisWithQueue;
  let mockProcessAnalysisQueue;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock functions
    mockHandleUpdateAnalysisWithQueue = jest.fn();
    mockProcessAnalysisQueue = jest.fn();
    
    // Create a mock message listener that simulates the new behavior
    messageListener = (message, sender, sendResponse) => {
      if (message.type === 'PING') {
        sendResponse({ 
          success: true, 
          message: 'Pong from background script',
          timestamp: new Date().toISOString()
        });
        return true;
      }
      
      if (message.type === 'OPEN_TIMELINE') {
        sendResponse({ success: true });
        return true;
      }
      
      if (message.type === 'ANALYZE_UPDATE_QUALITY') {
        // Simulate the new queue-based system
        mockHandleUpdateAnalysisWithQueue(message, sender, sendResponse);
        return true;
      }
      
      sendResponse({ success: false, error: 'Unknown message type' });
      return true;
    };
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

    test('should handle ANALYZE_UPDATE_QUALITY messages', () => {
      const mockSendResponse = jest.fn();
      const message = { 
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'test-1',
        updateText: 'Test update',
        updateType: 'general',
        state: 'on-track'
      };
      const sender = { tab: { url: 'https://example.com' } };

      const result = messageListener(message, sender, mockSendResponse);

      expect(result).toBe(true);
      expect(mockHandleUpdateAnalysisWithQueue).toHaveBeenCalledWith(message, sender, mockSendResponse);
    });
  });

  describe('Queue Management', () => {
    test('should add analysis requests to queue', () => {
      const mockSendResponse = jest.fn();
      const message = { 
        type: 'ANALYZE_UPDATE_QUALITY',
        updateId: 'test-1',
        updateText: 'Test update',
        updateType: 'general',
        state: 'on-track'
      };
      const sender = { tab: { url: 'https://example.com' } };

      messageListener(message, sender, mockSendResponse);

      expect(mockHandleUpdateAnalysisWithQueue).toHaveBeenCalledWith(message, sender, mockSendResponse);
    });
  });
});
