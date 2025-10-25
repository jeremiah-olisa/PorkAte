import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { BaseStorageAdapter } from '../core/base-storage-adapter';
import { LocalConfig } from '../interfaces/storage-config.interface';
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
  StorageObject,
} from '../interfaces';
import {
  StorageConfigurationException,
  StorageUploadException,
  StorageDownloadException,
  StorageDeleteException,
  FileNotFoundException,
} from '../exceptions';
import { generateKey, sanitizeFilename, normalizePath } from '../utils';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const access = promisify(fs.access);

/**
 * Local filesystem storage adapter
 */
export class LocalStorageAdapter extends BaseStorageAdapter {
  private readonly rootPath: string;
  private readonly baseUrl?: string;

  constructor(config: LocalConfig) {
    super(config, 'Local');
    
    if (!config.rootPath) {
      throw new StorageConfigurationException('Root path is required for local storage', {
        provider: 'Local',
      });
    }

    this.rootPath = path.resolve(config.rootPath);
    this.baseUrl = config.baseUrl;

    // Create root directory if it doesn't exist
    if (config.createDirectory !== false) {
      this.ensureDirectoryExists(this.rootPath).catch((error) => {
        console.error('Failed to create root directory:', error);
      });
    }
  }

  /**
   * Upload a file
   */
  async upload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse> {
    try {
      const key = options?.key || this.generateFileKey(file.filename);
      const filePath = this.getFilePath(key);
      
      // Ensure directory exists
      await this.ensureDirectoryExists(path.dirname(filePath));

      // Write file
      await writeFile(filePath, file.content);

      // Set permissions if specified
      const localConfig = this.config as LocalConfig;
      if (localConfig.filePermissions) {
        await promisify(fs.chmod)(filePath, localConfig.filePermissions);
      }

      const url = this.getFileUrl(key);

      return {
        success: true,
        key,
        url,
        publicUrl: options?.public ? url : undefined,
        size: file.size,
        metadata: {
          ...options?.metadata,
          filename: file.filename,
          mimeType: file.mimeType,
        },
      };
    } catch (error) {
      return this.handleError(error, 'Failed to upload file');
    }
  }

  /**
   * Download a file
   */
  async download(key: string, options?: DownloadOptions): Promise<DownloadResponse> {
    try {
      const filePath = this.getFilePath(key);

      // Check if file exists
      await access(filePath, fs.constants.R_OK);

      const content = await readFile(filePath);
      const url = this.getFileUrl(key);

      return {
        success: true,
        url,
        content,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new FileNotFoundException(key);
      }
      return this.handleError(error, 'Failed to download file');
    }
  }

  /**
   * Delete a file
   */
  async delete(key: string, options?: DeleteOptions): Promise<DeleteResponse> {
    try {
      const filePath = this.getFilePath(key);

      // Check if file exists
      await access(filePath, fs.constants.F_OK);

      await unlink(filePath);

      return {
        success: true,
        key,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new FileNotFoundException(key);
      }
      return this.handleError(error, 'Failed to delete file');
    }
  }

  /**
   * Get file metadata
   */
  async get(key: string): Promise<GetResponse> {
    try {
      const filePath = this.getFilePath(key);
      const stats = await stat(filePath);

      const object: StorageObject = {
        key,
        url: this.getFileUrl(key),
        size: stats.size,
        lastModified: stats.mtime,
      };

      return {
        success: true,
        object,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new FileNotFoundException(key);
      }
      return this.handleError(error, 'Failed to get file metadata');
    }
  }

  /**
   * List files
   */
  async list(options?: ListOptions): Promise<ListResponse> {
    try {
      const prefix = options?.prefix || '';
      const searchPath = path.join(this.rootPath, prefix);
      
      const files = await this.listFilesRecursive(searchPath, prefix);
      
      // Apply maxKeys limit if specified
      const maxKeys = options?.maxKeys || files.length;
      const limitedFiles = files.slice(0, maxKeys);

      return {
        success: true,
        result: {
          objects: limitedFiles,
          hasMore: files.length > maxKeys,
        },
      };
    } catch (error) {
      return this.handleError(error, 'Failed to list files');
    }
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<ExistsResponse> {
    try {
      const filePath = this.getFilePath(key);
      await access(filePath, fs.constants.F_OK);

      return {
        success: true,
        exists: true,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {
          success: true,
          exists: false,
        };
      }
      return this.handleError(error, 'Failed to check file existence');
    }
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await access(dirPath, fs.constants.F_OK);
    } catch (error) {
      const localConfig = this.config as LocalConfig;
      const options: any = { recursive: true };
      
      if (localConfig.directoryPermissions) {
        options.mode = localConfig.directoryPermissions;
      }
      
      await mkdir(dirPath, options);
    }
  }

  /**
   * List files recursively
   */
  private async listFilesRecursive(dir: string, prefix: string): Promise<StorageObject[]> {
    const files: StorageObject[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = normalizePath(path.relative(this.rootPath, fullPath));

        if (entry.isDirectory()) {
          const subFiles = await this.listFilesRecursive(fullPath, prefix);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const stats = await stat(fullPath);
          files.push({
            key: relativePath,
            url: this.getFileUrl(relativePath),
            size: stats.size,
            lastModified: stats.mtime,
          });
        }
      }
    } catch (error) {
      // If directory doesn't exist, return empty array
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }

    return files;
  }

  /**
   * Get file path from key
   */
  private getFilePath(key: string): string {
    const normalized = normalizePath(key);
    return path.join(this.rootPath, normalized);
  }

  /**
   * Get file URL
   */
  private getFileUrl(key: string): string {
    if (this.baseUrl) {
      return `${this.baseUrl}/${key}`;
    }
    return `file://${this.getFilePath(key)}`;
  }

  /**
   * Generate file key
   */
  private generateFileKey(filename: string): string {
    const sanitized = sanitizeFilename(filename);
    const ext = path.extname(sanitized);
    const base = path.basename(sanitized, ext);
    return generateKey(base, ext.slice(1));
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown, defaultMessage: string): any {
    if (error instanceof Error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: error.message || defaultMessage,
          details: error,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: defaultMessage,
        details: error,
      },
    };
  }
}
