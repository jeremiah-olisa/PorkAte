/**
 * Base configuration for all storage adapters
 */
export interface StorageConfig {
  /**
   * Provider name
   */
  provider: string;

  /**
   * Whether to enable debug logging
   */
  debug?: boolean;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
}

/**
 * S3 storage configuration
 */
export interface S3Config extends StorageConfig {
  /**
   * AWS region
   */
  region: string;

  /**
   * S3 bucket name
   */
  bucket: string;

  /**
   * AWS access key ID
   */
  accessKeyId?: string;

  /**
   * AWS secret access key
   */
  secretAccessKey?: string;

  /**
   * Custom S3 endpoint (for S3-compatible services)
   */
  endpoint?: string;

  /**
   * Whether to force path-style URLs
   */
  forcePathStyle?: boolean;

  /**
   * Default ACL for uploads
   */
  acl?: string;

  /**
   * Base path/prefix for all operations
   */
  basePath?: string;
}

/**
 * Cloudinary storage configuration
 */
export interface CloudinaryConfig extends StorageConfig {
  /**
   * Cloudinary cloud name
   */
  cloudName: string;

  /**
   * API key
   */
  apiKey: string;

  /**
   * API secret
   */
  apiSecret: string;

  /**
   * Default folder for uploads
   */
  folder?: string;

  /**
   * Whether to use secure URLs
   */
  secure?: boolean;

  /**
   * Resource type (image, video, raw, auto)
   */
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

/**
 * Local filesystem storage configuration
 */
export interface LocalConfig extends StorageConfig {
  /**
   * Root directory for file storage
   */
  rootPath: string;

  /**
   * Base URL for serving files
   */
  baseUrl?: string;

  /**
   * Whether to create directory if it doesn't exist
   */
  createDirectory?: boolean;

  /**
   * File permissions (Unix-style)
   */
  filePermissions?: number;

  /**
   * Directory permissions (Unix-style)
   */
  directoryPermissions?: number;
}
