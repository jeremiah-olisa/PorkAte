#!/bin/bash

# PorkAte Wallet Package - Complete Project Setup Script
# Aligned with PorkAte FRD v2.0 - October 23, 2025
# Author: Jeremiah Olisa

set -e  # Exit on error

echo "🚀 PorkAte Wallet Package - Project Setup"
echo "=========================================="
echo "Package: PorkAte (pronounced 'Pocket')"
echo "Version: 1.0.0-alpha"
echo "FRD Version: 2.0"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js version: $NODE_VERSION"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing pnpm globally..."
    npm install -g pnpm
    echo "✅ pnpm installed successfully"
fi

PNPM_VERSION=$(pnpm -v)
echo "✅ pnpm version: $PNPM_VERSION"
echo ""

# Project name
PROJECT_NAME="porkate"

# Create root directory
echo "📁 Creating project structure..."
# mkdir -p $PROJECT_NAME
# cd $PROJECT_NAME

# Create pnpm workspace configuration
echo "📝 Creating pnpm workspace configuration..."
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
  - 'adapters/*'
  - 'examples/*'
EOF

# Initialize root package.json for pnpm workspace
cat > package.json << 'EOF'
{
  "name": "porkate",
  "version": "1.0.0-alpha.1",
  "private": true,
  "description": "Provider-agnostic, plug-and-play wallet package for fintech applications",
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/jeremiah-olisa/porkate.git"
  },
  "keywords": [
    "wallet",
    "fintech",
    "payments",
    "banking",
    "prisma",
    "typescript",
    "porkate",
    "digital-wallet",
    "financial-services"
  ],
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm -r --parallel dev",
    "test": "pnpm -r test",
    "test:cov": "pnpm -r test:cov",
    "lint": "pnpm -r lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "clean": "pnpm -r clean && rm -rf node_modules",
    "prisma:generate": "pnpm --filter @porkate/core prisma:generate",
    "prisma:migrate": "pnpm --filter @porkate/core prisma:migrate",
    "prisma:studio": "pnpm --filter @porkate/core prisma:studio",
    "prisma:seed": "pnpm --filter @porkate/core prisma:seed"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "prettier": "^3.2.5",
    "typescript": "^5.3.3",
    "turbo": "^1.12.4"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.4"
}
EOF

# Create directory structure aligned with FRD
echo "📂 Creating comprehensive directory structure..."
mkdir -p packages/core/src/{modules/{wallet,transaction,kyc,lien,auth,ledger,event},providers/{database,cache,queue,storage,notification,payment-gateway},common/{decorators,filters,interceptors,pipes,guards,utils,errors},config,constants,types,interfaces}
mkdir -p packages/core/prisma/{migrations,seeds}
mkdir -p packages/core/test/{unit,integration,e2e}

# Adapter packages (Provider Agnostic Architecture - FRD Section 2.2)
mkdir -p adapters/cache/{redis,memory}/src
# mkdir -p adapters/cache/memory/src
mkdir -p adapters/nosql/{cassandra,mongodb}/src
# mkdir -p adapters/nosql/mongodb/src
mkdir -p adapters/event/{rabbitmq,kafka}/src
# mkdir -p adapters/event/kafka/src
mkdir -p adapters/payment/{paystack,flutterwave}/src
# mkdir -p adapters/payment/flutterwave/src
mkdir -p adapters/storage/{s3,local}/src
# mkdir -p adapters/storage/local/src

# Examples
mkdir -p examples/{basic-usage,nestjs-integration,express-integration}/src

# Documentation (FRD Section 12)
mkdir -p docs/{getting-started,api-reference,guides,examples,architecture}

# Scripts and tools
mkdir -p scripts
mkdir -p .github/workflows

echo "✅ Directory structure created"
echo ""

# Create core package
echo ""
echo "📦 Setting up core package..."
cd packages/core

# Core package.json
cat > package.json << 'EOF'
{
  "name": "@porkate/wallet-core",
  "version": "1.0.0",
  "description": "Core wallet service SDK",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "wallet",
    "fintech",
    "payments",
    "nestjs",
    "prisma",
    "banking"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "peerDependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "dependencies": {
    "@nestjs/bull": "^10.0.1",
    "@nestjs/config": "^3.1.1",
    "bull": "^4.11.5",
    "ioredis": "^5.3.2",
    "cassandra-driver": "^4.7.2",
    "libphonenumber-js": "^1.10.44",
    "qrcode": "^1.5.3",
    "uuid": "^9.0.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@prisma/client": "^5.5.2",
    "@types/bull": "^4.10.0",
    "@types/jest": "^29.5.5",
    "@types/node": "^20.8.7",
    "@types/qrcode": "^1.5.5",
    "@types/uuid": "^9.0.6",
    "jest": "^29.7.0",
    "prisma": "^5.5.2",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0"
  }
}
EOF

