#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
  } catch (error) {
    log(`❌ Command failed: ${command}`, 'red');
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const releaseType = args[0];
  
  if (!releaseType || !['patch', 'minor', 'major'].includes(releaseType)) {
    log('❌ Invalid release type. Use: patch, minor, or major', 'red');
    log('Usage: npm run release:patch|minor|major', 'yellow');
    process.exit(1);
  }
  
  log(`🚀 Starting GitHub Actions-based release process...`, 'cyan');
  log(`📝 Release type: ${releaseType}`, 'yellow');
  log(`🌐 This will trigger the GitHub Actions workflow`, 'blue');
  
  // Check if GitHub CLI is installed
  try {
    exec('gh --version', { stdio: 'pipe' });
  } catch (error) {
    log('❌ GitHub CLI (gh) is not installed or not accessible', 'red');
    log('📋 Please install GitHub CLI first:', 'yellow');
    log('   macOS: brew install gh', 'blue');
    log('   Windows: winget install GitHub.cli', 'blue');
    log('   Linux: See https://github.com/cli/cli#installation', 'blue');
    process.exit(1);
  }
  
  // Check if user is authenticated with GitHub
  try {
    exec('gh auth status', { stdio: 'pipe' });
  } catch (error) {
    log('❌ Not authenticated with GitHub CLI', 'red');
    log('📋 Please run: gh auth login', 'yellow');
    process.exit(1);
  }
  
  // Check git status
  log('\n📋 Checking git status...', 'cyan');
  exec('git status --porcelain');
  
  // Check if we're on main branch
  const currentBranch = exec('git branch --show-current', { stdio: 'pipe' }).trim();
  if (currentBranch !== 'main') {
    log(`❌ You must be on the main branch to release. Current branch: ${currentBranch}`, 'red');
    log('📋 Please checkout main: git checkout main', 'yellow');
    process.exit(1);
  }
  
  // Check if main is up to date
  log('\n📋 Checking if main is up to date...', 'cyan');
  exec('git fetch origin');
  const localCommit = exec('git rev-parse HEAD', { stdio: 'pipe' }).trim();
  const remoteCommit = exec('git rev-parse origin/main', { stdio: 'pipe' }).trim();
  
  if (localCommit !== remoteCommit) {
    log('❌ Local main is not up to date with remote', 'red');
    log('📋 Please pull latest changes: git pull origin main', 'yellow');
    process.exit(1);
  }
  
  // Trigger GitHub Actions workflow
  log('\n🚀 Triggering GitHub Actions workflow...', 'cyan');
  log(`📝 This will create a ${releaseType} release`, 'yellow');
  
  try {
    exec(`gh workflow run version-and-release.yml --field version-type=${releaseType}`);
    log('✅ GitHub Actions workflow triggered successfully!', 'green');
  } catch (error) {
    log('❌ Failed to trigger workflow', 'red');
    log('📋 Please check the error above and try again', 'yellow');
    process.exit(1);
  }
  
  log('\n📋 Next steps:', 'cyan');
  log('1. Go to your GitHub repository → Actions tab', 'blue');
  log('2. Look for the "Version and Release" workflow', 'blue');
  log('3. Monitor the progress of the release', 'blue');
  log('4. The workflow will automatically:', 'blue');
  log('   • Bump version numbers', 'blue');
  log('   • Build the extension', 'blue');
  log('   • Run tests', 'blue');
  log('   • Create git tag', 'blue');
  log('   • Create GitHub release', 'blue');
  log('   • Push changes back to main', 'blue');
  
  log('\n🔗 GitHub Actions URL:', 'cyan');
  log(`   https://github.com/jordanlewiz/atlas-xray/actions`, 'blue');
  
  log('\n🎉 Release process initiated! Check GitHub Actions for progress.', 'green');
}

main().catch(error => {
  log(`❌ Release failed: ${error.message}`, 'red');
  process.exit(1);
});
