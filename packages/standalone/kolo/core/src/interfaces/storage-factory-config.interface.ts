import { IStorageAdapter } from './storage-adapter.interface';

/**
 * Configuration for a storage adapter
 */
export interface AdapterConfig<TConfig = AdapterEnvConfig> {
  /**
   * Name of the adapter (e.g., 's3', 'cloudinary', 'local')
   */
  name: string;

  /**
   * Adapter-specific configuration
   */
  config: TConfig;

  /**
   * Whether this adapter is enabled
   */
  enabled?: boolean;

  /**
   * Priority for fallback (higher = higher priority)
   */
  priority?: number;
}

/**
 * Configuration for the storage manager
 */
export interface StorageManagerConfig {
  /**
   * List of adapter configurations
   */
  adapters: AdapterConfig[];

  /**
   * Default adapter to use if none specified
   */
  defaultAdapter?: string;

  /**
   * Whether to enable automatic fallback to next available adapter
   */
  enableFallback?: boolean;
}

/**
 * Factory function type for creating adapter instances
 */
export type AdapterFactory<T = AdapterEnvConfig> = (config: T) => IStorageAdapter;

export type AdapterEnvConfig = Record<
  string,
  string | number | boolean | undefined | object | null
>;
