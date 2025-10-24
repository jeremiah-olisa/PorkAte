#!/usr/bin/env bash

# PorkAte Wallet Package - Complete Monorepo Setup Script (CORRECTED)
# Lerna + PNPM Monorepo with Standalone Extractable Packages
# Aligned with PorkAte FRD v2.0 - October 24, 2025
# Author: Jeremiah Olisa
#
# CORRECTED ARCHITECTURE:
# - @porkate/core (wallet package)
# - @porkate/nosql (internal nosql adapter)
# - @porkate/payment (payment gateway interface - extraction-ready)
# - @porkate/paystack (Paystack adapter - extraction-ready)
# - @porkate/stripe (Stripe adapter - extraction-ready)
# - @porkate/flutterwave (Flutterwave adapter - extraction-ready)
# - @invalid8/core (standalone caching library - extraction-ready)
# - @eventbus/core (event system for Invalid8 cache invalidation - extraction-ready)
# - @townkrier/core (Laravel-style notification system - extraction-ready)
# - @kolo/core (standalone storage adapter for KYC documents - extraction-ready)

set -e  # Exit on error

echo "🚀 PorkAte Wallet Package - Lerna Monorepo Setup (CORRECTED)"
echo "=============================================================="
echo "Package: PorkAte (pronounced 'Pocket')"
echo "Version: 1.0.0-alpha"
echo "FRD Version: 2.0"
echo "Architecture: Lerna + PNPM Monorepo"
echo "Database: ZenStack (Multi-Provider Support)"
echo ""
echo "Standalone Packages:"
echo "  ✅ Invalid8 - Caching library (React Query-inspired)"
echo "  ✅ EventBus - Event system for cache invalidation"
echo "  ✅ TownKrier - Laravel-style notification system"
echo "  ✅ Kolo - Storage adapter for documents"
echo "  ✅ Payment Core - Payment gateway interface"
echo "  ✅ Paystack - Paystack payment adapter"
echo "  ✅ Stripe - Stripe payment adapter"
echo "  ✅ Flutterwave - Flutterwave payment adapter"
echo "=============================================================="
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
    sudo npm install -g lerna
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
      "message": "chore(release): publish",
      "registry": "https://registry.npmjs.org/"
    },
    "version": {
      "conventionalCommits": true,
      "message": "chore(release): version"
    }
  },
  "packages": [
    "packages/*",
    "packages/standalone/*"
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
  - 'packages/standalone/*'
  
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
  "description": "Provider-agnostic wallet package with standalone adapters",
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
    "zenstack",
    "paystack",
    "stripe",
    "flutterwave"
  ],
  "scripts": {
    "bootstrap": "lerna bootstrap",
    "build": "lerna run build --stream",
    "build:core": "lerna run build --scope=@porkate/core --stream",
    "build:invalid8": "lerna run build --scope=@invalid8/core --stream",
    "build:eventbus": "lerna run build --scope=@eventbus/core --stream",
    "build:townkrier": "lerna run build --scope=@townkrier/core --stream",
    "build:kolo": "lerna run build --scope=@kolo/core --stream",
    "build:payment": "lerna run build --scope='@porkate/payment*' --stream",
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
    "packages/standalone/*",
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
mkdir -p packages/standalone/invalid8/src/{core,adapters/{memory,redis},types,interfaces,utils}
mkdir -p packages/standalone/invalid8/test/{unit,integration}
mkdir -p packages/standalone/invalid8/docs

# EventBus - Event System for Cache Invalidation (extraction-ready, used by Invalid8)
mkdir -p packages/standalone/eventbus/src/{core,adapters/{memory,rabbitmq,kafka},types,interfaces,utils}
mkdir -p packages/standalone/eventbus/test/{unit,integration}
mkdir -p packages/standalone/eventbus/docs

# TownKrier - Laravel-style Notification System (extraction-ready)
mkdir -p packages/standalone/townkrier/src/{core,channels/{mail,sms,push,database,slack},adapters/{resend,twilio,firebase,onesignal},types,interfaces,utils}
mkdir -p packages/standalone/townkrier/test/{unit,integration}
mkdir -p packages/standalone/townkrier/docs

# Kolo - Storage Adapter (extraction-ready)
mkdir -p packages/standalone/kolo/src/{core,adapters/{local,s3,azure},types,interfaces,utils}
mkdir -p packages/standalone/kolo/test/{unit,integration}
mkdir -p packages/standalone/kolo/docs

# Payment Gateway Packages (extraction-ready)
mkdir -p packages/standalone/payment/src/{core,types,interfaces,utils}
mkdir -p packages/standalone/payment/test/{unit,integration}
mkdir -p packages/standalone/payment/docs

mkdir -p packages/standalone/paystack/src/{core,types,interfaces,utils}
mkdir -p packages/standalone/paystack/test/{unit,integration}
mkdir -p packages/standalone/paystack/docs

mkdir -p packages/standalone/stripe/src/{core,types,interfaces,utils}
mkdir -p packages/standalone/stripe/test/{unit,integration}
mkdir -p packages/standalone/stripe/docs

mkdir -p packages/standalone/flutterwave/src/{core,types,interfaces,utils}
mkdir -p packages/standalone/flutterwave/test/{unit,integration}
mkdir -p packages/standalone/flutterwave/docs

# =============================================================================
# EXAMPLES
# =============================================================================

mkdir -p examples/{porkate-basic,porkate-nestjs,porkate-express}/src
mkdir -p examples/{invalid8,townkrier,kolo,payment}/src

# =============================================================================
# DOCUMENTATION
# =============================================================================

mkdir -p docs/{product,packages/{invalid8,eventbus,townkrier,kolo,payment},migration,architecture,guides}

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
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "wallet",
    "fintech",
    "banking",
    "payments",
    "porkate",
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
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "zenstack": "^2.0.0",
    "@invalid8/core": "workspace:*",
    "@eventbus/core": "workspace:*",
    "@townkrier/core": "workspace:*",
    "@kolo/core": "workspace:*",
    "@porkate/payment": "workspace:*",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3",
    "prisma": "^5.7.0"
  }
}
EOF

