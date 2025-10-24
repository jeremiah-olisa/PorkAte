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

## Documentation

- [PorkAte FRD](docs/product/PorkAte-FRD.md)
- [PorkAte TRD](docs/product/PorkAte-TRD.md)
- [Development TODO](docs/product/PorkAte-TODO.md)
- [TownKrier FRD](.docs/product/townkrier/TownKrier-FRD.md)

## License

MIT
