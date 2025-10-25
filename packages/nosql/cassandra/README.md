# @porkate/cassandra

Apache Cassandra NoSQL adapter for PorkAte wallet package.

## Overview

This package provides a production-ready Cassandra adapter for storing wallet transactions in the PorkAte ecosystem. It implements the `INoSQLAdapter` interface from `@porkate/nosql`.

## Installation

```bash
npm install @porkate/cassandra
```

## Features

- **High Performance**: Optimized for high-throughput transaction storage
- **Scalable**: Leverages Cassandra's distributed architecture
- **Partition Management**: Efficient data partitioning for large transaction volumes
- **Auto Schema Creation**: Automatically creates keyspace tables and indexes
- **Bulk Operations**: Support for batch inserts with configurable batch sizes
- **Connection Management**: Automatic reconnection with retry logic

## Usage

### Basic Setup

```typescript
import { CassandraAdapter } from '@porkate/cassandra';

const adapter = new CassandraAdapter({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'wallet_transactions',
  username: 'cassandra',
  password: 'cassandra',
  port: 9042,
  timeout: 30000,
  maxRetries: 3,
  debug: true,
});

// Connect to Cassandra
await adapter.connect();

// Insert a transaction
const transaction = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  reference: 'TXN-1234567890',
  type: 'TRANSFER',
  sourceWalletId: 'wallet-1',
  destinationWalletId: 'wallet-2',
  amount: 1000,
  currency: 'NGN',
  status: 'SUCCESS',
  createdAt: new Date(),
  updatedAt: new Date(),
};

await adapter.insertTransaction(transaction);

// Query transactions
const result = await adapter.queryByWalletId('wallet-1', {
  limit: 50,
  status: 'SUCCESS',
});

// Disconnect when done
await adapter.disconnect();
```

### Configuration Options

```typescript
interface CassandraConfig {
  contactPoints: string[];        // Cassandra node addresses
  localDataCenter: string;         // Local datacenter name
  keyspace: string;                // Keyspace name
  username?: string;               // Authentication username
  password?: string;               // Authentication password
  port?: number;                   // Connection port (default: 9042)
  ssl?: boolean;                   // Enable SSL/TLS
  timeout?: number;                // Connection timeout in ms
  maxRetries?: number;             // Max retry attempts
  debug?: boolean;                 // Enable debug logging
  replicationFactor?: number;      // Keyspace replication factor
}
```

### Schema

The adapter automatically creates the following table:

```cql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  reference TEXT,
  type TEXT,
  source_wallet_id TEXT,
  destination_wallet_id TEXT,
  amount DECIMAL,
  currency TEXT,
  fees DECIMAL,
  status TEXT,
  narration TEXT,
  metadata TEXT,
  idempotency_key TEXT,
  hash TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX ON transactions (reference);
CREATE INDEX ON transactions (idempotency_key);
CREATE INDEX ON transactions (source_wallet_id);
CREATE INDEX ON transactions (destination_wallet_id);
CREATE INDEX ON transactions (status);
```

## Best Practices

1. **Use Appropriate Replication Factor**: Set based on your cluster size and redundancy needs
2. **Monitor Performance**: Use Cassandra monitoring tools to track query performance
3. **Batch Wisely**: Keep batch sizes reasonable (50-100 items) to avoid timeouts
4. **Partition Strategy**: Transactions are partitioned by ID for optimal distribution
5. **Connection Pooling**: The adapter manages connections efficiently

## Error Handling

All operations throw specific exceptions from `@porkate/nosql`:

```typescript
try {
  await adapter.insertTransaction(transaction);
} catch (error) {
  if (error instanceof NoSQLInsertException) {
    console.error('Insert failed:', error.message);
  }
}
```

## License

MIT
