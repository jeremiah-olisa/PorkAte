import { ICacheAdapter, IQueryClient } from '../interfaces';
import { CacheEntry, CacheKey, CacheStatus, InvalidationOptions, QueryOptions } from '../types';

/**
 * Query client implementation for Invalid8
 */
export class QueryClient implements IQueryClient {
  private adapter: ICacheAdapter;
  private defaultCacheTime: number;
  private defaultStaleTime: number;

  constructor(adapter: ICacheAdapter, options?: { cacheTime?: number; staleTime?: number }) {
    this.adapter = adapter;
    this.defaultCacheTime = options?.cacheTime ?? 5 * 60 * 1000; // 5 minutes default
    this.defaultStaleTime = options?.staleTime ?? 0;
  }

  async query<T>(
    key: CacheKey,
    fetcher: () => Promise<T>,
    options?: QueryOptions<T>,
  ): Promise<T> {
    const cacheKey = this.serializeKey(key);
    const cached = await this.adapter.get<T>(cacheKey);

    if (cached && this.isFresh(cached, options?.staleTime ?? this.defaultStaleTime)) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      const cacheTime = options?.cacheTime ?? this.defaultCacheTime;
      const entry: CacheEntry<T> = {
        key: cacheKey,
        data,
        status: CacheStatus.SUCCESS,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + cacheTime),
      };

      await this.adapter.set(cacheKey, entry);
      options?.onSuccess?.(data);
      return data;
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    }
  }

  async invalidate(key: CacheKey, options?: InvalidationOptions): Promise<void> {
    const cacheKey = this.serializeKey(key);
    await this.adapter.delete(cacheKey);
  }

  async setQueryData<T>(key: CacheKey, data: T): Promise<void> {
    const cacheKey = this.serializeKey(key);
    const entry: CacheEntry<T> = {
      key: cacheKey,
      data,
      status: CacheStatus.SUCCESS,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + this.defaultCacheTime),
    };
    await this.adapter.set(cacheKey, entry);
  }

  async getQueryData<T>(key: CacheKey): Promise<T | null> {
    const cacheKey = this.serializeKey(key);
    const cached = await this.adapter.get<T>(cacheKey);
    return cached ? cached.data : null;
  }

  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  private serializeKey(key: CacheKey): string {
    return JSON.stringify(key.queryKey);
  }

  private isFresh<T>(entry: CacheEntry<T>, staleTime: number): boolean {
    const age = Date.now() - entry.timestamp.getTime();
    return age < staleTime;
  }
}
