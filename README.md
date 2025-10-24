# PorkAte Monorepo (CORRECTED)

Enterprise-grade wallet package with standalone adapter libraries.

## Packages

### Core Packages
- **[@porkate/core](packages/core)** - Wallet operations package
- **[@porkate/nosql](packages/nosql)** - NoSQL adapters (internal)

### Standalone Packages (Extraction-Ready)
- **[@invalid8/core](packages/standalone/invalid8)** - React Query-inspired caching library ✅
- **[@eventbus/core](packages/standalone/eventbus)** - Event system for cache invalidation ✅
- **[@townkrier/core](packages/standalone/townkrier)** - Laravel-style notification system ✅
- **[@kolo/core](packages/standalone/kolo)** - Storage adapter for documents ✅
- **[@porkate/payment](packages/standalone/payment)** - Payment gateway interface ✅
- **[@porkate/paystack](packages/standalone/paystack)** - Paystack adapter ✅
- **[@porkate/stripe](packages/standalone/stripe)** - Stripe adapter ✅
- **[@porkate/flutterwave](packages/standalone/flutterwave)** - Flutterwave adapter ✅

## Architecture

### Package Dependencies
```
@porkate/core
  ├── @invalid8/core (caching)
  │   └── @eventbus/core (cache invalidation events)
  ├── @townkrier/core (notifications: email, SMS, push)
  ├── @kolo/core (document storage: KYC docs)
  └── @porkate/payment (payment gateway interface)
      ├── @porkate/paystack
      ├── @porkate/stripe
      └── @porkate/flutterwave
```

### Key Differences from Previous Version
- **TownKrier** is now a **notification system** (like Laravel Notifications), NOT an event bus
- **EventBus** is a new package for cache invalidation and internal events
- **Payment adapters** are now separate packages (@porkate/paystack, @porkate/stripe, @porkate/flutterwave)

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Monorepo Structure

See [MONOREPO-STRUCTURE.md](docs/architecture/MONOREPO-STRUCTURE.md) for details.

## Package Extraction

Standalone packages can be extracted to separate repositories. See [PACKAGE-MIGRATION-GUIDE.md](docs/migration/PACKAGE-MIGRATION-GUIDE.md).

## Publishing

### Quick Publish Commands
```bash
# One-command releases
pnpm run release:patch    # Bug fixes: 1.0.0 → 1.0.1
pnpm run release:minor    # New features: 1.0.0 → 1.1.0
pnpm run release:major    # Breaking changes: 1.0.0 → 2.0.0
pnpm run release:alpha    # Test versions: 1.0.0 → 1.0.1-alpha.0

# Quick publish (without versioning)
pnpm run publish:now

# Canary/test releases
pnpm run publish:canary
```

### Automatic Publishing (GitHub Actions)
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0
```
→ Automatically builds, tests, and publishes to NPM

**Setup Required:**
1. Create NPM token at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. Add `NPM_TOKEN` to GitHub repository secrets

📚 **Full Guide:** See [PUBLISHING.md](PUBLISHING.md) for complete publishing documentation

## Documentation

- [PorkAte FRD](docs/product/PorkAte-FRD.md)
- [PorkAte TRD](docs/product/PorkAte-TRD.md)
- [Development TODO](docs/product/PorkAte-TODO.md)
- [TownKrier FRD](.docs/product/townkrier/TownKrier-FRD.md)
- [Publishing Guide](PUBLISHING.md) - NPM publishing documentation
- [NPM Quick Reference](.docs/npm-publishing-quickref.md)

## License

MIT
