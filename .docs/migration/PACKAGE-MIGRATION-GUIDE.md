# Package Migration Guide

## Moving Standalone Packages to Separate Repositories

This guide documents the process for extracting standalone packages (`@invalid8/core`, `@townkrier/core`, `@kolo/core`) from the PorkAte monorepo into independent repositories.

---

## Table of Contents

1. [Overview](#overview)
2. [Why Extract Packages](#why-extract-packages)
3. [Pre-Migration Checklist](#pre-migration-checklist)
4. [Migration Process](#migration-process)
5. [Post-Migration Updates](#post-migration-updates)
6. [Rollback Strategy](#rollback-strategy)
7. [Best Practices](#best-practices)

---

## Overview

### Extraction-Ready Packages

The following packages are designed for zero-change extraction:

| Package | Purpose | Dependencies | Status |
|---------|---------|--------------|--------|
| `@townkrier/core` | Event system | None | ✅ No external deps |
| `@kolo/core` | Storage adapter | None | ✅ No external deps |
| `@invalid8/core` | Caching library | `@townkrier/core` | ✅ Uses workspace protocol |

### Why These Packages are Extraction-Ready

1. **Complete Independence**: No imports from `@porkate/core`
2. **Own Documentation**: Full README, LICENSE, and examples
3. **Own Configuration**: `package.json`, `tsconfig.json`, `jest.config.js`
4. **Own Tests**: Unit and integration tests
5. **Workspace Protocol**: Uses `workspace:*` for inter-standalone deps
6. **Standard Structure**: Follows npm package conventions

---

## Why Extract Packages

### Benefits

#### For Package Maintainers
- **Faster CI/CD**: Smaller repos = faster builds and tests
- **Clearer Issues**: Package-specific issue tracking
- **Independent Releases**: Version and publish without affecting other packages
- **Dedicated Contributors**: Easier for external contributors to focus

#### For Users
- **Lighter Install**: No monorepo overhead
- **Clear Versioning**: Semver applies to specific package
- **Standalone Docs**: Package-specific documentation site
- **Better Discovery**: Separate GitHub repos increase visibility

#### For PorkAte
- **Reduced Complexity**: Smaller core repository
- **Flexible Adoption**: Users can use adapters without PorkAte
- **Community Growth**: Standalone packages attract broader audience

### When to Extract

✅ **Extract When:**
- Package has independent use cases outside PorkAte
- Package has 5+ external users
- Package requires different release cadence
- Package attracts separate contributor community

❌ **Don't Extract When:**
- Package is tightly coupled to PorkAte core
- Package has no use outside PorkAte
- Maintenance overhead outweighs benefits

---

## Pre-Migration Checklist

### Package Readiness

- [ ] **Complete `package.json`**
  - [ ] Correct `name`, `version`, `description`
  - [ ] `main` and `types` entry points defined
  - [ ] `scripts` for build, test, publish
  - [ ] `keywords` for npm discoverability
  - [ ] `repository`, `bugs`, `homepage` URLs (will update post-extraction)
  - [ ] `publishConfig` with `access: public`

- [ ] **Documentation**
  - [ ] Comprehensive `README.md`
  - [ ] Separate `LICENSE` file (MIT)
  - [ ] API documentation
  - [ ] Usage examples
  - [ ] Migration guide (if breaking changes)

- [ ] **Configuration Files**
  - [ ] `tsconfig.json` (extends base or standalone)
  - [ ] `jest.config.js` (if applicable)
  - [ ] `.npmignore` (excludes tests, docs, etc.)
  - [ ] `.eslintrc.js` (if package-specific rules)

- [ ] **Testing**
  - [ ] Unit tests passing
  - [ ] Integration tests passing
  - [ ] Coverage > 80%
  - [ ] No tests depend on other monorepo packages

- [ ] **Dependencies**
  - [ ] No direct imports from `@porkate/core`
  - [ ] Workspace deps use `workspace:*` protocol
  - [ ] All deps listed in `dependencies` or `devDependencies`

- [ ] **CI/CD**
  - [ ] GitHub Actions workflow exists
  - [ ] Workflow tested in monorepo
  - [ ] npm authentication configured

- [ ] **Version Control**
  - [ ] All changes committed
  - [ ] No pending pull requests
  - [ ] Tagged release in monorepo (e.g., `invalid8/v1.0.0`)

---

## Migration Process

### Step 1: Prepare New Repository

```bash
# Create new repository on GitHub
# Example: https://github.com/jeremiah-olisa/invalid8

# Clone new repository
git clone https://github.com/jeremiah-olisa/invalid8.git
cd invalid8
```

### Step 2: Extract Package with Git History

Using `git subtree` to preserve commit history:

```bash
# In the PorkAte monorepo
cd /path/to/porkate

# Create a branch with only the package's history
git subtree split --prefix=standalone-packages/invalid8 -b invalid8-extract

# In the new repository
cd /path/to/invalid8

# Pull the extracted branch
git pull /path/to/porkate invalid8-extract

# Push to new repo
git push origin main
```

**Alternative: Manual Copy (simpler, no history)**

```bash
# In the new repository
cd /path/to/invalid8

# Copy package files
cp -r /path/to/porkate/standalone-packages/invalid8/* .

# Initialize git
git init
git add .
git commit -m "chore: initial commit - extracted from porkate monorepo"
git remote add origin https://github.com/jeremiah-olisa/invalid8.git
git push -u origin main
```

### Step 3: Update `package.json` in New Repo

```json
{
  "name": "@invalid8/core",
  "version": "1.0.0",
  "description": "React Query-inspired caching library for JavaScript/TypeScript",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "repository": {
    "type": "git",
    "url": "https://github.com/jeremiah-olisa/invalid8.git"
  },
  "bugs": {
    "url": "https://github.com/jeremiah-olisa/invalid8/issues"
  },
  "homepage": "https://github.com/jeremiah-olisa/invalid8#readme",
  "dependencies": {
    "@townkrier/core": "^1.0.0"  // ⬅️ Changed from "workspace:*"
  }
}
```

### Step 4: Update TypeScript Configuration

If the package extended `../../tsconfig.base.json`:

**Before (in monorepo):**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**After (standalone):**
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### Step 5: Setup GitHub Actions in New Repo

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:cov
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Step 6: Test in New Repository

```bash
# In new repo
cd /path/to/invalid8

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Test publishing (dry run)
npm publish --dry-run
```

### Step 7: Publish First Version

```bash
# In new repo
cd /path/to/invalid8

# Ensure version is correct
npm version 1.0.0 --no-git-tag-version

# Publish to npm
npm publish --access public
```

### Step 8: Update PorkAte Monorepo

```bash
# In PorkAte monorepo
cd /path/to/porkate

# Remove standalone package directory
rm -rf standalone-packages/invalid8

# Update packages that depend on it
cd packages/core
```

Update `packages/core/package.json`:

```json
{
  "dependencies": {
    "@invalid8/core": "^1.0.0"  // ⬅️ Changed from "workspace:*"
  }
}
```

Update `pnpm-workspace.yaml` (remove from packages list if using explicit list):

```yaml
packages:
  - 'packages/*'
  - 'standalone-packages/townkrier'  # invalid8 removed
  - 'standalone-packages/kolo'
  - 'examples/*'
```

Update `lerna.json` (if using explicit packages):

```json
{
  "packages": [
    "packages/*",
    "standalone-packages/townkrier",
    "standalone-packages/kolo"
  ]
}
```

Reinstall dependencies:

```bash
# In PorkAte root
pnpm install

# Test that everything works
pnpm build
pnpm test
```

Commit changes:

```bash
git add .
git commit -m "chore: extract @invalid8/core to separate repository

@invalid8/core is now published as a standalone package at:
https://github.com/jeremiah-olisa/invalid8

Breaking change: @invalid8/core is no longer part of this monorepo"

git push
```

### Step 9: Update Documentation

Update relevant docs in PorkAte:

- `README.md`: Link to external repo
- `docs/product/PorkAte-FRD.md`: Update adapter references
- `docs/product/PorkAte-TRD.md`: Update technology stack section
- `docs/architecture/MONOREPO-STRUCTURE.md`: Remove from standalone packages

### Step 10: Announce Migration

1. **GitHub Release** in PorkAte repo:
   ```
   ## @invalid8/core Extracted
   
   The `@invalid8/core` caching library has been extracted to its own repository:
   https://github.com/jeremiah-olisa/invalid8
   
   You can now install it independently:
   ```bash
   npm install @invalid8/core
   ```
   
   See migration guide: [PACKAGE-MIGRATION-GUIDE.md](docs/migration/PACKAGE-MIGRATION-GUIDE.md)
   ```

2. **npm Deprecation Notice** (for old workspace package):
   ```bash
   npm deprecate @invalid8/core@1.0.0-alpha.x "Package moved to standalone repo: https://github.com/jeremiah-olisa/invalid8"
   ```

3. **Update Links**:
   - npm package page
   - Documentation sites
   - Blog posts
   - Social media

---

## Post-Migration Updates

### New Repository Setup

- [ ] Enable GitHub Issues
- [ ] Enable GitHub Discussions
- [ ] Setup GitHub Projects (if needed)
- [ ] Configure branch protection rules
- [ ] Add contributors
- [ ] Setup Dependabot
- [ ] Add badges to README (CI, coverage, npm version)
- [ ] Create documentation site (GitHub Pages, Vercel, etc.)
- [ ] Register package on npm trends

### Maintenance

- [ ] Monitor Issues in new repo
- [ ] Update dependencies regularly
- [ ] Publish patch/minor/major versions
- [ ] Keep monorepo in sync (if still used there)

---

## Rollback Strategy

If extraction causes issues:

### Immediate Rollback (< 24 hours)

```bash
# In PorkAte monorepo
cd /path/to/porkate

# Restore package from git history
git checkout HEAD~1 standalone-packages/invalid8

# Unpublish from npm (within 72 hours of publish)
npm unpublish @invalid8/core@1.0.0 --force

# Revert monorepo changes
git revert HEAD
git push
```

### Long-term Rollback (> 24 hours)

If package is already in use:

1. Keep extracted package published
2. Re-add to monorepo as vendored copy
3. Use both:
   - Monorepo version: `workspace:*`
   - Standalone version: Published to npm
4. Gradually migrate users back (or forward)

---

## Best Practices

### Version Numbering

- **First standalone release**: `1.0.0` (not `1.0.0-alpha.1`)
- **Breaking changes**: Major version bump
- **New features**: Minor version bump
- **Bug fixes**: Patch version bump

### Documentation

- Keep README comprehensive and up-to-date
- Include migration guide for breaking changes
- Document all public APIs with examples
- Maintain CHANGELOG.md

### Testing

- Maintain high test coverage (>80%)
- Test against multiple Node.js versions
- Test with actual dependents (e.g., `@porkate/core`)

### Communication

- Announce migrations in advance (2-4 weeks notice)
- Provide migration guides
- Answer questions promptly
- Update all documentation references

---

## Example: Full Migration (@invalid8/core)

### Before

```
porkate/
├── standalone-packages/
│   └── invalid8/           # ⬅️ Part of monorepo
│       ├── package.json    # "workspace:*" deps
│       └── src/
└── packages/
    └── core/
        └── package.json    # "@invalid8/core": "workspace:*"
```

### After

```
# New repo: https://github.com/jeremiah-olisa/invalid8
invalid8/
├── package.json            # ⬅️ Standalone, "^1.0.0" deps
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── publish.yml
└── src/

# PorkAte monorepo
porkate/
└── packages/
    └── core/
        └── package.json    # "@invalid8/core": "^1.0.0"
```

---

## Troubleshooting

### Dependency Resolution

**Problem**: Package can't find workspace dependency after extraction

**Solution**: Update `package.json` to use npm version:
```json
{
  "dependencies": {
    "@townkrier/core": "^1.0.0"  // Not "workspace:*"
  }
}
```

### Build Failures

**Problem**: Build fails due to missing TypeScript config

**Solution**: Copy base config into standalone `tsconfig.json`

### Test Failures

**Problem**: Tests fail due to missing test utilities from monorepo

**Solution**: Copy shared test utilities into package or create separate `@porkate/test-utils` package

### Version Conflicts

**Problem**: Monorepo uses different version than published package

**Solution**: Keep versions in sync or use version ranges in `package.json`

---

## Migration Timeline

### Invalid8 Migration

- **Week 1**: Prepare package, update docs, test extraction
- **Week 2**: Create new repo, extract with history, setup CI/CD
- **Week 3**: Publish to npm, update monorepo, announce
- **Week 4**: Monitor issues, provide support

### TownKrier Migration

- **Week 5-8**: Same process as Invalid8
- **Note**: Must complete before or with Invalid8 (dependency)

### Kolo Migration

- **Week 9-12**: Same process, independent timeline

---

## Additional Resources

- [Lerna Package Management](https://lerna.js.org/)
- [PNPM Workspace Protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
- [Git Subtree Tutorial](https://www.atlassian.com/git/tutorials/git-subtree)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

---

**Last Updated:** October 24, 2025  
**Document Version:** 1.0  
**Maintainer:** Jeremiah Olisa