# TypeScript configuration for core
cat > tsconfig.json << 'EOF'
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
    "baseUrl": "./",
    "rootDir": "./src",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["src/*"],
      "@modules/*": ["src/modules/*"],
      "@providers/*": ["src/providers/*"],
      "@common/*": ["src/common/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
EOF

# Jest configuration
cat > jest.config.js << 'EOF'
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
    '^@providers/(.*)$': '<rootDir>/providers/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
  },
};
EOF

# Prisma schema
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Application {
  id           String   @id @default(cuid())
  name         String
  publicKey    String   @unique
  secretKey    String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  wallets      Wallet[]
  
  @@map("applications")
}

model Wallet {
  id              String    @id @default(cuid())
  accountNumber   String    @unique
  phoneNumber     String    @unique
  balance         Decimal   @default(0) @db.Decimal(18, 2)
  currency        String    @default("NGN")
  accountType     String
  status          String
  hashValue       String
  
  applicationId   String
  application     Application @relation(fields: [applicationId], references: [id])
  
  kyc             KYC?
  ledgers         Ledger[]
  liens           Lien[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([phoneNumber])
  @@index([accountNumber])
  @@index([applicationId])
  @@map("wallets")
}

model KYC {
  id              String    @id @default(cuid())
  walletId        String    @unique
  wallet          Wallet    @relation(fields: [walletId], references: [id], onDelete: Cascade)
  
  profileType     String
  tier            Int       @default(1)
  
  fullName        String?
  email           String?
  phoneNumber     String
  address         String?
  
  bvn             String?
  nin             String?
  dateOfBirth     DateTime?
  
  companyName     String?
  rcNumber        String?
  taxId           String?
  
  groupName       String?
  groupType       String?
  
  documents       Json?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("kyc_records")
}

model Ledger {
  id              String    @id @default(cuid())
  walletId        String
  wallet          Wallet    @relation(fields: [walletId], references: [id])
  
  entryType       String
  amount          Decimal   @db.Decimal(18, 2)
  previousBalance Decimal   @db.Decimal(18, 2)
  currentBalance  Decimal   @db.Decimal(18, 2)
  
  transactionRef  String
  narration       String
  
  createdAt       DateTime  @default(now())
  
  @@index([walletId])
  @@index([transactionRef])
  @@index([createdAt])
  @@map("ledgers")
}

model Lien {
  id              String    @id @default(cuid())
  walletId        String
  wallet          Wallet    @relation(fields: [walletId], references: [id])
  
  amount          Decimal   @db.Decimal(18, 2)
  reason          String
  isActive        Boolean   @default(true)
  
  transactionRef  String?
  
  createdAt       DateTime  @default(now())
  releasedAt      DateTime?
  
  @@index([walletId, isActive])
  @@map("liens")
}
EOF

# Create .env.example
cat > .env.example << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/porkate_wallet?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Cassandra (Optional - for WalletTransactions)
CASSANDRA_CONTACT_POINTS="localhost"
CASSANDRA_LOCAL_DATACENTER="datacenter1"
CASSANDRA_KEYSPACE="porkate_transactions"

# Security
HASH_ALGORITHM="sha256"
ENABLE_HASH_VALIDATION=true

# Transaction
DEFAULT_TRANSACTION_STRATEGY="individual"
ENABLE_IDEMPOTENCY=true
IDEMPOTENCY_WINDOW_HOURS=24
EOF

# Create main index file
cat > src/index.ts << 'EOF'
// Main SDK exports
export * from './wallet-sdk.module';

// Module exports
export * from './modules/wallet/wallet.module';
export * from './modules/wallet/wallet.service';
export * from './modules/transaction/transaction.module';
export * from './modules/transaction/transaction.service';
export * from './modules/kyc/kyc.module';
export * from './modules/kyc/kyc.service';
export * from './modules/lien/lien.module';
export * from './modules/lien/lien.service';
export * from './modules/auth/auth.module';
export * from './modules/ledger/ledger.module';

// DTOs and Interfaces
export * from './modules/wallet/dto';
export * from './modules/transaction/dto';
export * from './modules/kyc/dto';
export * from './types';

// Decorators and Guards
export * from './common/decorators';
export * from './common/guards';

// Configuration
export * from './config/wallet.config';
EOF

# Create main module file
cat > src/wallet-sdk.module.ts << 'EOF'
import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { KYCModule } from './modules/kyc/kyc.module';
import { LienModule } from './modules/lien/lien.module';
import { AuthModule } from './modules/auth/auth.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { PrismaModule } from './providers/database/prisma.module';
import { RedisModule } from './providers/cache/redis.module';
import { WALLET_CONFIG } from './constants';
import { WalletModuleOptions } from './types';

@Global()
@Module({})
export class WalletSdkModule {
  static forRoot(options: WalletModuleOptions): DynamicModule {
    return {
      module: WalletSdkModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        PrismaModule.forRoot(options.database),
        RedisModule.forRoot(options.cache),
        WalletModule,
        TransactionModule,
        KYCModule,
        LienModule,
        AuthModule,
        LedgerModule,
      ],
      providers: [
        {
          provide: WALLET_CONFIG,
          useValue: options,
        },
      ],
      exports: [
        WALLET_CONFIG,
        PrismaModule,
        RedisModule,
        WalletModule,
        TransactionModule,
        KYCModule,
        LienModule,
        AuthModule,
        LedgerModule,
      ],
    };
  }

  static forRootAsync(options: any): DynamicModule {
    return {
      module: WalletSdkModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ...(options.imports || []),
      ],
      providers: [
        {
          provide: WALLET_CONFIG,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
    };
  }
}
EOF

# Create constants
cat > src/constants/index.ts << 'EOF'
export const WALLET_CONFIG = 'WALLET_CONFIG';

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum AccountType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum LedgerEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum KYCProfileType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  GROUP = 'GROUP',
}

