import { IStorageAdapter } from '../interfaces/storage-adapter.interface';
import { StorageConfigurationException } from '../exceptions';
import {
  AdapterConfig,
  AdapterEnvConfig,
  AdapterFactory,
  StorageManagerConfig,
} from '../interfaces';

/**
 * Storage Manager - Factory pattern for managing multiple storage adapters
 */
export class StorageManager {
  private readonly adapters: Map<string, IStorageAdapter> = new Map();
  private readonly factories: Map<string, AdapterFactory> = new Map();
  private readonly adapterConfigs: Map<string, AdapterConfig> = new Map();
  private defaultAdapter?: string;
  private enableFallback: boolean = false;

  constructor(config?: StorageManagerConfig) {
    if (config) {
      this.defaultAdapter = config.defaultAdapter;
      this.enableFallback = config.enableFallback ?? false;

      // Store adapter configs for later initialization
      config.adapters.forEach((adapterConfig) => {
        this.adapterConfigs.set(adapterConfig.name, adapterConfig);
      });
    }
  }

  /**
   * Register an adapter factory
   * @param name - Name of the adapter (e.g., 's3', 'cloudinary', 'local')
   * @param factory - Factory function to create the adapter instance
   */
  registerFactory<T = AdapterEnvConfig>(name: string, factory: AdapterFactory<T>): this {
    this.factories.set(name.toLowerCase(), factory as AdapterFactory<AdapterEnvConfig>);

    // If we have a config for this adapter, initialize it
    const config = this.adapterConfigs.get(name.toLowerCase());
    if (config && config.enabled !== false) {
      try {
        const adapter = factory(config.config as T);
        this.adapters.set(name.toLowerCase(), adapter);
      } catch (error) {
        console.error(`Failed to initialize adapter '${name}':`, error);
      }
    }

    return this;
  }

  /**
   * Register an adapter instance directly
   * @param name - Name of the adapter
   * @param adapter - Adapter instance
   */
  registerAdapter(name: string, adapter: IStorageAdapter): this {
    this.adapters.set(name.toLowerCase(), adapter);
    return this;
  }

  /**
   * Get a specific adapter by name
   * @param name - Name of the adapter
   * @throws {StorageConfigurationException} If adapter not found
   */
  getAdapter(name: string): IStorageAdapter {
    const adapter = this.adapters.get(name.toLowerCase());

    if (!adapter) {
      throw new StorageConfigurationException(
        `Storage adapter '${name}' is not registered or enabled`,
        {
          adapterName: name,
          availableAdapters: Array.from(this.adapters.keys()),
        },
      );
    }

    if (!adapter.isReady()) {
      throw new StorageConfigurationException(
        `Storage adapter '${name}' is not ready. Please check configuration.`,
        {
          adapterName: name,
        },
      );
    }

    return adapter;
  }

  /**
   * Get the default adapter
   * @throws {StorageConfigurationException} If no default adapter configured
   */
  getDefaultAdapter(): IStorageAdapter {
    if (!this.defaultAdapter) {
      // Try to get the first available adapter
      const firstAdapter = this.adapters.values().next().value;
      if (firstAdapter) {
        return firstAdapter;
      }

      throw new StorageConfigurationException(
        'No default adapter configured and no adapters available',
        {
          availableAdapters: Array.from(this.adapters.keys()),
        },
      );
    }

    return this.getAdapter(this.defaultAdapter);
  }

  /**
   * Get an adapter with fallback support
   * @param preferredAdapter - Preferred adapter name (optional)
   * @returns Adapter instance or null if no adapter available
   */
  getAdapterWithFallback(preferredAdapter?: string): IStorageAdapter | null {
    // Try preferred adapter first
    if (preferredAdapter) {
      try {
        const adapter = this.getAdapter(preferredAdapter);
        if (adapter.isReady()) {
          return adapter;
        }
      } catch (error) {
        if (!this.enableFallback) {
          throw error;
        }
        console.warn(`Preferred adapter '${preferredAdapter}' not available, trying fallback`);
      }
    }

    // Try default adapter
    if (this.defaultAdapter && (!preferredAdapter || preferredAdapter !== this.defaultAdapter)) {
      try {
        const adapter = this.getAdapter(this.defaultAdapter);
        if (adapter.isReady()) {
          return adapter;
        }
      } catch (error) {
        if (!this.enableFallback) {
          throw error;
        }
        console.warn(`Default adapter '${this.defaultAdapter}' not available, trying fallback`);
      }
    }

    // Try to find any available adapter (sorted by priority if configured)
    if (this.enableFallback) {
      const sortedAdapters = this.getSortedAdapters();
      for (const [name, adapter] of sortedAdapters) {
        if (adapter.isReady() && name !== preferredAdapter && name !== this.defaultAdapter) {
          console.warn(`Using fallback adapter: ${name}`);
          return adapter;
        }
      }
    }

    return null;
  }

  /**
   * Get all registered adapter names
   */
  getAvailableAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Get all ready adapter names
   */
  getReadyAdapters(): string[] {
    return Array.from(this.adapters.entries())
      .filter(([, adapter]) => adapter.isReady())
      .map(([name]) => name);
  }

  /**
   * Check if an adapter is registered
   */
  hasAdapter(name: string): boolean {
    return this.adapters.has(name.toLowerCase());
  }

  /**
   * Check if an adapter is ready
   */
  isAdapterReady(name: string): boolean {
    const adapter = this.adapters.get(name.toLowerCase());
    return adapter ? adapter.isReady() : false;
  }

  /**
   * Set the default adapter
   */
  setDefaultAdapter(name: string): this {
    if (!this.hasAdapter(name)) {
      throw new StorageConfigurationException(
        `Cannot set '${name}' as default adapter. Adapter not registered.`,
        {
          adapterName: name,
          availableAdapters: this.getAvailableAdapters(),
        },
      );
    }

    this.defaultAdapter = name.toLowerCase();
    return this;
  }

  /**
   * Enable or disable fallback support
   */
  setFallbackEnabled(enabled: boolean): this {
    this.enableFallback = enabled;
    return this;
  }

  /**
   * Remove an adapter
   */
  removeAdapter(name: string): this {
    this.adapters.delete(name.toLowerCase());
    this.factories.delete(name.toLowerCase());
    this.adapterConfigs.delete(name.toLowerCase());

    if (this.defaultAdapter === name.toLowerCase()) {
      this.defaultAdapter = undefined;
    }

    return this;
  }

  /**
   * Clear all adapters
   */
  clear(): this {
    this.adapters.clear();
    this.factories.clear();
    this.adapterConfigs.clear();
    this.defaultAdapter = undefined;
    return this;
  }

  /**
   * Get adapters sorted by priority
   */
  private getSortedAdapters(): Array<[string, IStorageAdapter]> {
    return Array.from(this.adapters.entries()).sort((a, b) => {
      const configA = this.adapterConfigs.get(a[0]);
      const configB = this.adapterConfigs.get(b[0]);
      const priorityA = configA?.priority ?? 0;
      const priorityB = configB?.priority ?? 0;
      return priorityB - priorityA; // Higher priority first
    });
  }
}
