import { IStorageAdapter } from '../interfaces/storage-adapter.interface';
import { StorageConfig } from '../interfaces/storage-config.interface';
import { StorageConfigurationException } from '../exceptions';
import {
  StorageFile,
  UploadOptions,
  UploadResponse,
  DownloadOptions,
  DownloadResponse,
  DeleteOptions,
  DeleteResponse,
  GetResponse,
  ListOptions,
  ListResponse,
  ExistsResponse,
} from '../interfaces';

/**
 * Abstract base class for storage adapter implementations
 */
export abstract class BaseStorageAdapter implements IStorageAdapter {
  protected config: StorageConfig;
  protected providerName: string;

  constructor(config: StorageConfig, providerName: string) {
    this.config = config;
    this.providerName = providerName;
    this.validateConfig();
  }

  /**
   * Validate adapter configuration
   * @throws {StorageConfigurationException} If configuration is invalid
   */
  protected validateConfig(): void {
    if (!this.config) {
      throw new StorageConfigurationException(`${this.providerName}: Configuration is required`, {
        providerName: this.providerName,
      });
    }
  }

  /**
   * Get the provider name
   */
  getProviderName(): string {
    return this.providerName;
  }

  /**
   * Check if the adapter is ready
   */
  isReady(): boolean {
    return !!this.config;
  }

  // Abstract methods to be implemented by concrete classes
  abstract upload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse>;
  abstract download(key: string, options?: DownloadOptions): Promise<DownloadResponse>;
  abstract delete(key: string, options?: DeleteOptions): Promise<DeleteResponse>;
  abstract get(key: string): Promise<GetResponse>;
  abstract list(options?: ListOptions): Promise<ListResponse>;
  abstract exists(key: string): Promise<ExistsResponse>;
}
