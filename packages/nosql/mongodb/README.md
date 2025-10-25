# @porkate/mongodb

MongoDB NoSQL adapter for PorkAte wallet package.

## Overview

This package provides a production-ready MongoDB adapter for storing wallet transactions in the PorkAte ecosystem. It implements the `INoSQLAdapter` interface from `@porkate/nosql`.

## Installation

```bash
npm install @porkate/mongodb
```

## Features

- **High Performance**: Optimized queries with proper indexing
- **Flexible Schema**: JSON document storage for transaction metadata
- **Auto Index Creation**: Automatically creates required indexes
- **Pagination Support**: Cursor-based pagination for efficient queries
- **Connection Pooling**: Built-in connection pool management
- **Replica Set Support**: Full support for MongoDB replica sets

## Usage

### Basic Setup

```typescript
import { MongoDBAdapter } from '@porkate/mongodb';

const adapter = new MongoDBAdapter({
  uri: 'mongodb://localhost:27017',
  database: 'wallet_db',
  username: 'admin',
  password: 'password',
  authSource: 'admin',
  poolSize: 10,
  timeout: 30000,
  maxRetries: 3,
  debug: true,
});

// Connect to MongoDB
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

// Query transactions with pagination
const result = await adapter.queryByWalletId('wallet-1', {
  limit: 50,
  status: 'SUCCESS',
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

// Get next page
const nextPage = await adapter.queryByWalletId('wallet-1', {
  limit: 50,
  cursor: result.nextCursor,
});

// Disconnect when done
await adapter.disconnect();
```

### Configuration Options

```typescript
interface MongoDBConfig {
  uri: string;                    // MongoDB connection URI
  database: string;               // Database name
  username?: string;              // Authentication username
  password?: string;              // Authentication password
  authSource?: string;            // Authentication database
  replicaSet?: string;            // Replica set name
  ssl?: boolean;                  // Enable SSL/TLS
  poolSize?: number;              // Connection pool size
  timeout?: number;               // Connection timeout in ms
  maxRetries?: number;            // Max retry attempts
  debug?: boolean;                // Enable debug logging
}
```

### Indexes

The adapter automatically creates the following indexes:

```javascript
// Unique index on reference
{ reference: 1 }

// Index on idempotency key (sparse)
{ idempotencyKey: 1 }

// Indexes for wallet queries
{ sourceWalletId: 1 }
{ destinationWalletId: 1 }

// Index on status
{ status: 1 }

// Time-based index
{ createdAt: -1 }

// Compound indexes for efficient queries
{ sourceWalletId: 1, createdAt: -1 }
{ destinationWalletId: 1, createdAt: -1 }
```

### Advanced Queries

```typescript
// Query by date range
const transactions = await adapter.queryByDateRange(
  new Date('2025-01-01'),
  new Date('2025-12-31'),
  {
    limit: 100,
    status: 'SUCCESS',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }
);

// Count transactions
const count = await adapter.countTransactions('wallet-1', {
  status: 'SUCCESS',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31'),
});

// Bulk insert with error handling
const result = await adapter.bulkInsertTransactions(transactions, {
  throwOnError: false,
});

console.log(`Inserted: ${result.successful}, Failed: ${result.failed}`);
```

## Best Practices

1. **Use Connection Pooling**: Configure appropriate pool size for your workload
2. **Index Strategy**: The adapter creates essential indexes automatically
3. **Pagination**: Always use cursor-based pagination for large result sets
4. **Replica Sets**: Use replica sets for high availability in production
5. **Monitoring**: Monitor MongoDB performance metrics regularly

## Connection String Examples

### Local Development
```
mongodb://localhost:27017
```

### With Authentication
```
mongodb://username:password@localhost:27017/?authSource=admin
```

### Replica Set
```
mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=myReplicaSet
```

### MongoDB Atlas
```
mongodb+srv://username:password@cluster.mongodb.net/database
```

## Error Handling

All operations throw specific exceptions from `@porkate/nosql`:

```typescript
try {
  await adapter.insertTransaction(transaction);
} catch (error) {
  if (error instanceof NoSQLInsertException) {
    console.error('Insert failed:', error.message);
  } else if (error instanceof NoSQLConnectionException) {
    console.error('Connection failed:', error.message);
  }
}
```

## Performance Tips

- Use projections to fetch only required fields
- Leverage indexes for frequently queried fields
- Use bulk operations for inserting multiple documents
- Enable connection pooling for concurrent operations
- Monitor slow queries and add indexes as needed

## License

MIT
