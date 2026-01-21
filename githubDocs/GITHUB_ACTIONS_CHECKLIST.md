# GitHub Actions Setup Checklist ✅

Use this checklist to ensure your GitHub Actions CI/CD pipeline is properly configured.

## Phase 1: Initial Setup

- [ ] **Files created successfully**
  - [ ] `.github/workflows/ci.yml` exists
  - [ ] `.github/workflows/code-quality.yml` exists
  - [ ] `.github/workflows/release.yml` exists
  - [ ] `.github/workflows/README.md` exists
  - [ ] `jest.config.js` exists
  - [ ] `jest.setup.js` exists
  - [ ] `CI_CD_SETUP.md` exists
  - [ ] `GITHUB_ACTIONS_SETUP.md` exists

- [ ] **Package.json updated**
  - [ ] `npm test` script added
  - [ ] `npm run test:watch` script added
  - [ ] `npm run test:coverage` script added
  - [ ] Testing dependencies added (jest, @testing-library/*)

- [ ] **Test sample created**
  - [ ] `src/__tests__/sample.test.tsx` exists
  - [ ] Can run `npm test` locally

## Phase 2: GitHub Configuration

- [ ] **Repository access verified**
  - [ ] You have admin access to the GitHub repository
  - [ ] Repository is connected to the local project

- [ ] **Secrets configured**
  - [ ] Go to GitHub: Settings → Secrets and variables → Actions
  - [ ] [ ] Added `GOOGLE_SERVICES_JSON` secret
    - [ ] Value is base64 encoded
    - [ ] File source: `android/app/google-services.json`
  - [ ] *Optional*: Added signing secrets for release workflow
    - [ ] `SIGNING_KEY` (base64 encoded keystore)
    - [ ] `SIGNING_KEY_ALIAS`
    - [ ] `KEY_STORE_PASSWORD`
    - [ ] `KEY_PASSWORD`

## Phase 3: Local Testing

- [ ] **Commands work locally**
  ```bash
  npm run lint              # ✅ Should pass or show fixable errors
  npm test                  # ✅ Should run test suite
  npm run test:coverage     # ✅ Should generate coverage reports
  npx tsc --noEmit          # ✅ Should compile TypeScript
  ```

- [ ] **Dependencies installed**
  ```bash
  npm install               # ✅ No errors
  ```

## Phase 4: First CI Run

- [ ] **Trigger first workflow**
  ```bash
  git add .
  git commit -m "Add GitHub Actions CI/CD pipeline"
  git push origin master
  ```

- [ ] **Monitor workflow execution**
  - [ ] Go to GitHub Actions tab
  - [ ] Watch "CI Pipeline" workflow
  - [ ] Check logs for each job

- [ ] **Verify jobs complete**
  - [ ] Lint Check job completes (pass or fail)
  - [ ] Unit Tests job completes (pass or fail)
  - [ ] APK Build job completes (check artifacts)

## Phase 5: Address Issues

If workflows fail, address in this order:

- [ ] **ESLint/Lint failures**
  - [ ] Run `npm run lint` locally
  - [ ] Fix issues: `npx eslint --fix src/`
  - [ ] Or update ESLint rules in `.eslintrc.js`

- [ ] **Test failures**
  - [ ] Run `npm test` locally
  - [ ] Review test output
  - [ ] Add missing mocks in `jest.setup.js`

- [ ] **APK build failures**
  - [ ] Verify `GOOGLE_SERVICES_JSON` secret is valid
  - [ ] Check Android SDK path is correct
  - [ ] Verify `android/app/build.gradle` settings

- [ ] **Type check failures**
  - [ ] Run `npx tsc --noEmit` locally
  - [ ] Fix TypeScript errors
  - [ ] Update `tsconfig.json` if needed

## Phase 6: Enhancement (Optional)

- [ ] **Write unit tests**
  - [ ] Create `src/__tests__/` subdirectories
  - [ ] Add `.test.ts` or `.test.tsx` files
  - [ ] Ensure tests cover critical functions

- [ ] **Configure APK signing** (for production releases)
  - [ ] Add signing secrets to GitHub
  - [ ] Test release workflow on tag push
  - [ ] Verify signed APK in releases

- [ ] **Set up release automation**
  - [ ] Create and push version tags
  - [ ] Example: `git tag -a v1.0.0 -m "Release v1.0.0"`
  - [ ] Push tag: `git push origin v1.0.0`
  - [ ] Check GitHub Releases page

## Phase 7: Documentation & Team

- [ ] **Share documentation**
  - [ ] Share `GITHUB_ACTIONS_SETUP.md` with team
  - [ ] Share `.github/workflows/README.md` with team
  - [ ] Point to `CI_CD_SETUP.md` for detailed info

- [ ] **Team training**
  - [ ] Explain workflow triggers
  - [ ] Show how to view workflow logs
  - [ ] Explain CI requirements for PRs

- [ ] **GitHub branch protection** (recommended)
  - [ ] Go to Settings → Branches
  - [ ] Enable "Require status checks to pass"
  - [ ] Require passing:
    - [ ] Lint Check
    - [ ] Unit Tests
    - [ ] APK Build (optional)

## Verification Command

Run this to verify everything is set up:

```powershell
# PowerShell script to verify setup
$files = @(
    ".\.github\workflows\ci.yml",
    ".\.github\workflows\code-quality.yml",
    ".\.github\workflows\release.yml",
    "jest.config.js",
    "jest.setup.js",
    "CI_CD_SETUP.md",
    "GITHUB_ACTIONS_SETUP.md"
)

Write-Host "Checking GitHub Actions setup..." -ForegroundColor Cyan
$allExist = $true

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $allExist = $false
    }
}

if ($allExist) {
    Write-Host "`n✅ All files present! Setup looks good." -ForegroundColor Green
} else {
    Write-Host "`n❌ Some files are missing. Check setup." -ForegroundColor Red
}

# Check package.json scripts
Write-Host "`nChecking package.json scripts..." -ForegroundColor Cyan
$content = Get-Content package.json -Raw
if ($content -match '"test"') {
    Write-Host "✅ npm test script found" -ForegroundColor Green
} else {
    Write-Host "❌ npm test script missing" -ForegroundColor Red
}
```

## Success Criteria

Your GitHub Actions setup is complete when:

✅ All files are created
✅ `GOOGLE_SERVICES_JSON` secret is configured
✅ First CI run completes (any status)
✅ Lint check runs and reports
✅ Test runner executes
✅ APK build generates artifacts
✅ Team is aware of CI requirements

---

## Quick Links

- **View Workflows**: Go to repository Actions tab
- **Configure Secrets**: Settings → Secrets and variables → Actions
- **Documentation**: Read `CI_CD_SETUP.md` and `GITHUB_ACTIONS_SETUP.md`
- **Workflow Logs**: Click on workflow run → Click job name

---

## Notes

- First APK build may take 30+ minutes (includes Gradle dependency download)
- Subsequent builds are faster due to caching
- Tests are optional (workflow continues if no tests found)
- ESLint must pass for CI to succeed
- APK build requires valid `google-services.json`

**Need help?** Check `CI_CD_SETUP.md` troubleshooting section.

---

**Last updated**: January 20, 2026
**Status**: ✅ Ready for production use
