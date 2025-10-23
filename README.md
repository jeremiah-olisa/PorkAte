# PorkAte Wallet SDK

Enterprise-grade wallet service SDK for Node.js applications.

## Features

- 🏦 **Double-Entry Ledger** - Financial accounting compliance
- 🔐 **Multi-Level Authentication** - Application + User level security
- 📊 **KYC Management** - CBN-compliant tier system
- 🔄 **Transaction Management** - Debit, Credit, Reversals
- 🔒 **Lien Management** - Fund reservation
- 📱 **Phone & QR Transfers** - Multiple transfer methods
- 🌍 **Multi-Currency Support** - Global transactions
- ⚡ **High Performance** - Redis caching, optimized queries

## Quick Start

### Installation

```bash
pnpm install @porkate/wallet-core @prisma/client
```

### Setup

1. **Configure your database**:

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/wallet_db"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

2. **Run migrations**:

```bash
npx prisma migrate dev
```

3. **Initialize in your NestJS app**:

```typescript
import { Module } from '@nestjs/common';
import { WalletSdkModule } from '@porkate/wallet-core';

@Module({
  imports: [
    WalletSdkModule.forRoot({
      database: {
        provider: 'postgresql',
        url: process.env.DATABASE_URL,
      },
      cache: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
      security: {
        enableHashValidation: true,
        hashAlgorithm: 'sha256',
      },
      transaction: {
        defaultStrategy: 'individual',
        enableIdempotency: true,
        idempotencyWindow: 24,
      },
      kyc: {
        profiles: ['individual', 'corporate'],
        tierConfig: CBN_TIER_CONFIG,
      },
    }),
  ],
})
export class AppModule {}
```

## Documentation

- [API Reference](./docs/api-reference.md)
- [Configuration Guide](./docs/configuration.md)
- [Migration Guide](./docs/migration-guide.md)
- [Examples](./examples)

## License

MIT © Jeremiah Olisa
