# Version Consistency Checking

This document explains how to use the version consistency checking system to ensure that all version numbers across your project are consistent.

## 🎯 What It Does

The version consistency checker ensures that:
- **package.json** version matches **manifest.json** version
- **package.json** version matches **dist/manifest.json** version  
- **package.json** version matches **git tag** version (if available)
- All versions follow semantic versioning format

## 🚀 How to Use

### 1. Check Version Consistency

```bash
# Check if all versions are consistent
npm run check:versions
```

This will:
- Read versions from all relevant files
- Compare them for consistency
- Show a detailed report
- Exit with error code 1 if inconsistencies are found

### 2. Build with Version Check

```bash
# Build the project after checking versions
npm run build:check
```

This runs the version check first, then builds only if versions are consistent.

### 3. Test the Version Checker

```bash
# Run the demo/test script
npm run test:versions
```

This demonstrates how the version checker works with different scenarios.

## 🔧 Integration with GitHub Actions

The version consistency check is automatically integrated into the GitHub Actions workflow:

```yaml
- name: Check version consistency
  run: npm run check:versions
- name: Build
  run: npm run build
```

If versions are inconsistent, the workflow will fail before building, preventing releases with mismatched versions.

## 📋 What Gets Checked

### Files Checked:
1. **package.json** - Source of truth for version
2. **manifest.json** - Chrome extension manifest
3. **dist/manifest.json** - Built manifest for distribution

### Git Integration:
- Automatically detects if current commit has a git tag
- Compares git tag version with file versions
- Helps ensure releases are properly tagged

## 🚨 Common Issues & Solutions

### Issue: Manifest versions don't match package.json
```bash
# Solution: Rebuild the manifest
npm run build:manifest
```

### Issue: Dist manifest is outdated
```bash
# Solution: Rebuild the project
npm run build
```

### Issue: Git tag doesn't match file versions
```bash
# Solution: Update versions first, then create tag
npm run release
# or manually:
# 1. Update package.json version
# 2. Run build:manifest
# 3. Run build
# 4. Create git tag
```

## 📊 Example Output

### ✅ Consistent Versions:
```
🔍 Checking version consistency...
📦 Package.json: 1.2.3
📋 Manifest.json: 1.2.3
📁 Dist/Manifest.json: 1.2.3
🏷️  Git tag: 1.2.3

✅ All versions are consistent!
🎉 Version 1.2.3 is ready for release.
```

### ❌ Inconsistent Versions:
```
🔍 Checking version consistency...
📦 Package.json: 1.2.3
📋 Manifest.json: 1.2.4
📁 Dist/Manifest.json: 1.2.3
🏷️  Git tag: 1.2.3

❌ Version inconsistency detected!

🔧 Errors:
  • Package.json version (1.2.3) doesn't match manifest.json version (1.2.4)

💡 To fix this:
  1. Ensure package.json has the correct version
  2. Run "npm run build:manifest" to update manifest.json
  3. Run "npm run build" to update dist/manifest.json
  4. Create git tag AFTER updating versions
```

## 🎯 Best Practices

1. **Always check versions before building** - Use `npm run build:check`
2. **Update versions before tagging** - Don't tag commits with old versions
3. **Run version check in CI/CD** - Catch issues before they reach production
4. **Use semantic versioning** - Follow the `MAJOR.MINOR.PATCH` format
5. **Test version consistency** - Use `npm run test:versions` to verify

## 🔍 Version Format Validation

The checker validates that versions follow semantic versioning:
- ✅ Valid: `1.0.0`, `0.1.0`, `2.10.15`, `1.0.0-alpha`
- ❌ Invalid: `v1.0.0`, `1.0`, `1.0.0.0`, ``

## 🚀 Scripts Available

| Script | Purpose |
|--------|---------|
| `npm run check:versions` | Check version consistency |
| `npm run test:versions` | Test the version checker |
| `npm run build:check` | Build with version check |
| `npm run build:manifest` | Update manifest.json |

## 🎉 Benefits

- **Prevents release mistakes** - Catches version mismatches early
- **Ensures consistency** - All files have the same version
- **CI/CD integration** - Automatic checking in GitHub Actions
- **Clear error messages** - Easy to understand and fix issues
- **Developer friendly** - Simple commands and helpful output

## 🔗 Related Files

- `scripts/checkVersionConsistency.js` - Main version checker
- `scripts/testVersionConsistency.js` - Test/demo script
- `.github/workflows/release.yml` - GitHub Actions integration
- `package.json` - Script definitions
