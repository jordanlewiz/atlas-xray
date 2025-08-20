import { VersionChecker } from './versionChecker';

// Mock chrome global
const mockGetManifest = jest.fn(() => ({ version: '0.1.0' }));
const mockStorageGet = jest.fn();
const mockStorageSet = jest.fn();

global.chrome = {
  runtime: {
    getManifest: mockGetManifest
  },
  storage: {
    local: {
      get: mockStorageGet,
      set: mockStorageSet
    }
  }
} as any;

// Mock fetch
global.fetch = jest.fn();

describe('VersionChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console warnings during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.warn after each test
    jest.restoreAllMocks();
  });

  describe('isLocalDevVersion', () => {
    it('should return true for version 0.0.0', () => {
      mockGetManifest.mockReturnValue({ version: '0.0.0' });
      expect(VersionChecker.isLocalDevVersion()).toBe(true);
    });

    it('should return false for version 0.1.0', () => {
      mockGetManifest.mockReturnValue({ version: '0.1.0' });
      expect(VersionChecker.isLocalDevVersion()).toBe(false);
    });

    it('should return false for version 1.0.0', () => {
      mockGetManifest.mockReturnValue({ version: '1.0.0' });
      expect(VersionChecker.isLocalDevVersion()).toBe(false);
    });
  });

  describe('getVersionType', () => {
    it('should return "Local Development Build" for version 0.0.0', () => {
      mockGetManifest.mockReturnValue({ version: '0.0.0' });
      expect(VersionChecker.getVersionType()).toBe('Local Development Build');
    });

    it('should return "Release Version" for version 0.1.0', () => {
      mockGetManifest.mockReturnValue({ version: '0.1.0' });
      expect(VersionChecker.getVersionType()).toBe('Release Version');
    });
  });

  describe('isNewerVersion', () => {
    it('should return true when latest version is newer', () => {
      expect(VersionChecker.isNewerVersion('1.0.0', '0.1.0')).toBe(true);
      expect(VersionChecker.isNewerVersion('0.2.0', '0.1.0')).toBe(true);
      expect(VersionChecker.isNewerVersion('0.1.1', '0.1.0')).toBe(true);
    });

    it('should return false when latest version is older or same', () => {
      expect(VersionChecker.isNewerVersion('0.1.0', '1.0.0')).toBe(false);
      expect(VersionChecker.isNewerVersion('0.1.0', '0.2.0')).toBe(false);
      expect(VersionChecker.isNewerVersion('0.1.0', '0.1.0')).toBe(false);
    });

    it('should handle different version formats', () => {
      expect(VersionChecker.isNewerVersion('1.0.0', '0.9.9')).toBe(true);
      expect(VersionChecker.isNewerVersion('0.1.0', '0.0.9')).toBe(true);
      expect(VersionChecker.isNewerVersion('0.0.1', '0.0.0')).toBe(true);
    });
  });

  describe('getLatestVersionInfo', () => {
    it('should return latest version info when API call succeeds', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          tag_name: 'v1.0.0',
          html_url: 'https://github.com/test/releases/v1.0.0'
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await VersionChecker.getLatestVersionInfo();
      
      expect(result).toEqual({
        hasUpdate: true,
        latestVersion: 'v1.0.0',
        releaseUrl: 'https://github.com/test/releases/v1.0.0'
      });
      expect(fetch).toHaveBeenCalledWith('https://api.github.com/repos/jordanlewiz/atlas-xray/releases/latest');
    });

    it('should return hasUpdate false when current version is newer', async () => {
      mockGetManifest.mockReturnValue({ version: '2.0.0' });
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          tag_name: 'v1.0.0',
          html_url: 'https://github.com/test/releases/v1.0.0'
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await VersionChecker.getLatestVersionInfo();
      
      expect(result).toEqual({
        hasUpdate: false,
        latestVersion: 'v1.0.0'
      });
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await VersionChecker.getLatestVersionInfo();
      
      expect(result).toEqual({ hasUpdate: false });
    });

    it('should handle non-ok responses', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await VersionChecker.getLatestVersionInfo();
      
      expect(result).toEqual({ hasUpdate: false });
    });
  });

  describe('checkForUpdates', () => {
    it('should respect rate limiting', async () => {
      const mockStorage = { 'lastVersionCheck': Date.now() };
      mockStorageGet.mockResolvedValue(mockStorage);

      const result = await VersionChecker.checkForUpdates();
      
      expect(result).toEqual({ hasUpdate: false });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should check for updates when rate limit is not exceeded', async () => {
      const mockStorage = { 'lastVersionCheck': Date.now() - (25 * 60 * 60 * 1000) }; // 25 hours ago
      mockStorageGet.mockResolvedValue(mockStorage);
      
      // Set current version to 0.1.0 for this test
      mockGetManifest.mockReturnValue({ version: '0.1.0' });
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          tag_name: 'v1.0.0',
          html_url: 'https://github.com/test/releases/v1.0.0'
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await VersionChecker.checkForUpdates();
      
      expect(result).toEqual({
        hasUpdate: true,
        latestVersion: 'v1.0.0',
        releaseUrl: 'https://github.com/test/releases/v1.0.0'
      });
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('Storage operations', () => {
    it('should get last check time from storage', async () => {
      const mockStorage = { 'lastVersionCheck': 123456789 };
      mockStorageGet.mockResolvedValue(mockStorage);

      const result = await VersionChecker['getLastCheckTime']();
      
      expect(result).toBe(123456789);
      expect(mockStorageGet).toHaveBeenCalledWith('lastVersionCheck');
    });

    it('should set last check time in storage', async () => {
      const timestamp = Date.now();
      await VersionChecker['setLastCheckTime'](timestamp);
      
      expect(mockStorageSet).toHaveBeenCalledWith({ 'lastVersionCheck': timestamp });
    });

    it('should handle storage errors gracefully', async () => {
      mockStorageGet.mockRejectedValue(new Error('Storage error'));
      mockStorageSet.mockRejectedValue(new Error('Storage error'));

      const getResult = await VersionChecker['getLastCheckTime']();
      expect(getResult).toBe(0);

      await expect(VersionChecker['setLastCheckTime'](123)).resolves.not.toThrow();
    });
  });
});
