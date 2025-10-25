# @invalid8/memory

In-memory cache adapter for Invalid8.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 🚀 Fast in-memory caching
- 💾 Perfect for development and testing
- ⏱️ TTL support
- 🔄 Compatible with Invalid8 core

## Installation

```bash
npm install @invalid8/memory @invalid8/core
```

## Usage

```typescript
import { Invalid8 } from '@invalid8/core';
import { MemoryCacheAdapter } from '@invalid8/memory';

const cacheAdapter = new MemoryCacheAdapter();
await cacheAdapter.connect();

const invalid8 = new Invalid8(cacheAdapter);
```

## Documentation

See [full Invalid8 documentation](../../../docs/packages/invalid8/README.md).

## License

MIT
