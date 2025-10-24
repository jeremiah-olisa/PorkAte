# Kolo

Secure storage adapter for documents and files (Kolo means "piggybank" or "secure box" in Yoruba).

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 📦 Multiple storage backends (S3, Azure Blob, Local)
- 🔐 Encrypted storage
- ⏱️ Time-limited access URLs
- 📊 Storage metrics
- 🛡️ Secure file handling
- 📄 Perfect for KYC documents

## Installation

```bash
npm install @kolo/core
# Install storage providers as needed
npm install @aws-sdk/client-s3 @azure/storage-blob
```

## Documentation

See [full documentation](../../docs/packages/kolo/README.md).

## Extraction Guide

This package is designed to be extracted to a separate repository. See [PACKAGE-MIGRATION-GUIDE.md](../../docs/migration/PACKAGE-MIGRATION-GUIDE.md).

## License

MIT
