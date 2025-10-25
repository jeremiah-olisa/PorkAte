# @eventbus/rabbitmq

RabbitMQ event bus adapter for EventBus.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 🌐 Distributed event processing
- 🐰 RabbitMQ-powered messaging
- 🔄 Pub/Sub pattern support
- 🛡️ Compatible with EventBus core

## Installation

```bash
npm install @eventbus/rabbitmq @eventbus/core amqplib
```

## Usage

```typescript
import { RabbitMQEventBus } from '@eventbus/rabbitmq';

const eventBus = new RabbitMQEventBus({
  adapter: 'rabbitmq',
  options: {
    url: 'amqp://localhost',
    exchange: 'events',
    exchangeType: 'topic'
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
