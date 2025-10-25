# @porkate/nosql

Core NoSQL adapter interface for PorkAte wallet package.

## Overview

This package provides the core interfaces, types, and base classes for NoSQL database adapters in the PorkAte ecosystem. It defines the contract that all NoSQL adapters must implement for transaction storage.

## Installation

```bash
npm install @porkate/nosql
```

## Features

- **Provider Agnostic**: Define a standard interface for all NoSQL databases
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Structured exception classes for better error management
- **Extensible**: Easy to create custom adapters by implementing the interface

## Core Interfaces

### INoSQLAdapter

The main interface that all NoSQL adapters must implement:

```typescript
interface INoSQLAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getDatabaseName(): string;
  insertTransaction(transaction: Transaction): Promise<Transaction>;
  bulkInsertTransactions(transactions: Transaction[], options?: BulkInsertOptions): Promise<BulkInsertResult>;
  getTransactionById(id: string): Promise<Transaction | null>;
  getTransactionByReference(reference: string): Promise<Transaction | null>;
  queryByWalletId(walletId: string, options?: QueryOptions): Promise<PaginatedResult<Transaction>>;
  // ... more methods
}
```

## Usage

### Creating a Custom Adapter

```typescript
import { BaseNoSQLAdapter, Transaction, NoSQLConfig } from '@porkate/nosql';

class MyCustomAdapter extends BaseNoSQLAdapter {
  constructor(config: NoSQLConfig) {
    super(config, 'MyCustomDB');
  }

  async connect(): Promise<void> {
    // Implementation
  }

  async insertTransaction(transaction: Transaction): Promise<Transaction> {
    // Implementation
  }

  // Implement other required methods...
}
```

## Available Adapters

- `@porkate/cassandra` - Apache Cassandra adapter
- `@porkate/mongodb` - MongoDB adapter

## Types

### Transaction

```typescript
interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  sourceWalletId?: string;
  destinationWalletId?: string;
  amount: number;
  currency: Currency;
  fees?: number;
  status: TransactionStatus;
  narration?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
  hash?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

## Error Handling

All exceptions inherit from `NoSQLException`:

- `NoSQLConfigurationException`
- `NoSQLConnectionException`
- `NoSQLInsertException`
- `NoSQLQueryException`
- `TransactionNotFoundException`
- And more...

## License

MIT
