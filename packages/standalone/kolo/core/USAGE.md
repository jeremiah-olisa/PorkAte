# Kolo Core - Usage Examples

This document demonstrates how to use the Kolo storage module.

## Basic Usage

### Local Storage Adapter

```typescript
import { StorageManager, LocalStorageAdapter, LocalConfig } from '@kolo/core';

// Create a local storage adapter
const localConfig: LocalConfig = {
  provider: 'local',
  rootPath: '/path/to/storage',
  baseUrl: 'http://localhost:3000/files',
  createDirectory: true,
};

const localStorage = new LocalStorageAdapter(localConfig);

// Upload a file
const file = {
  filename: 'document.pdf',
  size: 1024000,
  mimeType: 'application/pdf',
  content: Buffer.from('...'),
};

const uploadResult = await localStorage.upload(file, {
  public: true,
  metadata: { userId: '123' },
});

console.log(uploadResult.url); // File URL
```

### Using Storage Manager with Multiple Adapters

```typescript
import {
  StorageManager,
  LocalStorageAdapter,
  S3StorageAdapter,
  CloudinaryStorageAdapter,
} from '@kolo/core';

// Create storage manager
const manager = new StorageManager({
  defaultAdapter: 's3',
  enableFallback: true,
  adapters: [
    {
      name: 's3',
      enabled: true,
      priority: 1,
      config: {
        provider: 's3',
        region: 'us-east-1',
        bucket: 'my-bucket',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    },
    {
      name: 'local',
      enabled: true,
      priority: 0,
      config: {
        provider: 'local',
        rootPath: '/tmp/storage',
      },
    },
  ],
});

// Register factory functions
manager
  .registerFactory('s3', (config) => new S3StorageAdapter(config))
  .registerFactory('local', (config) => new LocalStorageAdapter(config))
  .registerFactory('cloudinary', (config) => new CloudinaryStorageAdapter(config));

// Get adapter and use it
const adapter = manager.getDefaultAdapter();
const uploadResult = await adapter.upload(file);

// Or use specific adapter
const s3Adapter = manager.getAdapter('s3');
const s3Result = await s3Adapter.upload(file);

// Or use with fallback
const adapterWithFallback = manager.getAdapterWithFallback('s3');
const result = await adapterWithFallback?.upload(file);
```

### S3 Storage Adapter (Placeholder)

```typescript
import { S3StorageAdapter, S3Config } from '@kolo/core';

const s3Config: S3Config = {
  provider: 's3',
  region: 'us-east-1',
  bucket: 'my-bucket',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  basePath: 'uploads',
  acl: 'public-read',
};

const s3Storage = new S3StorageAdapter(s3Config);

// Note: The S3 adapter is a placeholder. You need to:
// 1. Install @aws-sdk/client-s3 (^3.0.0 or later)
//    npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
// 2. Implement the actual AWS SDK integration
// The placeholder includes detailed comments showing how to integrate
```

### Cloudinary Storage Adapter (Placeholder)

```typescript
import { CloudinaryStorageAdapter, CloudinaryConfig } from '@kolo/core';

const cloudinaryConfig: CloudinaryConfig = {
  provider: 'cloudinary',
  cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
  folder: 'uploads',
  secure: true,
};

const cloudinaryStorage = new CloudinaryStorageAdapter(cloudinaryConfig);

// Note: The Cloudinary adapter is a placeholder. You need to:
// 1. Install cloudinary npm package (^1.40.0 or later)
//    npm install cloudinary
// 2. Implement the actual Cloudinary integration
// The placeholder includes detailed comments showing how to integrate
```

## Error Handling

```typescript
import {
  StorageException,
  FileNotFoundException,
  StorageConfigurationException,
} from '@kolo/core';

try {
  const result = await adapter.download('non-existent-file.pdf');
} catch (error) {
  if (error instanceof FileNotFoundException) {
    console.error('File not found:', error.message);
  } else if (error instanceof StorageConfigurationException) {
    console.error('Configuration error:', error.message);
  } else if (error instanceof StorageException) {
    console.error('Storage error:', error.code, error.message);
  }
}
```

## Available Operations

All storage adapters implement the following interface:

- `upload(file, options?)` - Upload a file
- `download(key, options?)` - Download or get URL for a file
- `delete(key, options?)` - Delete a file
- `get(key)` - Get file metadata
- `list(options?)` - List files
- `exists(key)` - Check if file exists

## Factory Pattern

The Storage Manager uses a factory pattern to create adapter instances:

```typescript
// Register a factory
manager.registerFactory('custom', (config) => new CustomStorageAdapter(config));

// Or register an instance directly
manager.registerAdapter('custom', customAdapterInstance);

// Get available adapters
const adapters = manager.getAvailableAdapters(); // ['s3', 'local', 'custom']

// Get ready adapters
const ready = manager.getReadyAdapters(); // Only properly configured adapters
```

## Notes

- The **Local adapter** is fully implemented and production-ready
- **S3 and Cloudinary adapters** are placeholders with detailed implementation guides in the source code comments. They include the complete structure and commented-out code examples showing exactly how to integrate with the respective SDKs.
- **Azure adapter** is a minimal placeholder that returns "NOT_IMPLEMENTED" errors. It requires full implementation following the S3/Cloudinary pattern.
- All adapters follow the same interface for consistency
- The Storage Manager supports fallback between adapters for reliability
