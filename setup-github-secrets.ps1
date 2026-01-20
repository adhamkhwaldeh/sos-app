#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup GitHub Actions secrets for SOS App CI/CD pipeline
.DESCRIPTION
    This script helps encode and prepare files for GitHub Actions secrets
.EXAMPLE
    .\setup-github-secrets.ps1 -GoogleServicesJsonPath "android/app/google-services.json"
#>

param(
    [Parameter(Mandatory = $false, HelpMessage = "Path to google-services.json file")]
    [string]$GoogleServicesJsonPath = "android/app/google-services.json",
    
    [Parameter(Mandatory = $false, HelpMessage = "Path to keystore file (optional)")]
    [string]$KeystorePath,
    
    [Parameter(Mandatory = $false, HelpMessage = "Show instructions only")]
    [switch]$InstructionsOnly
)

function Encode-Base64 {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Error "File not found: $FilePath"
        return $null
    }
    
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    $base64 = [System.Convert]::ToBase64String($bytes)
    return $base64
}

function Show-Instructions {
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         GitHub Actions Secrets Setup Instructions            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`n1. Go to your GitHub repository on GitHub.com" -ForegroundColor Yellow
    Write-Host "2. Navigate to Settings → Secrets and variables → Actions" -ForegroundColor Yellow
    Write-Host "3. Click 'New repository secret'" -ForegroundColor Yellow
    Write-Host "4. Add the following secrets:" -ForegroundColor Yellow
    
    Write-Host "`n[REQUIRED]" -ForegroundColor Green
    Write-Host "  Name: GOOGLE_SERVICES_JSON" -ForegroundColor White
    Write-Host "  Value: [See output below]" -ForegroundColor Gray
    
    Write-Host "`n[OPTIONAL - Only if you want to sign APKs]" -ForegroundColor Yellow
    Write-Host "  Name: SIGNING_KEY" -ForegroundColor White
    Write-Host "  Value: [Your keystore file (base64 encoded)]" -ForegroundColor Gray
    Write-Host "  Name: SIGNING_KEY_ALIAS" -ForegroundColor White
    Write-Host "  Value: [Your certificate alias]" -ForegroundColor Gray
    Write-Host "  Name: KEY_STORE_PASSWORD" -ForegroundColor White
    Write-Host "  Value: [Your keystore password]" -ForegroundColor Gray
    Write-Host "  Name: KEY_PASSWORD" -ForegroundColor White
    Write-Host "  Value: [Your key password]" -ForegroundColor Gray
}

# Main execution
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SOS App - GitHub Actions Setup Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($InstructionsOnly) {
    Show-Instructions
    exit 0
}

# Check and encode google-services.json
Write-Host "Processing google-services.json..." -ForegroundColor Yellow
if (Test-Path $GoogleServicesJsonPath) {
    $googleServicesBase64 = Encode-Base64 -FilePath $GoogleServicesJsonPath
    Write-Host ✓ "Successfully encoded google-services.json" -ForegroundColor Green
} else {
    Write-Host ✗ "google-services.json not found at: $GoogleServicesJsonPath" -ForegroundColor Red
    Write-Host "Please ensure the file exists before proceeding." -ForegroundColor Yellow
    exit 1
}

# Check and encode keystore if provided
if ($KeystorePath) {
    Write-Host "`nProcessing keystore file..." -ForegroundColor Yellow
    if (Test-Path $KeystorePath) {
        $keystoreBase64 = Encode-Base64 -FilePath $KeystorePath
        Write-Host ✓ "Successfully encoded keystore file" -ForegroundColor Green
    } else {
        Write-Host ✗ "Keystore file not found at: $KeystorePath" -ForegroundColor Red
        $keystoreBase64 = $null
    }
}

# Display encoded values
Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ENCODED SECRET VALUES                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n[GOOGLE_SERVICES_JSON]" -ForegroundColor Green
Write-Host "Copy this value and paste it into GitHub secrets:" -ForegroundColor Gray
Write-Host $googleServicesBase64 -ForegroundColor White

if ($keystoreBase64) {
    Write-Host "`n[SIGNING_KEY]" -ForegroundColor Green
    Write-Host "Copy this value and paste it into GitHub secrets:" -ForegroundColor Gray
    Write-Host $keystoreBase64 -ForegroundColor White
}

# Copy to clipboard
try {
    $googleServicesBase64 | Set-Clipboard
    Write-Host "`n✓ GOOGLE_SERVICES_JSON copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "`n✗ Could not copy to clipboard: $_" -ForegroundColor Yellow
}

Show-Instructions

Write-Host "`n[NEXT STEPS]" -ForegroundColor Yellow
Write-Host "1. Copy the encoded values above" -ForegroundColor White
Write-Host "2. Visit: https://github.com/YOUR_USERNAME/sos-app/settings/secrets/actions" -ForegroundColor White
Write-Host "3. Create new secrets with the values above" -ForegroundColor White
Write-Host "4. Trigger a workflow by pushing to master/main/develop" -ForegroundColor White
Write-Host "`n"
