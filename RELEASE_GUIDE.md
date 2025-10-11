# 🚀 Release Process Guide

This document explains how to create and publish new releases for Mura-2ools using the automated release system.

## 📋 Overview

The release system uses:
- **GitHub Actions** - Automated building and publishing
- **electron-builder** - Creates installers and manages auto-updates
- **Semantic Versioning** - Version numbering (MAJOR.MINOR.PATCH)

## 🎯 Quick Start

### Option 1: Automated Script (Recommended)

Run the release script with PowerShell:

```powershell
# Patch release (1.0.5 → 1.0.6) - Bug fixes
.\scripts\release.ps1 -BumpType patch

# Minor release (1.0.5 → 1.1.0) - New features
.\scripts\release.ps1 -BumpType minor

# Major release (1.0.5 → 2.0.0) - Breaking changes
.\scripts\release.ps1 -BumpType major
```

The script will:
1. ✅ Check you're on the main branch
2. ✅ Pull latest changes
3. ✅ Bump the version number
4. ✅ Commit the version change
5. ✅ Create a Git tag
6. ✅ Push everything to GitHub
7. ✅ Trigger GitHub Actions to build and publish

### Option 2: Manual Process

If you prefer manual control:

```powershell
# 1. Bump version
npm version patch  # or minor, or major

# 2. Push changes and tag
git push origin main
git push origin --tags

# GitHub Actions will handle the rest automatically
```

## 📦 What Happens Automatically

When you push a version tag (e.g., `v1.0.6`):

1. **GitHub Actions Workflow Starts**
   - Checks out code
   - Installs dependencies
   - Builds the Vite frontend
   - Creates Windows installer

2. **Electron Builder Publishes**
   - Generates `Mura-2ools Setup X.Y.Z.exe`
   - Creates `latest.yml` for auto-updates
   - Generates blockmap files

3. **GitHub Release Created**
   - Uploads installer files
   - Adds release notes
   - Makes it public

4. **Users Get Notified**
   - Existing users see update dialog
   - Can download and install automatically

## 🔍 Monitoring Releases

### Check Build Progress
- Visit: https://github.com/NinjaBeameR/2ools/actions
- Look for the "Build and Release" workflow
- Build takes ~5-10 minutes

### View Published Releases
- Visit: https://github.com/NinjaBeameR/2ools/releases
- Latest release appears at the top

### Check Logs
- If build fails, check Actions logs
- Common issues:
  - Missing dependencies
  - Build errors
  - Permission issues

## 📝 Version Numbering Guide

Follow **Semantic Versioning** (semver):

### PATCH (1.0.5 → 1.0.6)
Use for:
- Bug fixes
- Performance improvements
- Documentation updates
- Small UI tweaks

```powershell
.\scripts\release.ps1 -BumpType patch
```

### MINOR (1.0.5 → 1.1.0)
Use for:
- New features
- New tools added
- Significant improvements
- Backward-compatible changes

```powershell
.\scripts\release.ps1 -BumpType minor
```

### MAJOR (1.0.5 → 2.0.0)
Use for:
- Breaking changes
- Complete redesign
- Removed features
- Major architecture changes

```powershell
.\scripts\release.ps1 -BumpType major
```

## 🛠️ Testing Before Release

### Test Locally
```powershell
# Build installer locally
npm run dist

# Test in release/ folder
.\release\Mura-2ools Setup X.Y.Z.exe
```

### Pre-release Testing
1. Install current version
2. Build new version locally
3. Run installer (should upgrade)
4. Verify auto-update works
5. Test all tools still work

## ⚠️ Important Notes

### Before Releasing:
- ✅ All changes committed
- ✅ Tests passing
- ✅ On `main` branch
- ✅ Pulled latest changes
- ✅ Tested locally

### After Releasing:
- ✅ Wait for GitHub Actions to complete
- ✅ Verify release appears on GitHub
- ✅ Test downloading installer
- ✅ Test auto-update works

## 🐛 Troubleshooting

### Build Fails on GitHub Actions
1. Check the Actions log for errors
2. Run `npm run build` locally to reproduce
3. Fix issues and push changes
4. Re-run the failed workflow

### Auto-Update Not Working
1. Verify `latest.yml` exists in release
2. Check `package.json` has correct repo info
3. Ensure GitHub release is public (not draft)
4. Check app logs for update errors

### Version Already Published
If you accidentally push the same version:
1. Delete the tag: `git tag -d v1.0.6`
2. Delete remote tag: `git push origin :refs/tags/v1.0.6`
3. Delete the GitHub release
4. Bump version again

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs
2. Review this documentation
3. Check electron-builder docs
4. Review auto-update setup

## 🎉 Release Checklist

Before each release:

- [ ] Code changes tested locally
- [ ] Version number appropriate
- [ ] All tests passing
- [ ] No uncommitted changes
- [ ] On main branch with latest changes
- [ ] Ready to release

After pushing tag:

- [ ] GitHub Actions workflow started
- [ ] Build completed successfully
- [ ] Release published on GitHub
- [ ] Installer downloaded and tested
- [ ] Auto-update dialog appears

---

**Current Version:** 1.0.5  
**Last Updated:** October 11, 2025  
**Repository:** https://github.com/NinjaBeameR/2ools
