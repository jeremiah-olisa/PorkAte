import { IEventBus } from '../interfaces';
import { Event, EventHandler } from '../types';

/**
 * Abstract base class for event bus implementations
 */
export abstract class BaseEventBus implements IEventBus {
  protected connected = false;
  protected adapterName: string;

  constructor(adapterName: string) {
    this.adapterName = adapterName;
  }

  abstract publish(event: Event): Promise<void>;
  abstract subscribe(eventType: string, handler: EventHandler): Promise<void>;
  abstract unsubscribe(eventType: string, handler: EventHandler): Promise<void>;
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;

  isConnected(): boolean {
    return this.connected;
  }

  getAdapterName(): string {
    return this.adapterName;
  }
}
