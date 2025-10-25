/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Common types for storage operations
 */

export enum StorageStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum StorageProvider {
  S3 = 's3',
  CLOUDINARY = 'cloudinary',
  LOCAL = 'local',
  AZURE = 'azure',
}

export interface StorageMetadata {
  [key: string]: any;
}

export interface StorageFile {
  /**
   * Original filename
   */
  filename: string;

  /**
   * File size in bytes
   */
  size: number;

  /**
   * MIME type
   */
  mimeType: string;

  /**
   * File content (Buffer or ReadStream)
   */
  content: Buffer | any;

  /**
   * Additional metadata
   */
  metadata?: StorageMetadata;
}

export interface StorageObject {
  /**
   * Unique key/path for the file
   */
  key: string;

  /**
   * File URL (if available)
   */
  url?: string;

  /**
   * Public URL (if available)
   */
  publicUrl?: string;

  /**
   * File size in bytes
   */
  size?: number;

  /**
   * Content type
   */
  contentType?: string;

  /**
   * Last modified date
   */
  lastModified?: Date;

  /**
   * ETag
   */
  etag?: string;

  /**
   * Additional metadata
   */
  metadata?: StorageMetadata;
}

export interface StorageError {
  code: string;
  message: string;
  details?: any;
}

export interface UploadOptions {
  /**
   * Custom key/path for the file (if not provided, auto-generated)
   */
  key?: string;

  /**
   * Make file publicly accessible
   */
  public?: boolean;

  /**
   * Content type override
   */
  contentType?: string;

  /**
   * Additional metadata
   */
  metadata?: StorageMetadata;

  /**
   * Expiration time in seconds (for signed URLs)
   */
  expiresIn?: number;
}

export interface DownloadOptions {
  /**
   * Expiration time in seconds for signed URL
   */
  expiresIn?: number;

  /**
   * Force download instead of inline display
   */
  forceDownload?: boolean;

  /**
   * Custom filename for download
   */
  filename?: string;
}

export interface DeleteOptions {
  /**
   * Delete multiple versions of the file
   */
  allVersions?: boolean;
}

export interface ListOptions {
  /**
   * Prefix to filter by
   */
  prefix?: string;

  /**
   * Maximum number of items to return
   */
  maxKeys?: number;

  /**
   * Continuation token for pagination
   */
  continuationToken?: string;
}

export interface ListResult {
  /**
   * List of storage objects
   */
  objects: StorageObject[];

  /**
   * Continuation token for next page
   */
  nextContinuationToken?: string;

  /**
   * Whether there are more results
   */
  hasMore: boolean;
}
