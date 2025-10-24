# NPM Publishing Quick Reference

## 🚀 Quick Commands

### One-Command Releases (Recommended)
```bash
pnpm run release:patch    # 1.0.0 → 1.0.1 (bug fixes)
pnpm run release:minor    # 1.0.0 → 1.1.0 (new features)
pnpm run release:major    # 1.0.0 → 2.0.0 (breaking changes)
pnpm run release:alpha    # 1.0.0 → 1.0.1-alpha.0 (test version)
```

### Manual Two-Step Process
```bash
# Step 1: Version
pnpm run version:patch    # or version:minor, version:major, version:prerelease

# Step 2: Publish
pnpm run publish:now
```

### Quick Publish (Without Versioning)
```bash
pnpm run publish:now      # Publish current versions
pnpm run publish:canary   # Publish test/canary version
```

## 🏷️ GitHub Actions (Automatic)

### Push a Tag
```bash
git tag v1.0.0
git push origin v1.0.0
```
→ Automatically builds, tests, and publishes to NPM

### Push to Main/Develop
→ Automatically publishes canary versions

## 📋 Setup Checklist

- [ ] Run `npm login` (local publishing)
- [ ] Create NPM automation token at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
- [ ] Add `NPM_TOKEN` to GitHub Secrets
- [ ] Test with `pnpm run publish:canary`

## 🔍 Check Commands

```bash
pnpm lerna ls              # List all packages
pnpm lerna changed         # Show changed packages
npm whoami                 # Check NPM login
```

## 📦 Publishing Specific Packages

```bash
# Version specific package
pnpm lerna version --scope @porkate/payment

# Publish specific package
pnpm lerna publish from-package --scope @porkate/payment
```

## 🛠️ Setup Script

```bash
./scripts/setup/setup-npm-publishing.sh
```

## 📚 Full Documentation

See [PUBLISHING.md](./PUBLISHING.md) for complete guide.
