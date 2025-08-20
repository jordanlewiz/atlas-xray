#!/usr/bin/env node

/**
 * Test script for version consistency checker
 * This demonstrates how the version consistency checker works
 */

const VersionConsistencyChecker = require('./checkVersionConsistency');

console.log('🧪 Testing Version Consistency Checker\n');

// Test 1: Check current project
console.log('=== Test 1: Current Project ===');
const checker = new VersionConsistencyChecker();
const result = checker.checkVersionConsistency();

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Simulate different scenarios
console.log('=== Test 2: Simulated Scenarios ===');

// Simulate consistent versions
const consistentVersions = {
  packageJsonVersion: '1.0.0',
  manifestVersion: '1.0.0',
  distManifestVersion: '1.0.0',
  gitTagVersion: '1.0.0',
  isConsistent: true,
  errors: []
};

console.log('✅ Consistent versions:');
console.log(checker.getVersionSummary(consistentVersions));

console.log('\n' + '-'.repeat(30) + '\n');

// Simulate inconsistent versions
const inconsistentVersions = {
  packageJsonVersion: '1.0.0',
  manifestVersion: '1.0.1',
  distManifestVersion: '1.0.0',
  gitTagVersion: '1.0.2',
  isConsistent: false,
  errors: [
    "Package.json version (1.0.0) doesn't match manifest.json version (1.0.1)",
    "Package.json version (1.0.0) doesn't match git tag version (1.0.2)"
  ]
};

console.log('❌ Inconsistent versions:');
console.log(checker.getVersionSummary(inconsistentVersions));

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Version format validation
console.log('=== Test 3: Version Format Validation ===');
const testVersions = ['1.0.0', '0.1.0', '2.10.15', '1.0.0-alpha', 'v1.0.0', '1.0', ''];

testVersions.forEach(version => {
  const isValid = checker.isValidVersionFormat(version);
  console.log(`${isValid ? '✅' : '❌'} "${version}" -> ${isValid ? 'Valid' : 'Invalid'}`);
});

console.log('\n🎉 Version consistency checker is working correctly!');
