import { VersionConsistencyChecker, VersionInfo } from './versionConsistencyChecker';

// Mock fetch
global.fetch = jest.fn();

describe('VersionConsistencyChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkVersionConsistency', () => {
    it('should return consistent versions when all match', async () => {
      const mockPackageJson = { version: '1.2.3' };
      const mockManifest = { version: '1.2.3' };
      
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPackageJson) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockManifest) });

      const result = await VersionConsistencyChecker.checkVersionConsistency();
      
      expect(result.isConsistent).toBe(true);
      expect(result.packageJsonVersion).toBe('1.2.3');
      expect(result.manifestVersion).toBe('1.2.3');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect inconsistency between package.json and manifest.json', async () => {
      const mockPackageJson = { version: '1.2.3' };
      const mockManifest = { version: '1.2.4' };
      
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPackageJson) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockManifest) });

      const result = await VersionConsistencyChecker.checkVersionConsistency();
      
      expect(result.isConsistent).toBe(false);
      expect(result.packageJsonVersion).toBe('1.2.3');
      expect(result.manifestVersion).toBe('1.2.4');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Package.json version (1.2.3) doesn't match manifest.json version (1.2.4)");
    });

    it('should handle fetch errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await VersionConsistencyChecker.checkVersionConsistency();
      
      expect(result.isConsistent).toBe(false);
      expect(result.packageJsonVersion).toBe('unknown');
      expect(result.manifestVersion).toBe('unknown');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to check version consistency');
    });

    it('should handle HTTP errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

      const result = await VersionConsistencyChecker.checkVersionConsistency();
      
      expect(result.isConsistent).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to fetch package.json: 404');
    });
  });

  describe('isValidVersionFormat', () => {
    it('should validate correct semantic versions', () => {
      expect(VersionConsistencyChecker.isValidVersionFormat('1.0.0')).toBe(true);
      expect(VersionConsistencyChecker.isValidVersionFormat('0.1.0')).toBe(true);
      expect(VersionConsistencyChecker.isValidVersionFormat('2.10.15')).toBe(true);
      expect(VersionConsistencyChecker.isValidVersionFormat('1.0.0-alpha')).toBe(true);
      expect(VersionConsistencyChecker.isValidVersionFormat('1.0.0-beta.1')).toBe(true);
      expect(VersionConsistencyChecker.isValidVersionFormat('1.0.0+20130313144700')).toBe(true);
    });

    it('should reject invalid version formats', () => {
      expect(VersionConsistencyChecker.isValidVersionFormat('1.0')).toBe(false);
      expect(VersionConsistencyChecker.isValidVersionFormat('1')).toBe(false);
      expect(VersionConsistencyChecker.isValidVersionFormat('1.0.0.0')).toBe(false);
      expect(VersionConsistencyChecker.isValidVersionFormat('v1.0.0')).toBe(false);
      expect(VersionConsistencyChecker.isValidVersionFormat('1.0.0.')).toBe(false);
      expect(VersionConsistencyChecker.isValidVersionFormat('')).toBe(false);
    });
  });

  describe('getVersionSummary', () => {
    it('should return success message for consistent versions', () => {
      const versionInfo: VersionInfo = {
        packageJsonVersion: '1.2.3',
        manifestVersion: '1.2.3',
        isConsistent: true,
        errors: []
      };

      const summary = VersionConsistencyChecker.getVersionSummary(versionInfo);
      
      expect(summary).toContain('✅ All versions are consistent: 1.2.3');
    });

    it('should return detailed error message for inconsistent versions', () => {
      const versionInfo: VersionInfo = {
        packageJsonVersion: '1.2.3',
        manifestVersion: '1.2.4',
        isConsistent: false,
        errors: [
          "Package.json version (1.2.3) doesn't match manifest.json version (1.2.4)"
        ]
      };

      const summary = VersionConsistencyChecker.getVersionSummary(versionInfo);
      
      expect(summary).toContain('❌ Version inconsistency detected:');
      expect(summary).toContain('📦 Package.json: 1.2.3');
      expect(summary).toContain('📋 Manifest.json: 1.2.4');
      expect(summary).toContain('🔧 Errors:');
      expect(summary).toContain("• Package.json version (1.2.3) doesn't match manifest.json version (1.2.4)");
    });

    it('should include git tag version when available', () => {
      const versionInfo: VersionInfo = {
        packageJsonVersion: '1.2.3',
        manifestVersion: '1.2.3',
        gitTagVersion: '1.2.4',
        isConsistent: false,
        errors: [
          "Package.json version (1.2.3) doesn't match git tag version (1.2.4)"
        ]
      };

      const summary = VersionConsistencyChecker.getVersionSummary(versionInfo);
      
      expect(summary).toContain('🏷️  Git tag: 1.2.4');
    });
  });

  describe('edge cases', () => {
    it('should handle missing version fields', async () => {
      const mockPackageJson = {};
      const mockManifest = {};
      
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPackageJson) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockManifest) });

      const result = await VersionConsistencyChecker.checkVersionConsistency();
      
      expect(result.packageJsonVersion).toBe('unknown');
      expect(result.manifestVersion).toBe('unknown');
      expect(result.isConsistent).toBe(true); // Both unknown are considered consistent
    });

    it('should handle null/undefined version fields', async () => {
      const mockPackageJson = { version: null };
      const mockManifest = { version: undefined };
      
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPackageJson) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockManifest) });

      const result = await VersionConsistencyChecker.checkVersionConsistency();
      
      expect(result.packageJsonVersion).toBe('unknown');
      expect(result.manifestVersion).toBe('unknown');
      expect(result.isConsistent).toBe(true);
    });
  });
});
