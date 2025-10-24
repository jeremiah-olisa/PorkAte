# NPM Publishing Setup - Implementation Summary

## ✅ What Was Created

### 1. GitHub Actions Workflows

#### `.github/workflows/publish.yml`
- **Trigger:** When you push version tags (e.g., `v1.0.0`, `@porkate/payment@1.0.0`)
- **Actions:**
  - Builds all packages
  - Runs tests
  - Publishes to NPM
  - Creates GitHub release
- **Requires:** `NPM_TOKEN` secret in GitHub

#### `.github/workflows/publish-canary.yml`
- **Trigger:** Push to `main` or `develop` branches (automatic)
- **Actions:**
  - Publishes canary/test versions
  - Format: `1.0.0-alpha.0+sha123`
- **Use case:** Testing before official releases

#### `.github/workflows/version.yml`
- **Trigger:** Manual from GitHub Actions UI
- **Actions:**
  - Creates version bumps (patch/minor/major/prerelease)
  - Creates and pushes tags
  - Triggers publish workflow automatically

### 2. CLI Commands (Added to package.json)

#### Quick Release Commands (Build + Version + Publish)
```bash
pnpm run release:patch      # Bug fixes
pnpm run release:minor      # New features
pnpm run release:major      # Breaking changes
pnpm run release:alpha      # Alpha/test versions
```

#### Versioning Only Commands
```bash
pnpm run version:patch      # 1.0.0 → 1.0.1
pnpm run version:minor      # 1.0.0 → 1.1.0
pnpm run version:major      # 1.0.0 → 2.0.0
pnpm run version:prerelease # 1.0.0 → 1.0.1-alpha.0
```

#### Publishing Only Commands
```bash
pnpm run publish:now        # Publish current versions
pnpm run publish:ci         # Publish in CI (with --yes flag)
pnpm run publish:canary     # Publish canary version
```

### 3. Documentation Files

#### `PUBLISHING.md` (Main Guide)
Complete publishing documentation including:
- Prerequisites and setup
- Automatic publishing (GitHub Actions)
- Manual publishing (CLI)
- Step-by-step workflows
- Troubleshooting
- Best practices

#### `.docs/npm-publishing-quickref.md` (Quick Reference)
One-page quick reference card with:
- Most common commands
- Setup checklist
- Quick troubleshooting

#### `.github/workflows/README.md` (CI/CD Documentation)
GitHub Actions documentation with:
- Workflow descriptions
- Setup instructions
- Workflow diagram
- Troubleshooting guide

### 4. Setup Script

#### `scripts/setup/setup-npm-publishing.sh`
Interactive setup script that:
- Checks NPM authentication
- Validates package configurations
- Tests build process
- Provides GitHub secrets setup instructions

## 🚀 How to Use

### Option 1: Automatic Publishing (Recommended)

1. **Setup (One-time):**
   ```bash
   # Run setup script
   ./scripts/setup/setup-npm-publishing.sh
   
   # Create NPM token at npmjs.com
   # Add NPM_TOKEN to GitHub secrets
   ```

2. **Publishing:**
   ```bash
   # Make changes, commit
   git add .
   git commit -m "feat: add new feature"
   
   # Push with tag
   git tag v1.0.0
   git push origin v1.0.0
   ```
   
3. **Result:**
   - GitHub Actions automatically builds, tests, and publishes
   - Creates GitHub release
   - All done! ✨

### Option 2: CLI Publishing

1. **Quick Release:**
   ```bash
   pnpm run release:patch  # or minor, major, alpha
   git push origin main --follow-tags
   ```

2. **Two-Step Process:**
   ```bash
   # Step 1: Version
   pnpm run version:patch
   
   # Step 2: Publish
   pnpm run publish:now
   
   # Step 3: Push
   git push origin main --follow-tags
   ```

### Option 3: Test/Canary Publishing

```bash
# Quick test version
pnpm run publish:canary
```

## 📋 Setup Checklist

- [ ] Run `npm login` for local publishing
- [ ] Run `./scripts/setup/setup-npm-publishing.sh`
- [ ] Create NPM automation token at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
- [ ] Add `NPM_TOKEN` to [GitHub Secrets](https://github.com/jeremiah-olisa/porkate/settings/secrets/actions)
- [ ] Test with canary: `pnpm run publish:canary`
- [ ] Try GitHub Actions: `git tag test@0.0.1 && git push origin test@0.0.1`

## 🔑 GitHub Secrets Setup

1. **Create NPM Token:**
   - Go to: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token" → "Classic Token"
   - Select **"Automation"** type
   - Copy token

2. **Add to GitHub:**
   - Go to: https://github.com/jeremiah-olisa/porkate/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: (paste token)
   - Click "Add secret"

## 📊 Publishing Flow Comparison

### GitHub Actions (Tag-Based)
```
Code Changes → Commit → Create Tag → Push Tag
                                       ↓
                          GitHub Actions Workflow
                                       ↓
                     Build → Test → Publish → Release
```

### CLI (Direct)
```
Code Changes → Commit → Run release:patch
                                ↓
                    Build → Version → Publish
                                ↓
                           Push with tags
```

### Canary (Testing)
```
Code Changes → Commit → Run publish:canary
                                ↓
                         Publish test version
                         (1.0.0-alpha.0+sha123)
```

## 🎯 Use Cases

### Bug Fix Release
```bash
pnpm run release:patch
git push origin main --follow-tags
```

### New Feature Release
```bash
pnpm run release:minor
git push origin main --follow-tags
```

### Breaking Change Release
```bash
pnpm run release:major
git push origin main --follow-tags
```

### Test/Preview Release
```bash
pnpm run publish:canary
# No need to push, canary is temporary
```

### Automatic on Tag
```bash
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions handles everything
```

## 🔍 Verification Commands

```bash
# Check what packages exist
pnpm lerna ls

# Check what would be published
pnpm lerna changed

# Check NPM login
npm whoami

# View package versions
cat packages/*/package.json | grep version
```

## ⚠️ Important Notes

1. **NPM Login Required:** Run `npm login` before local publishing
2. **Build Before Publish:** Release commands automatically build
3. **Tests Must Pass:** GitHub Actions won't publish if tests fail
4. **Semantic Versioning:** Use appropriate version bumps
5. **Push Tags:** Always use `--follow-tags` when pushing
6. **Canary is Temporary:** Use for testing only
7. **Token Security:** Never commit NPM tokens to git

## 🐛 Troubleshooting

### "Not logged in to NPM"
```bash
npm login
```

### "Package already exists"
```bash
# Version already published, increment version
pnpm run version:patch
```

### "GitHub Actions failing"
- Check Actions tab for logs
- Verify NPM_TOKEN secret is set
- Check if tests are passing locally

### "No packages to publish"
- This is normal if versions haven't changed
- Use `pnpm lerna changed` to check
- Increment versions if needed

## 📚 Documentation Links

- [PUBLISHING.md](../PUBLISHING.md) - Complete publishing guide
- [.docs/npm-publishing-quickref.md](../.docs/npm-publishing-quickref.md) - Quick reference
- [.github/workflows/README.md](../.github/workflows/README.md) - CI/CD guide

## 🎉 Summary

You now have three ways to publish:

1. **🤖 Automatic:** Push tags → GitHub Actions handles everything
2. **⚡ CLI Quick:** `pnpm run release:patch` → Done
3. **🧪 Canary:** `pnpm run publish:canary` → Test version

Choose what works best for your workflow!
