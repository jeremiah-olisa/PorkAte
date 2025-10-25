import { BaseCacheAdapter, CacheEntry } from '@invalid8/core';

/**
 * In-memory cache adapter for development and testing
 */
export class MemoryCacheAdapter extends BaseCacheAdapter {
  private cache: Map<string, CacheEntry>;

  constructor() {
    super('memory');
    this.cache = new Map();
  }

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.cache.clear();
    this.connected = false;
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt && entry.expiresAt < new Date()) {
      await this.delete(key);
      return null;
    }

    return entry as CacheEntry<T>;
  }

  async set<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }
}
