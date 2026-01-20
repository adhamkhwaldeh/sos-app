# GitHub Actions CI/CD Pipeline Documentation

## Overview

This document outlines the GitHub Actions CI/CD pipeline configured for the SOS App project. The pipeline includes three main jobs:
1. **Lint Check** - Validates code quality using ESLint
2. **Unit Tests** - Runs Jest test suite
3. **APK Build** - Builds a release APK for Android

## Workflow Trigger

The CI pipeline runs automatically on:
- **Push events** to `master`, `main`, and `develop` branches
- **Pull requests** to `master`, `main`, and `develop` branches

## Jobs

### 1. Lint Check Job
**Status**: Runs on every push/PR
**Duration**: ~5-10 minutes

**Steps:**
- Checks out the code
- Sets up Node.js 20
- Installs dependencies
- Runs ESLint via `npm run lint`
- Uploads results as artifacts

**Exit Criteria**: 
- Fails if ESLint detects errors
- Warnings do not fail the build by default

### 2. Unit Tests Job
**Status**: Runs after lint check passes
**Duration**: ~10-15 minutes

**Steps:**
- Checks out the code
- Sets up Node.js 20
- Installs dependencies
- Runs Jest tests with coverage
- Uploads coverage reports as artifacts

**Features:**
- Continues on error (doesn't fail the entire workflow)
- Generates coverage reports
- Jest is configured to pass if no tests are found (prevents false failures)

### 3. APK Build Job
**Status**: Runs after lint and tests pass (or on tag push for releases)
**Duration**: ~20-30 minutes

**Steps:**
- Checks out the code
- Sets up Node.js 20
- Sets up Java 17 (required for Android build)
- Sets up Android SDK with API 34 and build-tools 34.0.0
- Installs dependencies
- Installs Expo CLI
- **Decodes** `google-services.json` from secrets
- Creates `local.properties` with Android paths
- Runs Gradle build to generate release APK
- Uploads APK as artifacts
- (Optional) Creates a GitHub Release if pushing a git tag

## Required Secrets

Before the pipeline can build APKs, you need to configure the following GitHub secret:

### `GOOGLE_SERVICES_JSON`
This is the Firebase configuration file encoded in base64.

**How to set it up:**

1. Ensure you have your `google-services.json` file from Firebase Console
2. Encode it to base64:
   ```bash
   # On macOS/Linux:
   cat android/app/google-services.json | base64 | pbcopy
   
   # On Windows PowerShell:
   [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("android/app/google-services.json")) | Set-Clipboard
   ```
3. Go to GitHub repository **Settings** → **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `GOOGLE_SERVICES_JSON`
6. Value: Paste the base64-encoded content
7. Click **Add secret**

## Workflow Configuration Details

### Environment Variables
- `ANDROID_HOME`: Automatically set by GitHub Actions
- `JAVA_HOME`: Automatically set by JDK setup action

### Artifact Retention
- All artifacts are retained for **30 days**
- Includes: lint results, test coverage, APK files

### Build Java Version
- **Java 17** is used for Android builds (compatible with modern Gradle versions)
- Gradle 8+ requires Java 17+

### Android SDK Configuration
- **API Level**: 34 (Android 14)
- **Build Tools**: 34.0.0
- **NDK**: 25.2.9519653

## How to View Results

### 1. Via GitHub Web UI
- Go to your repository
- Click **Actions** tab
- Select the workflow run you want to inspect
- Click on the job to see detailed logs
- Download artifacts from the workflow run details

### 2. View Artifacts
- In the workflow run details, scroll to "Artifacts"
- Download:
  - `lint-results`: ESLint configuration and reports
  - `test-results`: Jest coverage reports
  - `apk-build`: Generated APK file(s)

### 3. APK Locations in Build
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **Debug APK**: `android/app/build/outputs/apk/debug/`

## Creating a Release

To automatically create a GitHub Release with the APK:

```bash
# Create an annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push the tag
git push origin v1.0.0
```

This will:
1. Trigger the CI pipeline
2. If all checks pass, create a GitHub Release
3. Attach the built APK to the release

## Troubleshooting

### Build Fails: "google-services.json not found"
- Ensure the `GOOGLE_SERVICES_JSON` secret is properly configured
- Verify the base64 encoding is correct
- Check that `android/app/` directory exists

### Build Fails: "Gradle build error"
- Check if `compileSdkVersion` in `android/app/build.gradle` matches API 34
- Ensure Android NDK version 25.2.9519653 is installed
- Review Gradle wrapper version in `android/gradle/wrapper/gradle-wrapper.properties`

### Tests Fail: "Module not found"
- Run `npm install` locally to ensure all dependencies are installed
- Check that `jest.config.js` properly maps module aliases
- Verify all mocked modules in `jest.setup.js` match your imports

### ESLint Fails
- Run `npm run lint` locally to see linting issues
- Fix issues according to your `.eslintrc.js` configuration
- Some issues can be auto-fixed: `npx eslint --fix`

## Running Locally

To test the pipeline steps locally:

```bash
# Install dependencies
npm install

# Run lint check
npm run lint

# Run tests with coverage
npm run test:coverage

# Build Android APK (requires Android SDK)
cd android
./gradlew assembleRelease
cd ..
```

## Performance Tips

1. **Cache Node Modules**: The workflow uses npm caching automatically
2. **Parallel Jobs**: Lint and tests could run in parallel if lint is moved to a separate job
3. **Selective Builds**: Consider adding path filters to skip unnecessary builds for documentation changes

## Future Enhancements

Potential improvements to consider:
1. Add iOS build step (requires macOS runner)
2. Add SonarQube code quality analysis
3. Add automated version bumping
4. Add Firebase App Distribution for beta builds
5. Add performance regression testing
6. Add visual regression testing with screenshots
7. Add dependency security scanning (Dependabot or Snyk)

## Contact & Support

For questions about the CI/CD pipeline setup, refer to the GitHub Actions documentation:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo Build Documentation](https://docs.expo.dev/build/)
- [Android Build Documentation](https://developer.android.com/build)
