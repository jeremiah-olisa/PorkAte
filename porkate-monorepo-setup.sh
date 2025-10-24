#!/usr/bin/env bash

# PorkAte Wallet Package - Complete Monorepo Setup Script
# Lerna + PNPM Monorepo with Standalone Extractable Packages
# Aligned with PorkAte FRD v2.0 - October 24, 2025
# Author: Jeremiah Olisa
#
# This script creates a monorepo with:
# - @porkate/core (wallet package)
# - @porkate/nosql (internal nosql adapter)
# - @invalid8/core (standalone caching library - extraction-ready)
# - @townkrier/core (standalone event system - extraction-ready)
# - @kolo/core (standalone storage adapter - extraction-ready)

set -e  # Exit on error

echo "🚀 PorkAte Wallet Package - Lerna Monorepo Setup"
echo "=================================================="
echo "Package: PorkAte (pronounced 'Pocket')"
echo "Version: 1.0.0-alpha"
echo "FRD Version: 2.0"
echo "Architecture: Lerna + PNPM Monorepo"
echo "Database: ZenStack (Multi-Provider Support)"
echo "Standalone Packages:"
echo "  - Invalid8 (Caching - extraction-ready)"
echo "  - TownKrier (Events - extraction-ready)"
echo "  - Kolo (Storage - extraction-ready)"
echo "=================================================="
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

# Check if Lerna is installed globally, if not install it
if ! command -v lerna &> /dev/null; then
    echo "⚠️  Lerna is not installed. Installing Lerna globally..."
    npm install -g lerna
    echo "✅ Lerna installed successfully"
fi

LERNA_VERSION=$(lerna -v)
echo "✅ Lerna version: $LERNA_VERSION"
echo ""

# =============================================================================
# MONOREPO ROOT CONFIGURATION
# =============================================================================

echo "📁 Creating Lerna monorepo structure..."

# Initialize Lerna monorepo
echo "🔧 Creating lerna.json configuration..."
cat > lerna.json << 'EOF'
{
  "$schema": "node_modules/lerna/schemas/lerna-schema.json",
  "version": "independent",
  "npmClient": "pnpm",
  "useWorkspaces": true,
  "command": {
    "publish": {
      "conventionalCommits": true,
      "message": "chore(release): publish packages",
      "registry": "https://registry.npmjs.org/"
    },
    "version": {
      "allowBranch": ["main", "develop"],
      "message": "chore(release): version packages"
    }
  },
  "packages": [
    "packages/*",
    "standalone-packages/*"
  ]
}
EOF

# Create pnpm workspace configuration
echo "📝 Creating pnpm workspace configuration..."
cat > pnpm-workspace.yaml << 'EOF'
packages:
  # Core PorkAte packages (non-extractable)
  - 'packages/*'
  
  # Standalone packages (extraction-ready - can move to separate repos)
  - 'standalone-packages/*'
  
  # Examples
  - 'examples/*'
EOF

# Initialize root package.json
echo "📦 Creating root package.json..."
cat > package.json << 'EOF'
{
  "name": "porkate-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "Provider-agnostic wallet package with standalone adapters (Invalid8, TownKrier, Kolo)",
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
    "monorepo",
    "lerna",
    "invalid8",
    "townkrier",
    "kolo",
    "zenstack"
  ],
  "scripts": {
    "bootstrap": "lerna bootstrap",
    "build": "lerna run build --stream",
    "build:core": "lerna run build --scope=@porkate/core --stream",
    "build:invalid8": "lerna run build --scope=@invalid8/core --stream",
    "build:townkrier": "lerna run build --scope=@townkrier/core --stream",
    "build:kolo": "lerna run build --scope=@kolo/core --stream",
    "dev": "lerna run dev --parallel",
    "test": "lerna run test --stream",
    "test:cov": "lerna run test:cov --stream",
    "lint": "lerna run lint --stream",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "clean": "lerna clean -y && rm -rf node_modules",
    "clean:build": "lerna run clean --stream",
    "version": "lerna version --conventional-commits",
    "publish": "lerna publish from-package",
    "publish:canary": "lerna publish --canary",
    "zenstack:generate": "lerna run zenstack:generate --scope=@porkate/core",
    "prisma:studio": "lerna run prisma:studio --scope=@porkate/core",
    "prisma:migrate": "lerna run prisma:migrate --scope=@porkate/core",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "prettier": "^3.2.5",
    "typescript": "^5.3.3",
    "lerna": "^8.0.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.4",
  "workspaces": [
    "packages/*",
    "standalone-packages/*",
    "examples/*"
  ]
}
EOF