export enum KYCTier {
  TIER_1 = 1,
  TIER_2 = 2,
  TIER_3 = 3,
}
EOF

# Create types
cat > src/types/index.ts << 'EOF'
export interface WalletModuleOptions {
  database: DatabaseConfig;
  nosql?: NoSQLConfig;
  cache: CacheConfig;
  queue?: QueueConfig;
  security: SecurityConfig;
  transaction: TransactionConfig;
  kyc: KYCConfig;
  features?: FeatureFlags;
}

export interface DatabaseConfig {
  provider: 'postgresql' | 'mysql' | 'sqlite';
  url: string;
}

export interface NoSQLConfig {
  provider: 'cassandra' | 'mongodb';
  contactPoints?: string[];
  connectionString?: string;
  keyspace?: string;
}

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

export interface SecurityConfig {
  enableHashValidation: boolean;
  hashAlgorithm: 'sha256' | 'sha512';
}

export interface TransactionConfig {
  defaultStrategy: 'individual' | 'business';
  enableIdempotency: boolean;
  idempotencyWindow: number;
}

export interface KYCConfig {
  tierConfig: TierConfiguration;
  profiles: ('individual' | 'corporate' | 'group')[];
}

export interface TierConfiguration {
  tier1: TierConfig;
  tier2: TierConfig;
  tier3: TierConfig;
}

export interface TierConfig {
  name: string;
  dailyLimit: number;
  monthlyLimit: number;
  singleTransactionLimit: number;
  cumulativeBalance: number;
  requiredDocuments: string[];
}

export interface FeatureFlags {
  multiCurrency?: boolean;
  qrCodeTransfer?: boolean;
  phoneTransfer?: boolean;
}
EOF

# Back to root directory
cd ../..

# Create root .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Prisma
prisma/migrations/**/migration.sql

# Misc
.cache/
temp/
EOF

# Create README
cat > README.md << 'EOF'
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
EOF

# Create prettier config
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
EOF

# Create ESLint config
cat > .eslintrc.js << 'EOF'
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
EOF

echo ""
echo "✅ Project structure created successfully!"
echo ""
echo "📦 Installing dependencies (this may take a few minutes)..."

# Install root dependencies
pnpm install

# Install core package dependencies
cd packages/core
pnpm install

cd ../..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "  1. cd $PROJECT_NAME"
echo "  2. Copy .env.example to .env and configure your database"
echo "  3. Run 'npm run prisma:migrate' to setup database schema"
echo "  4. Start building your wallet service!"
echo ""
echo "Useful commands:"
echo "  npm run build              - Build all packages"
echo "  npm run prisma:studio      - Open Prisma Studio"
echo "  npm run test               - Run tests"
echo ""