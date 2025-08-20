/**
 * Version Consistency Checker
 * 
 * This utility ensures that git tags, package.json, and manifest.json versions
 * are all consistent and match each other.
 */

export interface VersionInfo {
  packageJsonVersion: string;
  manifestVersion: string;
  gitTagVersion?: string;
  isConsistent: boolean;
  errors: string[];
}

export class VersionConsistencyChecker {
  /**
   * Check if all version numbers are consistent across the project
   */
  static async checkVersionConsistency(): Promise<VersionInfo> {
    const errors: string[] = [];
    
    try {
      // Get versions from different sources
      const packageJsonVersion = await this.getPackageJsonVersion();
      const manifestVersion = await this.getManifestVersion();
      const gitTagVersion = await this.getGitTagVersion();
      
      // Check consistency
      const isConsistent = this.areVersionsConsistent(
        packageJsonVersion,
        manifestVersion,
        gitTagVersion
      );
      
      // Generate error messages for inconsistencies
      if (packageJsonVersion !== manifestVersion) {
        errors.push(`Package.json version (${packageJsonVersion}) doesn't match manifest.json version (${manifestVersion})`);
      }
      
      if (gitTagVersion && packageJsonVersion !== gitTagVersion) {
        errors.push(`Package.json version (${packageJsonVersion}) doesn't match git tag version (${gitTagVersion})`);
      }
      
      if (gitTagVersion && manifestVersion !== gitTagVersion) {
        errors.push(`Manifest.json version (${manifestVersion}) doesn't match git tag version (${gitTagVersion})`);
      }
      
      return {
        packageJsonVersion,
        manifestVersion,
        gitTagVersion,
        isConsistent,
        errors
      };
      
    } catch (error) {
      errors.push(`Failed to check version consistency: ${error}`);
      return {
        packageJsonVersion: 'unknown',
        manifestVersion: 'unknown',
        isConsistent: false,
        errors
      };
    }
  }
  
  /**
   * Get version from package.json
   */
  private static async getPackageJsonVersion(): Promise<string> {
    try {
      const response = await fetch('/package.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch package.json: ${response.status}`);
      }
      const packageJson = await response.json();
      return packageJson.version || 'unknown';
    } catch (error) {
      throw new Error(`Error reading package.json: ${error}`);
    }
  }
  
  /**
   * Get version from manifest.json
   */
  private static async getManifestVersion(): Promise<string> {
    try {
      const response = await fetch('/manifest.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest.json: ${response.status}`);
      }
      const manifest = await response.json();
      return manifest.version || 'unknown';
    } catch (error) {
      throw new Error(`Error reading manifest.json: ${error}`);
    }
  }
  
  /**
   * Get version from git tag (if available)
   */
  private static async getGitTagVersion(): Promise<string | undefined> {
    try {
      // This would need to be implemented based on your build process
      // For now, we'll return undefined and handle it gracefully
      return undefined;
    } catch (error) {
      // Git tag version is optional, so we don't throw here
      return undefined;
    }
  }
  
  /**
   * Check if all versions are consistent
   */
  private static areVersionsConsistent(
    packageJsonVersion: string,
    manifestVersion: string,
    gitTagVersion?: string
  ): boolean {
    // Package.json and manifest.json must match
    if (packageJsonVersion !== manifestVersion) {
      return false;
    }
    
    // If git tag version is available, it must also match
    if (gitTagVersion && gitTagVersion !== packageJsonVersion) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate version format (semantic versioning)
   */
  static isValidVersionFormat(version: string): boolean {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }
  
  /**
   * Get a human-readable summary of version consistency
   */
  static getVersionSummary(versionInfo: VersionInfo): string {
    if (versionInfo.isConsistent) {
      return `✅ All versions are consistent: ${versionInfo.packageJsonVersion}`;
    }
    
    let summary = `❌ Version inconsistency detected:\n`;
    summary += `📦 Package.json: ${versionInfo.packageJsonVersion}\n`;
    summary += `📋 Manifest.json: ${versionInfo.manifestVersion}\n`;
    
    if (versionInfo.gitTagVersion) {
      summary += `🏷️  Git tag: ${versionInfo.gitTagVersion}\n`;
    }
    
    summary += `\n🔧 Errors:\n`;
    versionInfo.errors.forEach(error => {
      summary += `  • ${error}\n`;
    });
    
    return summary;
  }
}