# =============================================================================
# DIRECTORY STRUCTURE
# =============================================================================

echo "📂 Creating comprehensive monorepo directory structure..."

# Core PorkAte packages (non-extractable)
mkdir -p packages/core/src/{modules/{wallet,transaction,kyc,lien,ledger},providers/database,common/{decorators,filters,interceptors,pipes,guards,utils,errors},config,constants,types,interfaces}
mkdir -p packages/core/prisma/{migrations,seeds}
mkdir -p packages/core/test/{unit,integration,e2e}
mkdir -p packages/core/zenstack

# NoSQL adapter package (internal to PorkAte)
mkdir -p packages/nosql/src/{cassandra,mongodb,interfaces}
mkdir -p packages/nosql/test

# =============================================================================
# STANDALONE PACKAGES (EXTRACTION-READY)
# =============================================================================

# Invalid8 - Caching Library (extraction-ready)
mkdir -p standalone-packages/invalid8/src/{core,adapters/{memory,redis},types,interfaces,utils}
mkdir -p standalone-packages/invalid8/test/{unit,integration}
mkdir -p standalone-packages/invalid8/docs

# TownKrier - Event System (extraction-ready, used by Invalid8 and PorkAte)
mkdir -p standalone-packages/townkrier/src/{core,adapters/{memory,rabbitmq,kafka},types,interfaces,utils}
mkdir -p standalone-packages/townkrier/test/{unit,integration}
mkdir -p standalone-packages/townkrier/docs

# Kolo - Storage Adapter (extraction-ready)
mkdir -p standalone-packages/kolo/src/{core,adapters/{local,s3,azure},types,interfaces,utils}
mkdir -p standalone-packages/kolo/test/{unit,integration}
mkdir -p standalone-packages/kolo/docs

# =============================================================================
# EXAMPLES
# =============================================================================

mkdir -p examples/{porkate-basic,porkate-nestjs,porkate-express}/src
mkdir -p examples/{invalid8,townkrier,kolo}/src

# =============================================================================
# DOCUMENTATION
# =============================================================================

mkdir -p docs/{product,packages/{invalid8,townkrier,kolo},migration,architecture,guides}

# =============================================================================
# SCRIPTS AND TOOLS
# =============================================================================

mkdir -p scripts/{migration,setup,publishing}
mkdir -p .github/workflows

echo "✅ Monorepo directory structure created"
echo ""

# =============================================================================
# PACKAGE: @porkate/core
# =============================================================================

echo ""
echo "📦 Setting up @porkate/core package..."
cd packages/core

cat > package.json << 'EOF'
{
  "name": "@porkate/core",
  "version": "1.0.0-alpha.1",
  "description": "Core wallet operations package with multi-provider database support",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "zenstack:generate": "zenstack generate",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "wallet",
    "fintech",
    "payments",
    "banking",
    "zenstack",
    "prisma",
    "multi-database"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "peerDependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "dependencies": {
    "@nestjs/config": "^3.1.1",
    "@invalid8/core": "workspace:*",
    "@townkrier/core": "workspace:*",
    "@kolo/core": "workspace:*",
    "libphonenumber-js": "^1.10.44",
    "uuid": "^9.0.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@prisma/client": "^5.7.0",
    "@types/jest": "^29.5.5",
    "@types/node": "^20.8.7",
    "@types/bcrypt": "^5.0.2",
    "@types/uuid": "^9.0.6",
    "jest": "^29.7.0",
    "prisma": "^5.7.0",
    "zenstack": "^2.0.0",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0"
  }
}
EOF

