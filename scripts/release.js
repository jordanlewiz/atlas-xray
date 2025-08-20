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

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function getNextVersion(type) {
  const currentVersion = getCurrentVersion();
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return currentVersion;
  }
}

function createReleaseNotes(version, type) {
  const date = new Date().toISOString().split('T')[0];
  const nextVersion = getNextVersion(type);
  
  return `## Release ${nextVersion} (${date})

### What's New
- 🚀 Automated release process
- 🔧 GitHub Actions workflow integration
- 📦 Chrome extension build automation

### Changes
- Version bump from ${version} to ${nextVersion}
- Automated build and release process

### Installation
Download the \`chrome-extension.zip\` file from this release and load it as an unpacked extension in Chrome.

### Build Info
- Built with GitHub Actions
- TypeScript compilation
- esbuild bundling
- Automated testing`;
}

async function main() {
  const args = process.argv.slice(2);
  const releaseType = args[0];
  
  if (!releaseType || !['patch', 'minor', 'major'].includes(releaseType)) {
    log('❌ Invalid release type. Use: patch, minor, or major', 'red');
    log('Usage: npm run release:patch|minor|major', 'yellow');
    process.exit(1);
  }
  
  const currentVersion = getCurrentVersion();
  const nextVersion = getNextVersion(releaseType);
  
  log(`🚀 Starting release process...`, 'cyan');
  log(`📦 Current version: ${currentVersion}`, 'blue');
  log(`🎯 Target version: ${nextVersion}`, 'green');
  log(`📝 Release type: ${releaseType}`, 'yellow');
  
  // Step 1: Check git status
  log('\n📋 Checking git status...', 'cyan');
  exec('git status --porcelain');
  
  // Step 2: Run tests
  log('\n🧪 Running tests...', 'cyan');
  exec('npm test');
  
  // Step 3: Build the extension
  log('\n🔨 Building extension...', 'cyan');
  exec('npm run build');
  
  // Step 4: Version bump
  log('\n⬆️  Bumping version...', 'cyan');
  exec(`npm version ${releaseType} --no-git-tag-version`);
  
  // Step 4.5: Update manifest.json version
  log('\n📋 Updating manifest.json version...', 'cyan');
  const manifestPath = path.join(__dirname, '../manifest.json');
  let manifestContent = fs.readFileSync(manifestPath, 'utf8');
  manifestContent = manifestContent.replace(
    /"version": "[^"]*"/,
    `"version": "${nextVersion}"`
  );
  fs.writeFileSync(manifestPath, manifestContent);
  log(`✅ Updated manifest.json to version ${nextVersion}`, 'green');
  
  // Step 5: Create git tag
  log('\n🏷️  Creating git tag...', 'cyan');
  exec(`git tag v${nextVersion}`);
  
  // Step 6: Commit version bump
  log('\n💾 Committing version bump...', 'cyan');
  exec('git add package.json package-lock.json manifest.json');
  exec(`git commit -m "chore: bump version to ${nextVersion}"`);
  
  // Step 7: Push changes and tags
  log('\n📤 Pushing to GitHub...', 'cyan');
  exec('git push');
  exec('git push --tags');
  
  // Step 8: Create release notes
  log('\n📝 Creating release notes...', 'cyan');
  const releaseNotes = createReleaseNotes(currentVersion, releaseType);
  const releaseFile = `RELEASE_v${nextVersion}.md`;
  fs.writeFileSync(releaseFile, releaseNotes);
  
  log('\n✅ Release process completed!', 'green');
  log(`🎉 Version ${nextVersion} has been released!`, 'green');
  log('\n📋 Next steps:', 'cyan');
  log('1. GitHub Actions will automatically build the extension', 'blue');
  log('2. The workflow will create a release with chrome-extension.zip', 'blue');
  log('3. You can find the release notes in:', 'blue');
  log(`   ${releaseFile}`, 'yellow');
  log('\n🔗 Check your GitHub Actions tab to monitor the build progress!', 'cyan');
}

main().catch(error => {
  log(`❌ Release failed: ${error.message}`, 'red');
  process.exit(1);
});
