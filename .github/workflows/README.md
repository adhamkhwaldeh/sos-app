# GitHub Actions Workflows

This directory contains all GitHub Actions workflows for the SOS App project.

## Available Workflows

### 1. **ci.yml** - Main CI Pipeline
**Triggers**: Push and Pull Requests to master/main/develop

**Jobs**:
- ✅ Lint Check (ESLint)
- ✅ Unit Tests (Jest with coverage)
- ✅ APK Build (Android release build)

**Artifacts**:
- Lint results
- Test coverage reports
- Release APK

**Duration**: ~40-50 minutes total

---

### 2. **code-quality.yml** - Code Quality & Security
**Triggers**: 
- Push and Pull Requests to master/main/develop
- Weekly schedule (Mondays at 9 AM UTC)

**Jobs**:
- 🔍 Dependency Vulnerability Scan
- 📝 TypeScript Type Checking

**Artifacts**:
- NPM audit reports

**Purpose**: Ensures code quality, type safety, and security compliance

---

### 3. **release.yml** - Release Build Pipeline
**Triggers**:
- Manual workflow dispatch (workflow_dispatch)
- Git tags (v* pattern)

**Jobs**:
- ✅ Verify Build Quality (lint + test + type check)
- 📦 Build & Sign Release APK
- 🎉 Create GitHub Release

**Features**:
- APK signing with production keys
- Automatic release creation
- Release notes generation

**Setup Required**:
- `SIGNING_KEY`: Base64-encoded keystore file
- `SIGNING_KEY_ALIAS`: Key alias in keystore
- `KEY_STORE_PASSWORD`: Keystore password
- `KEY_PASSWORD`: Key password

---

## Quick Setup Guide

### 1. Initial Configuration

Before workflows can run, add required secrets to your repository:

**Via GitHub Web**:
1. Go to repository **Settings**
2. Navigate to **Secrets and variables** → **Actions**
3. Add each required secret

### 2. Required Secrets

#### Essential (for all workflows):
```
GOOGLE_SERVICES_JSON - Firebase config (base64 encoded)
```

#### Optional (for release workflow):
```
SIGNING_KEY - Android keystore file (base64 encoded)
SIGNING_KEY_ALIAS - Certificate alias
KEY_STORE_PASSWORD - Keystore password
KEY_PASSWORD - Key password
```

### 3. Triggering Workflows

#### CI Workflow (automatic)
- Create a pull request to master/main/develop
- Push commits to master/main/develop

#### Code Quality Workflow (automatic)
- Runs on every push/PR
- Runs weekly on Mondays

#### Release Workflow (manual)
```bash
# Push a version tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Or use GitHub web UI: Actions → Release Build → Run workflow
```

---

## Workflow Logs & Artifacts

### View Workflow Runs
1. Go to **Actions** tab
2. Select workflow run
3. Click job name to see logs
4. Download artifacts at the bottom

### Download Artifacts
- Automatically retained for **30 days**
- Available in each workflow run summary

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `google-services.json not found` | Ensure secret is base64 encoded and named correctly |
| `Gradle build fails` | Check Java version (should be 17) and Android SDK paths |
| `Tests fail: Module not found` | Run `npm install` locally, check jest.config.js |
| `ESLint fails` | Run `npm run lint` locally, fix issues with `npx eslint --fix` |
| `APK signing fails` | Verify keystore is base64 encoded and passwords are correct |

---

## Performance Optimization

Current optimizations:
- ✅ Node modules caching
- ✅ Parallel dependency installation
- ✅ Job dependencies (prevents unnecessary runs)

Future improvements:
- Cache Gradle build cache
- Parallel test execution
- Docker layer caching for Android builds

---

## Useful Commands

Run these locally to mimic CI environment:

```bash
# Install dependencies
npm install

# Run all quality checks
npm run lint
npm run test:coverage
npx tsc --noEmit

# Audit dependencies
npm audit

# Build APK (requires Android SDK)
cd android
./gradlew assembleRelease
```

---

## Documentation Links

- [CI/CD Setup Details](../CI_CD_SETUP.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Expo Build Docs](https://docs.expo.dev/build/)
- [Android Build Docs](https://developer.android.com/build)
- [Jest Documentation](https://jestjs.io/)
- [ESLint Documentation](https://eslint.org/)

---

## Support

For workflow issues:
1. Check workflow logs in Actions tab
2. Review error messages and artifact files
3. Run commands locally to isolate issues
4. Check GitHub Actions documentation

Last Updated: January 2026
