# @eventbus/kafka

Kafka event bus adapter for EventBus.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 🌐 Distributed event processing
- 📊 Kafka-powered messaging
- 🔄 Pub/Sub pattern support
- 🛡️ Compatible with EventBus core

## Installation

```bash
npm install @eventbus/kafka @eventbus/core kafkajs
```

## Usage

```typescript
import { KafkaEventBus } from '@eventbus/kafka';

const eventBus = new KafkaEventBus({
  adapter: 'kafka',
  options: {
    brokers: ['localhost:9092'],
    clientId: 'my-app',
    groupId: 'my-group'
  }
});
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
