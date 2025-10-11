# 🚀 Quick Release Reference

## To Release a New Version:

```powershell
# Patch (bug fixes): 1.0.5 → 1.0.6
.\scripts\release.ps1 -BumpType patch

# Minor (new features): 1.0.5 → 1.1.0
.\scripts\release.ps1 -BumpType minor

# Major (breaking changes): 1.0.5 → 2.0.0
.\scripts\release.ps1 -BumpType major
```

## Monitor Release:
- **Actions**: https://github.com/NinjaBeameR/2ools/actions
- **Releases**: https://github.com/NinjaBeameR/2ools/releases

## Files Generated:
- `Mura-2ools Setup X.Y.Z.exe` - Installer
- `latest.yml` - Auto-update manifest

---
See `RELEASE_GUIDE.md` for full documentation.
