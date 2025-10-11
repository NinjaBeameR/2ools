# Release Script for Mura-2ools
# This script helps create and publish new releases automatically

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("patch", "minor", "major")]
    [string]$BumpType
)

Write-Host "🚀 Mura-2ools Release Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Get current version
$currentVersion = (Get-Content package.json | ConvertFrom-Json).version
Write-Host "📌 Current version: $currentVersion" -ForegroundColor Yellow

# Confirm bump type
Write-Host "📈 Bump type: $BumpType" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue with $BumpType version bump? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Release cancelled" -ForegroundColor Red
    exit 1
}

# Ensure we're on main branch
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    Write-Host "⚠️  You're on branch '$currentBranch', not 'main'" -ForegroundColor Yellow
    $switchBranch = Read-Host "Switch to main branch? (y/n)"
    if ($switchBranch -eq 'y') {
        git checkout main
    } else {
        Write-Host "❌ Release cancelled - must be on main branch" -ForegroundColor Red
        exit 1
    }
}

# Pull latest changes
Write-Host "📥 Pulling latest changes..." -ForegroundColor Cyan
git pull origin main

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $continue = Read-Host "Commit changes before release? (y/n)"
    if ($continue -eq 'y') {
        $commitMsg = Read-Host "Enter commit message"
        git add .
        git commit -m "$commitMsg"
    } else {
        Write-Host "❌ Release cancelled - please commit or stash changes" -ForegroundColor Red
        exit 1
    }
}

# Bump version
Write-Host ""
Write-Host "🔢 Bumping version..." -ForegroundColor Cyan
npm version $BumpType --no-git-tag-version

# Get new version
$newVersion = (Get-Content package.json | ConvertFrom-Json).version
Write-Host "✅ New version: $newVersion" -ForegroundColor Green

# Commit version change
Write-Host "💾 Committing version change..." -ForegroundColor Cyan
git add package.json package-lock.json
git commit -m "chore: bump version to $newVersion"

# Create and push tag
Write-Host "🏷️  Creating tag v$newVersion..." -ForegroundColor Cyan
git tag -a "v$newVersion" -m "Release v$newVersion"

# Push changes and tag
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
git push origin main
git push origin "v$newVersion"

Write-Host ""
Write-Host "✅ Release v$newVersion initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. GitHub Actions will automatically build the installer" -ForegroundColor White
Write-Host "  2. Check progress: https://github.com/NinjaBeameR/2ools/actions" -ForegroundColor White
Write-Host "  3. Release will be published: https://github.com/NinjaBeameR/2ools/releases" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Build typically takes 5-10 minutes" -ForegroundColor Yellow
Write-Host ""