# TypeScript configuration for core
cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
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
    '^@modules/(.*)$': '<rootDir>/modules/$1',
    '^@providers/(.*)$': '<rootDir>/providers/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
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
- 💳 Payment Gateway Integration (Paystack, Stripe, Flutterwave)
- 📧 Notification System (TownKrier)
- 📦 Document Storage (Kolo)
- ⚡ Caching (Invalid8)

## Installation

```bash
npm install @porkate/core @invalid8/core @eventbus/core @townkrier/core @kolo/core @porkate/payment
# Install payment providers as needed
npm install @porkate/paystack @porkate/stripe @porkate/flutterwave
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
cd packages/standalone/invalid8

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
    "lint": "eslint \"src/**/*.ts\" --fix",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "cache",
    "caching",
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
    "@eventbus/core": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/jest": "^29.5.11",
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
- 🌐 Distributed cache synchronization via EventBus
- ⚡ High performance with minimal overhead
- 🛡️ Resilient design with circuit breakers
- 📊 Comprehensive observability
- 🎯 CQRS-optimized

## Installation

```bash
npm install @invalid8/core @eventbus/core
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
# PACKAGE: @eventbus/core (STANDALONE - EXTRACTION-READY)
# =============================================================================

echo ""
echo "📦 Setting up @eventbus/core package (EXTRACTION-READY)..."
cd packages/standalone/eventbus

