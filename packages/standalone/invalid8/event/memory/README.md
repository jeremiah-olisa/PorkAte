# @eventbus/memory

In-memory event bus adapter for development and testing.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 🚀 Fast in-memory event processing
- 💾 Perfect for development and testing
- 🔄 Pub/Sub pattern support
- 🛡️ Compatible with EventBus core

## Installation

```bash
npm install @eventbus/memory @eventbus/core
```

## Usage

```typescript
import { MemoryEventBus } from '@eventbus/memory';

const eventBus = new MemoryEventBus();
await eventBus.connect();

// Subscribe to events
await eventBus.subscribe('user.created', async (event) => {
  console.log('User created:', event.data);
});

// Publish events
await eventBus.publish({
  id: '1',
  type: 'user.created',
  data: { userId: '123' },
  timestamp: new Date()
});
```

## License

MIT
