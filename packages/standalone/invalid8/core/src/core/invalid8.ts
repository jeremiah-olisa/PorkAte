import { ICacheAdapter } from '../interfaces';
import { QueryClient } from './query-client';

/**
 * Invalid8 - React Query-inspired caching library
 */
export class Invalid8 {
  private queryClient: QueryClient;
  private adapter: ICacheAdapter;

  constructor(adapter: ICacheAdapter, options?: { cacheTime?: number; staleTime?: number }) {
    this.adapter = adapter;
    this.queryClient = new QueryClient(adapter, options);
  }

  async connect(): Promise<void> {
    await this.adapter.connect();
  }

  async disconnect(): Promise<void> {
    await this.adapter.disconnect();
  }

  getQueryClient(): QueryClient {
    return this.queryClient;
  }

  getAdapter(): ICacheAdapter {
    return this.adapter;
  }
}