cat > package.json << 'EOF'
{
  "name": "@eventbus/core",
  "version": "1.0.0-alpha.1",
  "description": "Event bus system for distributed cache invalidation and application events",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"src/**/*.ts\" --fix",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "event-bus",
    "events",
    "distributed",
    "pub-sub",
    "cache-invalidation",
    "eventbus"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/jest": "^29.5.11",
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
# EventBus

Event bus system for distributed applications, cache invalidation, and pub/sub messaging.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 🎯 Multiple adapter support (RabbitMQ, Kafka, Memory)
- 🌐 Distributed event propagation
- 🔄 Event replay mechanisms
- 📊 Event observability
- 🛡️ Resilient delivery
- ⚡ Cache invalidation support for Invalid8

## Installation

```bash
npm install @eventbus/core
```

## Documentation

See [full documentation](../../docs/packages/eventbus/README.md).

## Extraction Guide

This package is designed to be extracted to a separate repository. See [PACKAGE-MIGRATION-GUIDE.md](../../docs/migration/PACKAGE-MIGRATION-GUIDE.md).

## License

MIT
EOF

cat > src/index.ts << 'EOF'
// Main exports
export * from './core/event-bus';
export * from './core/event-emitter';
export * from './adapters/memory';
export * from './adapters/rabbitmq';
export * from './adapters/kafka';
export * from './types';
export * from './interfaces';
EOF

cd ../..

# =============================================================================
# PACKAGE: @townkrier/core (STANDALONE - EXTRACTION-READY)
# =============================================================================

echo ""
echo "📦 Setting up @townkrier/core package (EXTRACTION-READY - Laravel-style Notifications)..."
cd packages/standalone/townkrier

cat > package.json << 'EOF'
{
  "name": "@townkrier/core",
  "version": "1.0.0-alpha.1",
  "description": "Laravel-style notification system for Node.js with multiple channels and providers",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"src/**/*.ts\" --fix",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "notifications",
    "laravel-notifications",
    "email",
    "sms",
    "push-notifications",
    "in-app-notifications",
    "townkrier",
    "multi-channel"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/jest": "^29.5.11",
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

Laravel-style notification system for Node.js - send notifications across multiple channels with a unified API.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 📧 **Multi-Channel Support:** Email, SMS, Push, In-App, Slack, Database
- 🎯 **Provider Agnostic:** Works with Resend, Twilio, Firebase, OneSignal, and more
- 🚀 **Laravel-inspired API:** Familiar and elegant notification classes
- ⚡ **Queue Support:** Async notification delivery
- 🛡️ **Type-Safe:** Full TypeScript support
- 🔌 **Framework Agnostic:** Works with Express, NestJS, or standalone

## Installation

```bash
npm install @townkrier/core
# Install channel providers as needed
npm install resend twilio firebase-admin onesignal-node
```

## Quick Start

```typescript
import { Notification, MailChannel, SmsChannel } from '@townkrier/core';

// Define a notification
class OrderShipped extends Notification {
  constructor(private order: Order) {
    super();
  }

  via(notifiable: Notifiable): string[] {
    return ['mail', 'sms', 'database'];
  }

  toMail(notifiable: Notifiable): MailMessage {
    return new MailMessage()
      .subject('Order Shipped!')
      .line(`Your order #${this.order.id} has been shipped.`)
      .action('Track Order', this.order.trackingUrl);
  }

  toSms(notifiable: Notifiable): SmsMessage {
    return new SmsMessage()
      .content(`Your order #${this.order.id} has shipped!`);
  }
}

// Send notification
await user.notify(new OrderShipped(order));
```

## Channels

- **Mail:** Resend, SendGrid, Nodemailer, custom SMTP
- **SMS:** Twilio, Termii, custom providers
- **Push:** Firebase (FCM), OneSignal, custom providers
- **In-App/Database:** Store notifications in database
- **Slack:** Send to Slack channels
- **Custom:** Create your own channels

## Documentation

See [full documentation](../../docs/packages/townkrier/README.md).

## Extraction Guide

This package is designed to be extracted to a separate repository. See [PACKAGE-MIGRATION-GUIDE.md](../../docs/migration/PACKAGE-MIGRATION-GUIDE.md).

## License

MIT
EOF

cat > src/index.ts << 'EOF'
// Main exports
export * from './core/notification';
export * from './core/notifiable';
export * from './core/notification-manager';

// Channels
export * from './channels/mail';
export * from './channels/sms';
export * from './channels/push';
export * from './channels/database';
export * from './channels/slack';

// Adapters/Providers
export * from './adapters/resend';
export * from './adapters/twilio';
export * from './adapters/firebase';
export * from './adapters/onesignal';

// Types and Interfaces
export * from './types';
export * from './interfaces';
EOF

cd ../..

# =============================================================================
# PACKAGE: @kolo/core (STANDALONE - EXTRACTION-READY)
# =============================================================================

echo ""
echo "📦 Setting up @kolo/core package (EXTRACTION-READY)..."
cd packages/standalone/kolo

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
    "lint": "eslint \"src/**/*.ts\" --fix",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "storage",
    "s3",
    "azure-blob",
    "file-storage",
    "kolo",
    "document-storage"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/jest": "^29.5.11",
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
- 📄 Perfect for KYC documents

## Installation

```bash
npm install @kolo/core
# Install storage providers as needed
npm install @aws-sdk/client-s3 @azure/storage-blob
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
# PAYMENT GATEWAY PACKAGES (STANDALONE - EXTRACTION-READY)
# =============================================================================

echo ""
echo "📦 Setting up Payment Gateway packages (EXTRACTION-READY)..."

# @porkate/payment (Interface/Core)
cd packages/standalone/payment

