import {
  StorageFile,
  StorageObject,
  UploadOptions,
  DownloadOptions,
  DeleteOptions,
  ListOptions,
} from '../types';
import {
  UploadResponse,
  DownloadResponse,
  DeleteResponse,
  GetResponse,
  ListResponse,
  ExistsResponse,
} from './storage-response.interface';

/**
 * Core interface that all storage adapters must implement
 */
export interface IStorageAdapter {
  /**
   * Upload a file to storage
   * @param file - File to upload
   * @param options - Upload options
   * @returns Promise with upload response
   */
  upload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse>;

  /**
   * Download a file from storage
   * @param key - File key/path
   * @param options - Download options
   * @returns Promise with download response
   */
  download(key: string, options?: DownloadOptions): Promise<DownloadResponse>;

  /**
   * Delete a file from storage
   * @param key - File key/path
   * @param options - Delete options
   * @returns Promise with delete response
   */
  delete(key: string, options?: DeleteOptions): Promise<DeleteResponse>;

  /**
   * Get file metadata
   * @param key - File key/path
   * @returns Promise with file metadata
   */
  get(key: string): Promise<GetResponse>;

  /**
   * List files in storage
   * @param options - List options
   * @returns Promise with list of files
   */
  list(options?: ListOptions): Promise<ListResponse>;

  /**
   * Check if a file exists
   * @param key - File key/path
   * @returns Promise with existence check result
   */
  exists(key: string): Promise<ExistsResponse>;

  /**
   * Get the name of the storage provider
   */
  getProviderName(): string;

  /**
   * Check if the adapter is properly configured and ready
   */
  isReady(): boolean;
}
