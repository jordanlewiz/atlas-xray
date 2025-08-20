#!/usr/bin/env node

/**
 * Version Consistency Checker Script
 * 
 * This script ensures that git tags, package.json, and manifest.json versions
 * are all consistent and match each other. It's designed to run during the build process.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VersionConsistencyChecker {
  constructor() {
    this.projectRoot = process.cwd();
    this.packageJsonPath = path.join(this.projectRoot, 'package.json');
    this.manifestPath = path.join(this.projectRoot, 'manifest.json');
    this.distManifestPath = path.join(this.projectRoot, 'dist', 'manifest.json');
  }

  /**
   * Check if all version numbers are consistent across the project
   */
  checkVersionConsistency() {
    const errors = [];
    
    try {
      // Get versions from different sources
      const packageJsonVersion = this.getPackageJsonVersion();
      const manifestVersion = this.getManifestVersion();
      const distManifestVersion = this.getDistManifestVersion();
      const gitTagVersion = this.getGitTagVersion();
      
      console.log('🔍 Checking version consistency...');
      console.log(`📦 Package.json: ${packageJsonVersion}`);
      console.log(`📋 Manifest.json: ${manifestVersion}`);
      console.log(`📁 Dist/Manifest.json: ${distManifestVersion}`);
      if (gitTagVersion) {
        console.log(`🏷️  Git tag: ${gitTagVersion}`);
      }
      console.log('');
      
      // Check consistency
      const isConsistent = this.areVersionsConsistent(
        packageJsonVersion,
        manifestVersion,
        distManifestVersion,
        gitTagVersion
      );
      
      // Generate error messages for inconsistencies
      if (packageJsonVersion !== manifestVersion) {
        errors.push(`Package.json version (${packageJsonVersion}) doesn't match manifest.json version (${manifestVersion})`);
      }
      
      if (packageJsonVersion !== distManifestVersion) {
        errors.push(`Package.json version (${packageJsonVersion}) doesn't match dist/manifest.json version (${distManifestVersion})`);
      }
      
      if (gitTagVersion && packageJsonVersion !== gitTagVersion) {
        errors.push(`Package.json version (${packageJsonVersion}) doesn't match git tag version (${gitTagVersion})`);
      }
      
      if (gitTagVersion && manifestVersion !== gitTagVersion) {
        errors.push(`Manifest.json version (${manifestVersion}) doesn't match git tag version (${gitTagVersion})`);
      }
      
      if (gitTagVersion && distManifestVersion !== gitTagVersion) {
        errors.push(`Dist/manifest.json version (${distManifestVersion}) doesn't match git tag version (${gitTagVersion})`);
      }
      
      const result = {
        packageJsonVersion,
        manifestVersion,
        distManifestVersion,
        gitTagVersion,
        isConsistent,
        errors
      };
      
      this.printResult(result);
      return result;
      
    } catch (error) {
      const errorMsg = `Failed to check version consistency: ${error.message}`;
      errors.push(errorMsg);
      console.error('❌', errorMsg);
      
      return {
        packageJsonVersion: 'unknown',
        manifestVersion: 'unknown',
        distManifestVersion: 'unknown',
        isConsistent: false,
        errors
      };
    }
  }
  
  /**
   * Get version from package.json
   */
  getPackageJsonVersion() {
    try {
      if (!fs.existsSync(this.packageJsonPath)) {
        throw new Error('package.json not found');
      }
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      return packageJson.version || 'unknown';
    } catch (error) {
      throw new Error(`Error reading package.json: ${error.message}`);
    }
  }
  
  /**
   * Get version from manifest.json
   */
  getManifestVersion() {
    try {
      if (!fs.existsSync(this.manifestPath)) {
        throw new Error('manifest.json not found');
      }
      const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
      return manifest.version || 'unknown';
    } catch (error) {
      throw new Error(`Error reading manifest.json: ${error.message}`);
    }
  }
  
  /**
   * Get version from dist/manifest.json
   */
  getDistManifestVersion() {
    try {
      if (!fs.existsSync(this.distManifestPath)) {
        return 'not built';
      }
      const manifest = JSON.parse(fs.readFileSync(this.distManifestPath, 'utf8'));
      return manifest.version || 'unknown';
    } catch (error) {
      return 'error reading';
    }
  }
  
  /**
   * Get version from git tag (if available)
   */
  getGitTagVersion() {
    try {
      // Get the current git tag if we're on a tagged commit
      const gitTag = execSync('git describe --exact-match --tags 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();
      if (gitTag && gitTag !== '') {
        // Remove the 'v' prefix if present
        return gitTag.replace(/^v/, '');
      }
      return undefined;
    } catch (error) {
      // Git tag version is optional, so we don't throw here
      return undefined;
    }
  }
  
  /**
   * Check if all versions are consistent
   */
  areVersionsConsistent(
    packageJsonVersion,
    manifestVersion,
    distManifestVersion,
    gitTagVersion
  ) {
    // All file versions must match
    if (packageJsonVersion !== manifestVersion) {
      return false;
    }
    
    if (packageJsonVersion !== distManifestVersion && distManifestVersion !== 'not built') {
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
  isValidVersionFormat(version) {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }
  
  /**
   * Get a human-readable summary of version consistency
   */
  getVersionSummary(versionInfo) {
    if (versionInfo.isConsistent) {
      return `✅ All versions are consistent: ${versionInfo.packageJsonVersion}`;
    }
    
    let summary = `❌ Version inconsistency detected:\n`;
    summary += `📦 Package.json: ${versionInfo.packageJsonVersion}\n`;
    summary += `📋 Manifest.json: ${versionInfo.manifestVersion}\n`;
    
    if (versionInfo.distManifestVersion) {
      summary += `📁 Dist/Manifest.json: ${versionInfo.distManifestVersion}\n`;
    }
    
    if (versionInfo.gitTagVersion) {
      summary += `🏷️  Git tag: ${versionInfo.gitTagVersion}\n`;
    }
    
    summary += `\n🔧 Errors:\n`;
    versionInfo.errors.forEach(error => {
      summary += `  • ${error}\n`;
    });
    
    return summary;
  }

  /**
   * Print the result in a human-readable format
   */
  printResult(result) {
    if (result.isConsistent) {
      console.log('✅ All versions are consistent!');
      console.log(`🎉 Version ${result.packageJsonVersion} is ready for release.`);
    } else {
      console.log('❌ Version inconsistency detected!');
      console.log('');
      console.log('🔧 Errors:');
      result.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
      console.log('');
      console.log('💡 To fix this:');
      console.log('  1. Ensure package.json has the correct version');
      console.log('  2. Run "npm run build:manifest" to update manifest.json');
      console.log('  3. Run "npm run build" to update dist/manifest.json');
      console.log('  4. Create git tag AFTER updating versions');
      console.log('');
      process.exit(1); // Exit with error code for CI/CD
    }
  }
}

// Run the checker if this script is executed directly
if (require.main === module) {
  const checker = new VersionConsistencyChecker();
  checker.checkVersionConsistency();
}

module.exports = VersionConsistencyChecker;
