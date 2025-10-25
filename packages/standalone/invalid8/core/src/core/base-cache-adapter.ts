import { ICacheAdapter } from '../interfaces';
import { CacheEntry } from '../types';

/**
 * Abstract base class for cache adapter implementations
 */
export abstract class BaseCacheAdapter implements ICacheAdapter {
  protected connected = false;
  protected adapterName: string;

  constructor(adapterName: string) {
    this.adapterName = adapterName;
  }

  abstract get<T>(key: string): Promise<CacheEntry<T> | null>;
  abstract set<T>(key: string, entry: CacheEntry<T>): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract has(key: string): Promise<boolean>;
  abstract keys(): Promise<string[]>;
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;

  isConnected(): boolean {
    return this.connected;
  }

  getAdapterName(): string {
    return this.adapterName;
  }
}
