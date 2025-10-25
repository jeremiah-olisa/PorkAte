import { IEventEmitter } from '../interfaces';
import { EventHandler, Event } from '../types';

/**
 * Simple event emitter implementation for local events
 */
export class EventEmitter implements IEventEmitter {
  private listeners: Map<string, Set<EventHandler>>;

  constructor() {
    this.listeners = new Map();
  }

  emit(eventType: string, data: unknown): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      const event: Event = {
        id: this.generateEventId(),
        type: eventType,
        data,
        timestamp: new Date(),
      };

      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  on(eventType: string, handler: EventHandler): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(handler);
  }

  once(eventType: string, handler: EventHandler): void {
    const onceHandler: EventHandler = (event: Event) => {
      handler(event);
      this.off(eventType, onceHandler);
    };
    this.on(eventType, onceHandler);
  }

  off(eventType: string, handler: EventHandler): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
