# @invalid8/redis

Redis cache adapter for Invalid8.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 🔴 Redis-powered caching
- 🌐 Distributed cache support
- ⏱️ TTL support
- 🔄 Compatible with Invalid8 core

## Installation

```bash
npm install @invalid8/redis @invalid8/core ioredis
```

## Usage

```typescript
import { Invalid8 } from '@invalid8/core';
import { RedisCacheAdapter } from '@invalid8/redis';

const cacheAdapter = new RedisCacheAdapter({
  adapter: 'redis',
  options: {
    host: 'localhost',
    port: 6379
  }
});
await cacheAdapter.connect();

const invalid8 = new Invalid8(cacheAdapter);
```

## Documentation

See [full Invalid8 documentation](../../../docs/packages/invalid8/README.md).

## License

MIT
