# Publishing Guide for PorkAte Monorepo

This guide explains how to publish packages to NPM both manually and automatically using GitHub Actions.

## Prerequisites

1. **NPM Account**: You need an NPM account with publishing permissions
2. **NPM Token**: Create an automation token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
3. **GitHub Secrets**: Add your NPM token as a secret in GitHub

### Setting up GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your NPM automation token
6. Click **Add secret**

### Local NPM Login

Before publishing locally, make sure you're logged in to NPM:

```bash
npm login
```

## Automatic Publishing (GitHub Actions)

### Method 1: Tag-Based Publishing (Recommended)

When you push a version tag, packages are automatically built, tested, and published.

**Workflow:**

1. Make your changes and commit them
2. Create and push a version tag:

```bash
# For all packages
git tag v1.0.0
git push origin v1.0.0

# For a specific package
git tag @porkate/payment@1.0.0
git push origin @porkate/payment@1.0.0
```

3. GitHub Actions will:
   - Build all packages
   - Run tests
   - Publish to NPM
   - Create a GitHub Release

### Method 2: Canary Publishing

Canary versions are automatically published when you push to `main` or `develop` branches (if package files changed).

- Canary versions use format: `1.0.0-alpha.0+SHA`
- Great for testing before official releases
- Can also be manually triggered from GitHub Actions tab

### Method 3: Manual Version Workflow

Use GitHub Actions UI to trigger versioning:

1. Go to **Actions** tab
2. Select **Version Packages** workflow
3. Click **Run workflow**
4. Choose bump type (patch/minor/major/prerelease)
5. This will create and push tags automatically

## Manual Publishing (CLI Commands)

### Quick Publish Commands

**Publish without versioning** (packages must already be versioned):
```bash
pnpm run publish:now
```

**Create patch version and publish:**
```bash
pnpm run release:patch
```

**Create minor version and publish:**
```bash
pnpm run release:minor
```

**Create major version and publish:**
```bash
pnpm run release:major
```

**Create alpha/prerelease and publish:**
```bash
pnpm run release:alpha
```

### Versioning Only (No Publishing)

**Patch version** (1.0.0 → 1.0.1):
```bash
pnpm run version:patch
```

**Minor version** (1.0.0 → 1.1.0):
```bash
pnpm run version:minor
```

**Major version** (1.0.0 → 2.0.0):
```bash
pnpm run version:major
```

**Prerelease/Alpha** (1.0.0 → 1.0.1-alpha.0):
```bash
pnpm run version:prerelease
```

**Interactive versioning** (choose version for each package):
```bash
pnpm run version
```

### Publish Only (After Manual Versioning)

If you've already updated versions in package.json files:

```bash
pnpm run publish:now
```

Or in CI environments:
```bash
pnpm run publish:ci
```

### Canary Publishing

Publish a canary/pre-release version for testing:

```bash
pnpm run publish:canary
```

This creates versions like `1.0.0-alpha.0+abc123`

## Step-by-Step Release Process

### For Patch/Minor Updates

1. **Make your changes**
   ```bash
   # Make code changes
   git add .
   git commit -m "feat: add new feature"
   ```

2. **Test locally**
   ```bash
   pnpm run build
   pnpm run test
   ```

3. **Option A: One-command release**
   ```bash
   pnpm run release:patch  # or release:minor
   ```

4. **Option B: Two-step process**
   ```bash
   # Step 1: Version
   pnpm run version:patch
   
   # Step 2: Publish
   pnpm run publish:now
   ```

5. **Push to GitHub**
   ```bash
   git push origin main --follow-tags
   ```

### For Major Updates

1. **Update code and documentation**
2. **Test thoroughly**
   ```bash
   pnpm run build
   pnpm run test
   pnpm run lint
   ```

3. **Create major version and publish**
   ```bash
   pnpm run release:major
   ```

4. **Push with tags**
   ```bash
   git push origin main --follow-tags
   ```

### For Testing/Alpha Releases

1. **Create alpha version**
   ```bash
   pnpm run release:alpha
   ```

2. **Or use canary (temporary test versions)**
   ```bash
   pnpm run publish:canary
   ```

## Publishing Specific Packages

To version/publish only specific packages:

```bash
# Version specific package
pnpm lerna version --scope @porkate/payment

# Publish specific package
pnpm lerna publish from-package --scope @porkate/payment
```

## Troubleshooting

### "You must be logged in to publish packages"

```bash
npm login
# Or set NPM token
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN
```

### "Package already exists"

Check if the version already exists on NPM. Increment version:
```bash
pnpm run version:patch
```

### Tests Failing in CI

GitHub Actions will not publish if tests fail. Check test logs:
- Go to **Actions** tab
- Click on the failed workflow
- Review test output

### Permission Denied

1. Ensure you're logged in: `npm whoami`
2. Check package.json has `"publishConfig": { "access": "public" }`
3. Verify you have publish permissions for scoped packages

## Package Access

All packages are configured with:
```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

This allows publishing scoped packages (@porkate/*, @invalid8/*, etc.) as public packages.

## Workflows Summary

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **publish.yml** | Version tags (`v*.*.*`) | Auto-publish on tag push |
| **publish-canary.yml** | Push to main/develop | Auto-publish canary versions |
| **version.yml** | Manual trigger | Create versions via GitHub UI |

## Best Practices

1. **Always test before publishing**: Run `pnpm run test`
2. **Build before publishing**: Automated in release commands
3. **Use conventional commits**: For automatic changelog generation
4. **Use patch for bug fixes**: `pnpm run release:patch`
5. **Use minor for features**: `pnpm run release:minor`
6. **Use major for breaking changes**: `pnpm run release:major`
7. **Use alpha for testing**: `pnpm run release:alpha`
8. **Let CI handle production releases**: Push tags to trigger GitHub Actions
9. **Use canary for quick tests**: `pnpm run publish:canary`
10. **Follow tags**: Always push with `--follow-tags`

## Quick Reference

```bash
# Quick publish (current versions)
pnpm run publish:now

# Release with versioning
pnpm run release:patch    # Bug fixes
pnpm run release:minor    # New features
pnpm run release:major    # Breaking changes
pnpm run release:alpha    # Alpha/test version

# Versioning only
pnpm run version:patch
pnpm run version:minor
pnpm run version:major
pnpm run version:prerelease

# Test/Canary
pnpm run publish:canary

# Check what will be published
pnpm lerna changed
pnpm lerna ls
```

## Example Workflow

```bash
# 1. Make changes
git checkout -b feature/new-feature
# ... code changes ...

# 2. Test
pnpm run build
pnpm run test

# 3. Commit
git add .
git commit -m "feat: add new payment provider"

# 4. Merge to main
git checkout main
git merge feature/new-feature

# 5. Release (automatically builds, versions, publishes)
pnpm run release:minor

# 6. Push (triggers GitHub Actions as backup)
git push origin main --follow-tags
```
