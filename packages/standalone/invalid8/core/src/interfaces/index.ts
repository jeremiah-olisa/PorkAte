import { CacheEntry, CacheKey, InvalidationOptions, QueryOptions } from '../types';

/**
 * Core interface for cache adapters
 */
export interface ICacheAdapter {
  /**
   * Get a cache entry by key
   * @param key - Cache key
   */
  get<T>(key: string): Promise<CacheEntry<T> | null>;

  /**
   * Set a cache entry
   * @param key - Cache key
   * @param entry - Cache entry
   */
  set<T>(key: string, entry: CacheEntry<T>): Promise<void>;

  /**
   * Delete a cache entry
   * @param key - Cache key
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;

  /**
   * Check if a key exists in cache
   * @param key - Cache key
   */
  has(key: string): Promise<boolean>;

  /**
   * Get all cache keys
   */
  keys(): Promise<string[]>;

  /**
   * Connect to the cache adapter
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the cache adapter
   */
  disconnect(): Promise<void>;

  /**
   * Check if adapter is connected
   */
  isConnected(): boolean;

  /**
   * Get the name of the adapter
   */
  getAdapterName(): string;
}

/**
 * Query client interface
 */
export interface IQueryClient {
  /**
   * Fetch data with caching
   * @param key - Query key
   * @param fetcher - Function to fetch data
   * @param options - Query options
   */
  query<T>(key: CacheKey, fetcher: () => Promise<T>, options?: QueryOptions<T>): Promise<T>;

  /**
   * Invalidate cached data
   * @param key - Query key to invalidate
   * @param options - Invalidation options
   */
  invalidate(key: CacheKey, options?: InvalidationOptions): Promise<void>;

  /**
   * Set query data manually
   * @param key - Query key
   * @param data - Data to set
   */
  setQueryData<T>(key: CacheKey, data: T): Promise<void>;

  /**
   * Get query data
   * @param key - Query key
   */
  getQueryData<T>(key: CacheKey): Promise<T | null>;

  /**
   * Clear all cached data
   */
  clear(): Promise<void>;
}

/**
 * Invalid8 configuration
 */
export interface Invalid8Config {
  /**
   * Cache adapter type
   */
  adapter: 'memory' | 'redis';

  /**
   * Default cache time in milliseconds
   */
  defaultCacheTime?: number;

  /**
   * Default stale time in milliseconds
   */
  defaultStaleTime?: number;

  /**
   * Adapter specific options
   */
  options?: Record<string, unknown>;
}

/**
 * Redis specific configuration
 */
export interface RedisConfig extends Invalid8Config {
  adapter: 'redis';
  options: {
    host: string;
    port?: number;
    password?: string;
    db?: number;
  };
}
