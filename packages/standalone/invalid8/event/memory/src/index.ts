import { BaseEventBus, Event, EventHandler } from '@eventbus/core';

/**
 * In-memory event bus adapter for development and testing
 */
export class MemoryEventBus extends BaseEventBus {
  private handlers: Map<string, Set<EventHandler>>;

  constructor() {
    super('memory');
    this.handlers = new Map();
  }

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.handlers.clear();
    this.connected = false;
  }

  async publish(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      const promises = Array.from(handlers).map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error handling event ${event.type}:`, error);
        }
      });
      await Promise.all(promises);
    }
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)?.add(handler);
  }

  async unsubscribe(eventType: string, handler: EventHandler): Promise<void> {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }
}
