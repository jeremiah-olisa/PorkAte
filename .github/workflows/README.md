# GitHub Actions Workflows

This directory contains automated workflows for the PorkAte monorepo.

## Available Workflows

### 1. Publish Packages (`publish.yml`)

**Trigger:** Push version tags (e.g., `v1.0.0`, `@porkate/payment@1.0.0`)

**What it does:**
- Checks out code
- Sets up Node.js 20 and pnpm
- Installs dependencies
- Builds all packages
- Runs tests
- Publishes to NPM
- Creates GitHub release (for `v*` tags)

**Usage:**
```bash
# Publish all packages
git tag v1.0.0
git push origin v1.0.0

# Publish specific package
git tag @porkate/payment@1.0.0
git push origin @porkate/payment@1.0.0
```

**Requirements:**
- `NPM_TOKEN` secret must be set in repository settings

---

### 2. Publish Canary Packages (`publish-canary.yml`)

**Trigger:** 
- Push to `main` or `develop` branches (when package files change)
- Manual trigger from Actions tab

**What it does:**
- Publishes canary/pre-release versions
- Version format: `1.0.0-alpha.0+sha123abc`
- Great for testing before official releases

**Usage:**
- Automatic on push to main/develop
- Or go to Actions → Publish Canary Packages → Run workflow

**Requirements:**
- `NPM_TOKEN` secret must be set

---

### 3. Version Packages (`version.yml`)

**Trigger:** Manual from GitHub Actions UI

**What it does:**
- Creates version bumps for packages
- Creates git tags
- Pushes tags (which triggers publish workflow)
- Creates GitHub releases

**Usage:**
1. Go to Actions tab
2. Select "Version Packages"
3. Click "Run workflow"
4. Choose version bump:
   - `patch` - Bug fixes (1.0.0 → 1.0.1)
   - `minor` - New features (1.0.0 → 1.1.0)
   - `major` - Breaking changes (1.0.0 → 2.0.0)
   - `prerelease` - Alpha versions (1.0.0 → 1.0.1-alpha.0)

**Requirements:**
- Default `GITHUB_TOKEN` (automatically provided)

---

## Setup Instructions

### 1. Create NPM Token

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Go to Account Settings → Access Tokens
3. Click "Generate New Token" → "Classic Token"
4. Select **Automation** type
5. Copy the token

### 2. Add Token to GitHub

1. Go to repository Settings
2. Navigate to Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your NPM token
6. Click "Add secret"

### 3. Verify Setup

```bash
# Push a test tag
git tag test@0.0.1-test
git push origin test@0.0.1-test

# Check Actions tab to see if workflow runs
```

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────┐
│  Developer Actions                                   │
└─────────────────┬───────────────────────────────────┘
                  │
       ┌──────────┼──────────┐
       │          │          │
       ▼          ▼          ▼
   Push Tag   Push Code   Manual
   (v1.0.0)   (main)      Trigger
       │          │          │
       ▼          ▼          ▼
  ┌────────┐ ┌─────────┐ ┌────────┐
  │Publish │ │ Canary  │ │Version │
  │Workflow│ │ Workflow│ │Workflow│
  └────┬───┘ └────┬────┘ └────┬───┘
       │          │          │
       ▼          ▼          ▼
  ┌─────────────────────────────┐
  │  Build → Test → Publish     │
  └──────────────┬──────────────┘
                 ▼
         NPM Registry
```

---

## Troubleshooting

### Workflow fails with "401 Unauthorized"

**Cause:** NPM token not set or invalid

**Solution:**
1. Check if `NPM_TOKEN` secret exists in repository settings
2. Verify token is still valid at npmjs.com
3. Regenerate token if needed and update secret

---

### Tests fail in CI but pass locally

**Cause:** Environment differences

**Solution:**
1. Check Node.js version matches (workflow uses v20)
2. Verify all dependencies are in package.json
3. Check for environment-specific issues
4. Review test logs in Actions tab

---

### Package already published error

**Cause:** Version already exists on NPM

**Solution:**
1. Increment version number
2. Use `pnpm run version:patch` or similar
3. Push new tag

---

### No packages to publish

**Cause:** Versions in package.json match NPM registry

**Solution:**
- This is normal! Only changed packages with new versions are published
- Use `pnpm lerna changed` to see what would be published
- Increment versions if you want to force publish

---

## Best Practices

1. **Use semantic versioning:**
   - `patch` (x.x.1) - Bug fixes
   - `minor` (x.1.x) - New features (backward compatible)
   - `major` (1.x.x) - Breaking changes

2. **Test before tagging:**
   ```bash
   pnpm run build
   pnpm run test
   pnpm run lint
   ```

3. **Use canary for testing:**
   - Test features in canary before official release
   - Canary versions won't affect your stable releases

4. **Conventional commits:**
   - Use conventional commit format
   - Helps generate changelogs automatically
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "chore: update dependencies"
   ```

5. **Monitor workflows:**
   - Check Actions tab after pushing tags
   - Review logs if workflow fails
   - Set up notifications for workflow failures

---

## Security Notes

- **Never commit NPM tokens** to the repository
- Use **Automation** tokens (not Publish tokens)
- Regularly rotate tokens
- Use **scoped tokens** if possible (limits what can be published)
- Review published packages on npmjs.com after releases

---

## Additional Resources

- [Lerna Documentation](https://lerna.js.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)

---

## Quick Commands Reference

```bash
# View packages
pnpm lerna ls

# Check what changed
pnpm lerna changed

# Manual publish
pnpm run publish:now

# Create and publish patch
pnpm run release:patch

# Canary release
pnpm run publish:canary
```
