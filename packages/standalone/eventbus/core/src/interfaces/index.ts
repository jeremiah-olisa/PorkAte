import { Event, EventHandler } from '../types';

/**
 * Core interface that all event bus adapters must implement
 */
export interface IEventBus {
  /**
   * Publish an event to the event bus
   * @param event - Event to publish
   */
  publish(event: Event): Promise<void>;

  /**
   * Subscribe to events of a specific type
   * @param eventType - Type of events to subscribe to
   * @param handler - Handler function to process events
   */
  subscribe(eventType: string, handler: EventHandler): Promise<void>;

  /**
   * Unsubscribe from events of a specific type
   * @param eventType - Type of events to unsubscribe from
   * @param handler - Handler function to remove
   */
  unsubscribe(eventType: string, handler: EventHandler): Promise<void>;

  /**
   * Connect to the event bus
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the event bus
   */
  disconnect(): Promise<void>;

  /**
   * Check if the event bus is connected
   */
  isConnected(): boolean;

  /**
   * Get the name of the adapter
   */
  getAdapterName(): string;
}

/**
 * Event emitter interface for local events
 */
export interface IEventEmitter {
  /**
   * Emit an event
   * @param eventType - Type of event to emit
   * @param data - Event data
   */
  emit(eventType: string, data: unknown): void;

  /**
   * Add event listener
   * @param eventType - Type of event to listen for
   * @param handler - Handler function
   */
  on(eventType: string, handler: EventHandler): void;

  /**
   * Add one-time event listener
   * @param eventType - Type of event to listen for
   * @param handler - Handler function
   */
  once(eventType: string, handler: EventHandler): void;

  /**
   * Remove event listener
   * @param eventType - Type of event
   * @param handler - Handler function to remove
   */
  off(eventType: string, handler: EventHandler): void;

  /**
   * Remove all listeners for an event type
   * @param eventType - Type of event (optional, removes all if not provided)
   */
  removeAllListeners(eventType?: string): void;
}

/**
 * Configuration for event bus adapter
 */
export interface EventBusConfig {
  /**
   * Adapter type (memory, rabbitmq, kafka)
   */
  adapter: 'memory' | 'rabbitmq' | 'kafka';

  /**
   * Connection options specific to the adapter
   */
  options?: Record<string, unknown>;
}

/**
 * RabbitMQ specific configuration
 */
export interface RabbitMQConfig extends EventBusConfig {
  adapter: 'rabbitmq';
  options: {
    url: string;
    exchange?: string;
    exchangeType?: string;
    durable?: boolean;
  };
}

/**
 * Kafka specific configuration
 */
export interface KafkaConfig extends EventBusConfig {
  adapter: 'kafka';
  options: {
    brokers: string[];
    clientId?: string;
    groupId?: string;
  };
}
