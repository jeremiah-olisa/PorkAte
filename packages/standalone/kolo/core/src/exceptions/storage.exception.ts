import { nameof } from '../utils';
import { StorageErrorCode } from './storage-error-codes';

/**
 * Base exception class for storage operations
 */
export class StorageException<TDetails = unknown> extends Error {
  protected readonly _code: StorageErrorCode;

  constructor(
    message: string,
    code: StorageErrorCode = StorageErrorCode.STORAGE_ERROR,
    public readonly details?: TDetails,
  ) {
    super(message);
    this._code = code;
    this.name = nameof(StorageException);
    Object.setPrototypeOf(this, StorageException.prototype);
  }

  get code(): StorageErrorCode {
    return this._code;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Exception thrown when storage adapter configuration is invalid
 */
export class StorageConfigurationException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, StorageErrorCode.STORAGE_CONFIGURATION_ERROR, details);
    this.name = nameof(StorageConfigurationException);
    Object.setPrototypeOf(this, StorageConfigurationException.prototype);
  }
}

/**
 * Exception thrown when file upload fails
 */
export class StorageUploadException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, StorageErrorCode.STORAGE_UPLOAD_ERROR, details);
    this.name = nameof(StorageUploadException);
    Object.setPrototypeOf(this, StorageUploadException.prototype);
  }
}

/**
 * Exception thrown when file download fails
 */
export class StorageDownloadException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, StorageErrorCode.STORAGE_DOWNLOAD_ERROR, details);
    this.name = nameof(StorageDownloadException);
    Object.setPrototypeOf(this, StorageDownloadException.prototype);
  }
}

/**
 * Exception thrown when file delete fails
 */
export class StorageDeleteException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, StorageErrorCode.STORAGE_DELETE_ERROR, details);
    this.name = nameof(StorageDeleteException);
    Object.setPrototypeOf(this, StorageDeleteException.prototype);
  }
}

/**
 * Exception thrown when file list operation fails
 */
export class StorageListException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, StorageErrorCode.STORAGE_LIST_ERROR, details);
    this.name = nameof(StorageListException);
    Object.setPrototypeOf(this, StorageListException.prototype);
  }
}

/**
 * Exception thrown when file not found
 */
export class FileNotFoundException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(key: string, details?: TDetails) {
    super(`File with key '${key}' not found`, StorageErrorCode.FILE_NOT_FOUND, details);
    this.name = nameof(FileNotFoundException);
    Object.setPrototypeOf(this, FileNotFoundException.prototype);
  }
}

/**
 * Exception thrown when file already exists
 */
export class FileAlreadyExistsException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(key: string, details?: TDetails) {
    super(`File with key '${key}' already exists`, StorageErrorCode.FILE_ALREADY_EXISTS, details);
    this.name = nameof(FileAlreadyExistsException);
    Object.setPrototypeOf(this, FileAlreadyExistsException.prototype);
  }
}

/**
 * Exception thrown when file type is invalid
 */
export class InvalidFileTypeException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(fileType: string, allowedTypes?: string[], details?: TDetails) {
    const message = allowedTypes
      ? `File type '${fileType}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      : `File type '${fileType}' is not allowed`;
    super(message, StorageErrorCode.INVALID_FILE_TYPE, { fileType, allowedTypes, ...details } as TDetails);
    this.name = nameof(InvalidFileTypeException);
    Object.setPrototypeOf(this, InvalidFileTypeException.prototype);
  }
}

/**
 * Exception thrown when file is too large
 */
export class FileTooLargeException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(size: number, maxSize: number, details?: TDetails) {
    super(
      `File size ${size} bytes exceeds maximum allowed size of ${maxSize} bytes`,
      StorageErrorCode.FILE_TOO_LARGE,
      { size, maxSize, ...details } as TDetails,
    );
    this.name = nameof(FileTooLargeException);
    Object.setPrototypeOf(this, FileTooLargeException.prototype);
  }
}

/**
 * Exception thrown when storage provider API call fails
 */
export class StorageProviderException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(
    message: string,
    public readonly statusCode?: number,
    details?: TDetails,
  ) {
    super(message, StorageErrorCode.STORAGE_PROVIDER_ERROR, details);
    this.name = nameof(StorageProviderException);
    Object.setPrototypeOf(this, StorageProviderException.prototype);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
    };
  }
}

/**
 * Exception thrown when storage provider times out
 */
export class StorageProviderTimeoutException<TDetails = unknown> extends StorageProviderException<TDetails> {
  constructor(message: string = 'Storage provider request timed out', details?: TDetails) {
    super(message, 408, details);
    this.name = nameof(StorageProviderTimeoutException);
    Object.setPrototypeOf(this, StorageProviderTimeoutException.prototype);
  }

  get code(): StorageErrorCode {
    return StorageErrorCode.STORAGE_PROVIDER_TIMEOUT;
  }
}

/**
 * Exception thrown when storage validation fails
 */
export class StorageValidationException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(
    message: string,
    public readonly field?: string,
    details?: TDetails,
  ) {
    super(message, StorageErrorCode.STORAGE_VALIDATION_ERROR, { field, ...details } as TDetails);
    this.name = nameof(StorageValidationException);
    Object.setPrototypeOf(this, StorageValidationException.prototype);
  }
}

/**
 * Exception thrown when storage key is invalid
 */
export class InvalidKeyException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(key: string, reason?: string, details?: TDetails) {
    const message = reason ? `Invalid storage key '${key}': ${reason}` : `Invalid storage key '${key}'`;
    super(message, StorageErrorCode.INVALID_KEY, { key, reason, ...details } as TDetails);
    this.name = nameof(InvalidKeyException);
    Object.setPrototypeOf(this, InvalidKeyException.prototype);
  }
}

/**
 * Exception thrown when storage access is denied
 */
export class StorageAccessDeniedException<TDetails = unknown> extends StorageException<TDetails> {
  constructor(message: string = 'Storage access denied', details?: TDetails) {
    super(message, StorageErrorCode.STORAGE_ACCESS_DENIED, details);
    this.name = nameof(StorageAccessDeniedException);
    Object.setPrototypeOf(this, StorageAccessDeniedException.prototype);
  }
}