# TypeScript configuration for core
cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
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

# ZenStack schema (replaces Prisma schema for multi-provider support)
cat > schema.zmodel << 'EOF'
// ZenStack Schema - Multi-Provider Database Support
// Generates Prisma schema based on DATABASE_PROVIDER environment variable

datasource db {
  provider = env("DATABASE_PROVIDER") // "postgresql", "mysql", "sqlite", "sqlserver", "cockroachdb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================================================
// WALLET MODEL
// ============================================================================

model Wallet {
  id              String    @id @default(cuid())
  
  // User linkage (external auth - Clerk, Auth0, Firebase, etc.)
  userId          String    // Links to external authentication system
  
  // Account details
  accountNumber   String    @unique
  phoneNumber     String    @unique
  balance         Decimal   @default(0) @db.Decimal(18, 2)
  currency        String    @default("NGN")
  accountType     String    // INDIVIDUAL, BUSINESS
  status          String    // ACTIVE, SUSPENDED, CLOSED
  
  // Security
  pin             String    // Hashed PIN for transaction authorization (NOT for login)
  hashValue       String    // SHA-256 hash for integrity checking
  
  // Relationships
  kyc             KYC?
  ledgers         Ledger[]
  liens           Lien[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([phoneNumber])
  @@index([accountNumber])
  @@index([userId])
  @@map("wallets")
}

// ============================================================================
// KYC MODEL
// ============================================================================

model KYC {
  id              String    @id @default(cuid())
  walletId        String    @unique
  wallet          Wallet    @relation(fields: [walletId], references: [id], onDelete: Cascade)
  
  profileType     String    // INDIVIDUAL, CORPORATE, GROUP
  tier            Int       @default(1) // 1, 2, 3
  
  // Individual fields
  fullName        String?
  email           String?
  phoneNumber     String
  address         String?
  bvn             String?
  nin             String?
  dateOfBirth     DateTime?
  
  // Corporate fields
  companyName     String?
  rcNumber        String?
  taxId           String?
  
  // Group fields
  groupName       String?
  groupType       String?
  
  // Document storage (references to Kolo storage)
  documents       Json?     // {documentType: koloStorageKey}
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("kyc_records")
}

// ============================================================================
// LEDGER MODEL (Double-Entry Accounting)
// ============================================================================

model Ledger {
  id              String    @id @default(cuid())
  walletId        String
  wallet          Wallet    @relation(fields: [walletId], references: [id])
  
  entryType       String    // DEBIT, CREDIT
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

// ============================================================================
// LIEN MODEL
// ============================================================================

model Lien {
  id              String    @id @default(cuid())
  walletId        String
  wallet          Wallet    @relation(fields: [walletId], references: [id])
  
  amount          Decimal   @db.Decimal(18, 2)
  reason          String
  status          String    // ACTIVE, RELEASED, EXPIRED
  expiryDate      DateTime?
  
  transactionRef  String?
  
  createdAt       DateTime  @default(now())
  releasedAt      DateTime?
  
  @@index([walletId, status])
  @@map("liens")
}

// ============================================================================
// TRANSACTION MODEL (for MVP, will migrate to NoSQL in Phase 2)
// ============================================================================

model Transaction {
  id                String    @id @default(cuid())
  reference         String    @unique
  
  sourceWalletId    String?
  destinationWalletId String?
  
  type              String    // DEBIT, CREDIT, TRANSFER
  amount            Decimal   @db.Decimal(18, 2)
  currency          String    @default("NGN")
  fees              Decimal   @default(0) @db.Decimal(18, 2)
  
  status            String    // PENDING, SUCCESS, FAILED, REVERSED
  narration         String
  metadata          Json?
  
  idempotencyKey    String?   @unique
  hash              String    // Transaction integrity hash
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([reference])
  @@index([sourceWalletId])
  @@index([destinationWalletId])
  @@index([idempotencyKey])
  @@index([createdAt])
  @@map("transactions")
}
EOF

# Create .env.example with multi-provider support
cat > .env.example << 'EOF'
# Database Provider Selection
# Supported: postgresql, mysql, sqlite, sqlserver, cockroachdb
DATABASE_PROVIDER="postgresql"

# Database Connection
# PostgreSQL example:
DATABASE_URL="postgresql://user:password@localhost:5432/porkate_wallet?schema=public"
# MySQL example:
# DATABASE_URL="mysql://user:password@localhost:3306/porkate_wallet"
# SQLite example:
# DATABASE_URL="file:./dev.db"

# Security
HASH_ALGORITHM="sha256"
ENABLE_HASH_VALIDATION=true
PIN_HASH_ROUNDS=10

# Transaction
DEFAULT_TRANSACTION_STRATEGY="individual"
ENABLE_IDEMPOTENCY=true
IDEMPOTENCY_WINDOW_HOURS=24

# KYC Tier Limits (NGN)
TIER1_MAX_BALANCE=300000
TIER1_DAILY_LIMIT=50000
TIER1_SINGLE_TRANSACTION_LIMIT=50000
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
import { LedgerModule } from './modules/ledger/ledger.module';
import { PrismaModule } from './providers/database/prisma.module';
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
        WalletModule,
        TransactionModule,
        KYCModule,
        LienModule,
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
        WalletModule,
        TransactionModule,
        KYCModule,
        LienModule,
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

export enum LienStatus {
  ACTIVE = 'ACTIVE',
  RELEASED = 'RELEASED',
  EXPIRED = 'EXPIRED',
}
EOF

# Create types
cat > src/types/index.ts << 'EOF'
export interface WalletModuleOptions {
  database: DatabaseConfig;
  nosql?: NoSQLConfig;
  security: SecurityConfig;
  transaction: TransactionConfig;
  kyc: KYCConfig;
  features?: FeatureFlags;
}

export interface DatabaseConfig {
  provider: 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver' | 'cockroachdb';
  url: string;
}

export interface NoSQLConfig {
  provider: 'cassandra' | 'mongodb';
  contactPoints?: string[];
  connectionString?: string;
  keyspace?: string;
}

export interface SecurityConfig {
  enableHashValidation: boolean;
  hashAlgorithm: 'sha256' | 'sha512';
  pinHashRounds: number;
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
  maxBalance: number;
  dailyLimit: number;
  singleTransactionLimit: number;
  requiredDocuments: string[];
}

export interface FeatureFlags {
  multiCurrency?: boolean;
  qrCodeTransfer?: boolean;
  phoneTransfer?: boolean;
}
EOF

# Create README for core package
cat > README.md << 'EOF'
# @porkate/core

Core wallet operations package with multi-provider database support via ZenStack.

## Features

- 🏦 Double-Entry Ledger
- 🔐 Transaction Authorization (PIN-based)
- 📊 KYC Management (CBN-compliant)
- 🔄 Transaction Management
- 🔒 Lien Management
- 🗄️ Multi-Database Support (PostgreSQL, MySQL, SQLite, SQL Server, CockroachDB)

## Installation

```bash
npm install @porkate/core @invalid8/core @townkrier/core @kolo/core
```

## Quick Start

```typescript
import { WalletSdkModule } from '@porkate/core';

// In your NestJS module
WalletSdkModule.forRoot({
  database: {
    provider: process.env.DATABASE_PROVIDER as any,
    url: process.env.DATABASE_URL,
  },
  security: {
    enableHashValidation: true,
    hashAlgorithm: 'sha256',
    pinHashRounds: 10,
  },
  transaction: {
    defaultStrategy: 'individual',
    enableIdempotency: true,
    idempotencyWindow: 24,
  },
  kyc: {
    profiles: ['individual'],
    tierConfig: TIER_CONFIG,
  },
});
```

## Documentation

See [full documentation](../../docs/product/PorkAte-FRD.md).

## License

MIT
EOF

cd ../..

# =============================================================================
# PACKAGE: @invalid8/core (STANDALONE - EXTRACTION-READY)
# =============================================================================

echo ""
echo "📦 Setting up @invalid8/core package (EXTRACTION-READY)..."
cd standalone-packages/invalid8

cat > package.json << 'EOF'
{
  "name": "@invalid8/core",
  "version": "1.0.0-alpha.1",
  "description": "React Query-inspired caching library for JavaScript/TypeScript with CQRS optimization",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "cache",
    "caching",
    "query",
    "react-query",
    "cqrs",
    "distributed-cache",
    "invalid8"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "@townkrier/core": "workspace:*"
  },
  "devDependencies": {
    "@types/jest": "^29.5.5",
    "@types/node": "^20.8.7",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF

cat > README.md << 'EOF'
# Invalid8

React Query-inspired caching library for JavaScript/TypeScript applications.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 🚀 React Query-like Developer Experience
- 🌐 Distributed cache synchronization
- ⚡ High performance with minimal overhead
- 🛡️ Resilient design with circuit breakers
- 📊 Comprehensive observability
- 🎯 CQRS-optimized

## Installation

```bash
npm install @invalid8/core @townkrier/core
```

## Documentation

See [full documentation](../../docs/packages/invalid8/README.md).

## Extraction Guide

This package is designed to be extracted to a separate repository. See [PACKAGE-MIGRATION-GUIDE.md](../../docs/migration/PACKAGE-MIGRATION-GUIDE.md).

## License

MIT
EOF

cat > src/index.ts << 'EOF'
// Main exports
export * from './core/query-client';
export * from './core/invalid8';
export * from './adapters/memory';
export * from './adapters/redis';
export * from './types';
export * from './interfaces';
EOF

cd ../..

# =============================================================================
# PACKAGE: @townkrier/core (STANDALONE - EXTRACTION-READY)
# =============================================================================

echo ""
echo "📦 Setting up @townkrier/core package (EXTRACTION-READY)..."
cd standalone-packages/townkrier

cat > package.json << 'EOF'
{
  "name": "@townkrier/core",
  "version": "1.0.0-alpha.1",
  "description": "Event system for distributed applications with multiple adapter support",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "events",
    "event-bus",
    "messaging",
    "rabbitmq",
    "kafka",
    "distributed-systems",
    "townkrier"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/jest": "^29.5.5",
    "@types/node": "^20.8.7",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF

cat > README.md << 'EOF'
# TownKrier

Event system for distributed applications.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 🎯 Multiple adapter support (RabbitMQ, Kafka, Memory)
- 🌐 Distributed event propagation
- 🔄 Event replay mechanisms
- 📊 Event observability
- 🛡️ Resilient delivery

## Installation

```bash
npm install @townkrier/core
```

## Documentation

See [full documentation](../../docs/packages/townkrier/README.md).

## Extraction Guide

This package is designed to be extracted to a separate repository. See [PACKAGE-MIGRATION-GUIDE.md](../../docs/migration/PACKAGE-MIGRATION-GUIDE.md).

## License

MIT
EOF

cat > src/index.ts << 'EOF'
// Main exports
export * from './core/event-bus';
export * from './core/townkrier';
export * from './adapters/memory';
export * from './adapters/rabbitmq';
export * from './adapters/kafka';
export * from './types';
export * from './interfaces';
EOF

cd ../..

# =============================================================================
# PACKAGE: @kolo/core (STANDALONE - EXTRACTION-READY)
# =============================================================================

echo ""
echo "📦 Setting up @kolo/core package (EXTRACTION-READY)..."
cd standalone-packages/kolo

cat > package.json << 'EOF'
{
  "name": "@kolo/core",
  "version": "1.0.0-alpha.1",
  "description": "Secure storage adapter (Kolo means piggybank in Yoruba) for documents and files",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "storage",
    "s3",
    "azure-blob",
    "file-storage",
    "document-storage",
    "kolo"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/jest": "^29.5.5",
    "@types/node": "^20.8.7",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF

cat > README.md << 'EOF'
# Kolo

Secure storage adapter for documents and files (Kolo means "piggybank" or "secure box" in Yoruba).

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 📦 Multiple storage backends (S3, Azure Blob, Local)
- 🔐 Encrypted storage
- ⏱️ Time-limited access URLs
- 📊 Storage metrics
- 🛡️ Secure file handling

## Installation

```bash
npm install @kolo/core
```

## Documentation

See [full documentation](../../docs/packages/kolo/README.md).

## Extraction Guide

This package is designed to be extracted to a separate repository. See [PACKAGE-MIGRATION-GUIDE.md](../../docs/migration/PACKAGE-MIGRATION-GUIDE.md).

## License

MIT
EOF

cat > src/index.ts << 'EOF'
// Main exports
export * from './core/storage-client';
export * from './core/kolo';
export * from './adapters/local';
export * from './adapters/s3';
export * from './adapters/azure';
export * from './types';
export * from './interfaces';
EOF

cd ../..

# =============================================================================
# ROOT CONFIGURATION FILES
# =============================================================================

echo ""
echo "📝 Creating root configuration files..."

# Base TypeScript configuration
cat > tsconfig.base.json << 'EOF'
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
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
EOF

# Root .gitignore
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

# Generated files
**/prisma/migrations/**/migration.sql
**/generated/

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
lerna-debug.log*

# Testing
coverage/
.nyc_output/

# Misc
.cache/
temp/
EOF

# Prettier config
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
EOF

# ESLint config
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
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
EOF

# Root README
cat > README.md << 'EOF'
# PorkAte Monorepo

Enterprise-grade wallet package with standalone adapter libraries.

## Packages

### Core Packages
- **[@porkate/core](packages/core)** - Wallet operations package
- **[@porkate/nosql](packages/nosql)** - NoSQL adapters (internal)

### Standalone Packages (Extraction-Ready)
- **[@invalid8/core](standalone-packages/invalid8)** - Caching library ✅
- **[@townkrier/core](standalone-packages/townkrier)** - Event system ✅
- **[@kolo/core](standalone-packages/kolo)** - Storage adapter ✅

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

## License

MIT
EOF

# =============================================================================
# FINALIZE
# =============================================================================

echo ""
echo "✅ Monorepo structure created successfully!"
echo ""
echo "📦 Installing dependencies (this may take a few minutes)..."

# Install root dependencies
pnpm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📁 Monorepo Structure:"
echo "  packages/"
echo "    ├── core/          (@porkate/core)"
echo "    └── nosql/         (@porkate/nosql)"
echo "  standalone-packages/"
echo "    ├── invalid8/      (@invalid8/core) ✅ Extraction-ready"
echo "    ├── townkrier/     (@townkrier/core) ✅ Extraction-ready"
echo "    └── kolo/          (@kolo/core) ✅ Extraction-ready"
echo ""
echo "Next steps:"
echo "  1. cd packages/core && cp .env.example .env"
echo "  2. Configure DATABASE_PROVIDER and DATABASE_URL in .env"
echo "  3. Run 'pnpm zenstack:generate' to generate Prisma schema"
echo "  4. Run 'pnpm prisma:migrate' to setup database"
echo "  5. Run 'pnpm build' to build all packages"
echo ""
echo "Useful commands:"
echo "  pnpm build                  - Build all packages"
echo "  pnpm build:core             - Build @porkate/core only"
echo "  pnpm build:invalid8         - Build @invalid8/core only"
echo "  pnpm zenstack:generate      - Generate Prisma schema from ZenStack"
echo "  pnpm prisma:studio          - Open Prisma Studio"
echo "  pnpm test                   - Run all tests"
echo "  pnpm publish                - Publish all changed packages"
echo ""
echo "Database Providers Supported:"
echo "  - postgresql (recommended)"
echo "  - mysql"
echo "  - sqlite"
echo "  - sqlserver"
echo "  - cockroachdb"
echo ""
echo "Change provider by setting DATABASE_PROVIDER environment variable!"
echo ""