cat > package.json << 'EOF'
{
  "name": "@porkate/payment",
  "version": "1.0.0-alpha.1",
  "description": "Payment gateway interface for PorkAte wallet package",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"src/**/*.ts\" --fix",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "payment",
    "payment-gateway",
    "porkate",
    "wallet"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/jest": "^29.5.11",
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
# @porkate/payment

Payment gateway interface for PorkAte wallet package.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Description

This package provides the core interfaces and types for payment gateway integration with PorkAte wallets.

## Implementations

- [@porkate/paystack](../paystack) - Paystack payment gateway
- [@porkate/stripe](../stripe) - Stripe payment gateway
- [@porkate/flutterwave](../flutterwave) - Flutterwave payment gateway

## Installation

```bash
npm install @porkate/payment
# Install provider implementations
npm install @porkate/paystack @porkate/stripe @porkate/flutterwave
```

## License

MIT
EOF

cat > src/index.ts << 'EOF'
// Payment Gateway Interface
export * from './core/payment-gateway.interface';
export * from './types';
export * from './interfaces';
export * from './utils';
EOF

cd ../..

# @porkate/paystack
cd packages/standalone/paystack

cat > package.json << 'EOF'
{
  "name": "@porkate/paystack",
  "version": "1.0.0-alpha.1",
  "description": "Paystack payment gateway adapter for PorkAte",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"src/**/*.ts\" --fix",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "paystack",
    "payment",
    "porkate",
    "wallet",
    "nigeria"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "@porkate/payment": "workspace:*",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/jest": "^29.5.11",
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
# @porkate/paystack

Paystack payment gateway adapter for PorkAte wallet package.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 💳 Initialize payments
- ✅ Verify transactions
- 💰 Transfer to bank accounts
- 🔄 Webhook handling
- 🇳🇬 Optimized for Nigerian market

## Installation

```bash
npm install @porkate/paystack @porkate/payment
```

## License

MIT
EOF

cat > src/index.ts << 'EOF'
// Paystack Gateway Implementation
export * from './core/paystack-gateway';
export * from './types';
export * from './interfaces';
EOF

cd ../..

# @porkate/stripe
cd packages/standalone/stripe

cat > package.json << 'EOF'
{
  "name": "@porkate/stripe",
  "version": "1.0.0-alpha.1",
  "description": "Stripe payment gateway adapter for PorkAte",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"src/**/*.ts\" --fix",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "stripe",
    "payment",
    "porkate",
    "wallet",
    "international"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "@porkate/payment": "workspace:*",
    "stripe": "^14.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/jest": "^29.5.11",
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
# @porkate/stripe

Stripe payment gateway adapter for PorkAte wallet package.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 💳 Payment intents
- ✅ Transaction verification
- 💰 Payouts
- 🔄 Webhook handling
- 🌍 International support

## Installation

```bash
npm install @porkate/stripe @porkate/payment
```

## License

MIT
EOF

cat > src/index.ts << 'EOF'
// Stripe Gateway Implementation
export * from './core/stripe-gateway';
export * from './types';
export * from './interfaces';
EOF

cd ../..

# @porkate/flutterwave
cd packages/standalone/flutterwave

cat > package.json << 'EOF'
{
  "name": "@porkate/flutterwave",
  "version": "1.0.0-alpha.1",
  "description": "Flutterwave payment gateway adapter for PorkAte",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"src/**/*.ts\" --fix",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "flutterwave",
    "payment",
    "porkate",
    "wallet",
    "africa"
  ],
  "author": "Jeremiah Olisa",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "@porkate/payment": "workspace:*",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/jest": "^29.5.11",
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
# @porkate/flutterwave

Flutterwave payment gateway adapter for PorkAte wallet package.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 💳 Initialize payments
- ✅ Verify transactions
- 💰 Transfers and payouts
- 🔄 Webhook handling
- 🌍 Pan-African support

## Installation

```bash
npm install @porkate/flutterwave @porkate/payment
```

## License

MIT
EOF

cat > src/index.ts << 'EOF'
// Flutterwave Gateway Implementation
export * from './core/flutterwave-gateway';
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
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
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
echo "📁 Monorepo Structure (CORRECTED):"
echo "  packages/"
echo "    ├── core/          (@porkate/core)"
echo "    ├── nosql/         (@porkate/nosql)"
echo "    └── standalone/"
echo "        ├── invalid8/      (@invalid8/core) ✅ Extraction-ready - Caching"
echo "        ├── eventbus/      (@eventbus/core) ✅ Extraction-ready - Events"
echo "        ├── townkrier/     (@townkrier/core) ✅ Extraction-ready - Notifications"
echo "        ├── kolo/          (@kolo/core) ✅ Extraction-ready - Storage"
echo "        ├── payment/       (@porkate/payment) ✅ Extraction-ready - Payment Interface"
echo "        ├── paystack/      (@porkate/paystack) ✅ Extraction-ready - Paystack"
echo "        ├── stripe/        (@porkate/stripe) ✅ Extraction-ready - Stripe"
echo "        └── flutterwave/   (@porkate/flutterwave) ✅ Extraction-ready - Flutterwave"
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
echo "  pnpm build:townkrier        - Build @townkrier/core only"
echo "  pnpm build:payment          - Build all payment packages"
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
