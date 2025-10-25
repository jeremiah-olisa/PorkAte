import { MongoClient, Db, Collection, Filter, Document, CreateIndexesOptions } from 'mongodb';
import {
  BaseNoSQLAdapter,
  Transaction,
  QueryOptions,
  PaginatedResult,
  BulkInsertOptions,
  BulkInsertResult,
  MongoDBConfig,
  NoSQLConfigurationException,
  NoSQLConnectionException,
  NoSQLDisconnectionException,
  NoSQLInsertException,
  NoSQLQueryException,
  NoSQLUpdateException,
  NoSQLDeleteException,
  TransactionNotFoundException,
  retryOperation,
  sanitizeMetadata,
} from '@porkate/nosql';

/**
 * MongoDB NoSQL adapter implementation
 */
export class MongoDBAdapter extends BaseNoSQLAdapter {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<Document> | null = null;
  private readonly mongoConfig: MongoDBConfig;

  constructor(config: MongoDBConfig) {
    super(config, 'MongoDB');
    this.mongoConfig = config;
    this.validateMongoConfig();
  }

  /**
   * Validate MongoDB-specific configuration
   */
  private validateMongoConfig(): void {
    if (!this.mongoConfig.uri) {
      throw new NoSQLConfigurationException('MongoDB: Connection URI is required', {
        databaseName: this.databaseName,
      });
    }

    if (!this.mongoConfig.database) {
      throw new NoSQLConfigurationException('MongoDB: Database name is required', {
        databaseName: this.databaseName,
      });
    }
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      const clientOptions: any = {
        maxPoolSize: this.mongoConfig.poolSize || 10,
        ...(this.mongoConfig.username &&
          this.mongoConfig.password && {
            auth: {
              username: this.mongoConfig.username,
              password: this.mongoConfig.password,
            },
          }),
        ...(this.mongoConfig.authSource && { authSource: this.mongoConfig.authSource }),
        ...(this.mongoConfig.replicaSet && { replicaSet: this.mongoConfig.replicaSet }),
        ...(this.mongoConfig.ssl && { tls: true }),
      };

      this.client = new MongoClient(this.mongoConfig.uri, clientOptions);

      await retryOperation(
        () => this.client!.connect(),
        this.mongoConfig.maxRetries || 3,
        this.mongoConfig.timeout || 5000,
      );

      this.db = this.client.db(this.mongoConfig.database);
      this.collection = this.db.collection('transactions');

      await this.ensureIndexes();

      this.setConnected(true);

      if (this.mongoConfig.debug) {
        console.log('[MongoDB] Connected successfully');
      }
    } catch (error) {
      throw new NoSQLConnectionException(`Failed to connect to MongoDB: ${(error as Error).message}`, {
        error: error as Error,
      });
    }
  }

  /**
   * Ensure required indexes exist
   */
  private async ensureIndexes(): Promise<void> {
    if (!this.collection) {
      throw new NoSQLConnectionException('Collection is not initialized');
    }

    try {
      await this.collection.createIndex({ reference: 1 }, { name: 'reference_1', unique: true });
      await this.collection.createIndex({ idempotencyKey: 1 }, { name: 'idempotencyKey_1', sparse: true });
      await this.collection.createIndex({ sourceWalletId: 1 }, { name: 'sourceWalletId_1' });
      await this.collection.createIndex({ destinationWalletId: 1 }, { name: 'destinationWalletId_1' });
      await this.collection.createIndex({ status: 1 }, { name: 'status_1' });
      await this.collection.createIndex({ createdAt: -1 }, { name: 'createdAt_-1' });
      await this.collection.createIndex(
        { sourceWalletId: 1, createdAt: -1 },
        { name: 'sourceWalletId_1_createdAt_-1' },
      );
      await this.collection.createIndex(
        { destinationWalletId: 1, createdAt: -1 },
        { name: 'destinationWalletId_1_createdAt_-1' },
      );
    } catch (error) {
      if (this.mongoConfig.debug) {
        console.error('[MongoDB] Index creation error:', error);
      }
      // Continue even if indexes fail (they might already exist)
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collection = null;
      this.setConnected(false);

      if (this.mongoConfig.debug) {
        console.log('[MongoDB] Disconnected successfully');
      }
    } catch (error) {
      throw new NoSQLDisconnectionException(`Failed to disconnect from MongoDB: ${(error as Error).message}`, {
        error: error as Error,
      });
    }
  }

  /**
   * Insert a single transaction
   */
  async insertTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.connected || !this.collection) {
      throw new NoSQLConnectionException('Not connected to MongoDB');
    }

    const doc = this.transactionToDocument(transaction);

    try {
      await this.collection.insertOne(doc);
      return transaction;
    } catch (error) {
      throw new NoSQLInsertException(`Failed to insert transaction: ${(error as Error).message}`, {
        transactionId: transaction.id,
        error: error as Error,
      });
    }
  }

  /**
   * Bulk insert transactions
   */
  async bulkInsertTransactions(
    transactions: Transaction[],
    options?: BulkInsertOptions,
  ): Promise<BulkInsertResult> {
    if (!this.connected || !this.collection) {
      throw new NoSQLConnectionException('Not connected to MongoDB');
    }

    const throwOnError = options?.throwOnError ?? false;
    const documents = transactions.map((t) => this.transactionToDocument(t));

    try {
      const result = await this.collection.insertMany(documents, { ordered: false });
      return {
        successful: result.insertedCount,
        failed: transactions.length - result.insertedCount,
      };
    } catch (error: any) {
      const successful = error.result?.insertedCount || 0;
      const failed = transactions.length - successful;

      if (throwOnError) {
        throw new NoSQLInsertException(`Bulk insert partially failed`, {
          successful,
          failed,
          error: error as Error,
        });
      }

      return { successful, failed };
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    if (!this.connected || !this.collection) {
      throw new NoSQLConnectionException('Not connected to MongoDB');
    }

    try {
      const doc = await this.collection.findOne({ id });
      return doc ? this.documentToTransaction(doc) : null;
    } catch (error) {
      throw new NoSQLQueryException(`Failed to get transaction by ID: ${(error as Error).message}`, {
        id,
        error: error as Error,
      });
    }
  }

  /**
   * Get transaction by reference
   */
  async getTransactionByReference(reference: string): Promise<Transaction | null> {
    if (!this.connected || !this.collection) {
      throw new NoSQLConnectionException('Not connected to MongoDB');
    }

    try {
      const doc = await this.collection.findOne({ reference });
      return doc ? this.documentToTransaction(doc) : null;
    } catch (error) {
      throw new NoSQLQueryException(`Failed to get transaction by reference: ${(error as Error).message}`, {
        reference,
        error: error as Error,
      });
    }
  }

  /**
   * Get transaction by idempotency key
   */
  async getTransactionByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null> {
    if (!this.connected || !this.collection) {
      throw new NoSQLConnectionException('Not connected to MongoDB');
    }

    try {
      const doc = await this.collection.findOne({ idempotencyKey });
      return doc ? this.documentToTransaction(doc) : null;
    } catch (error) {
      throw new NoSQLQueryException(`Failed to get transaction by idempotency key: ${(error as Error).message}`, {
        idempotencyKey,
        error: error as Error,
      });
    }
  }

  /**
   * Query transactions by wallet ID
   */
  async queryByWalletId(walletId: string, options?: QueryOptions): Promise<PaginatedResult<Transaction>> {
    if (!this.connected || !this.collection) {
      throw new NoSQLConnectionException('Not connected to MongoDB');
    }

    const limit = options?.limit || 50;
    const filter: Filter<Document> = {
      $or: [{ sourceWalletId: walletId }, { destinationWalletId: walletId }],
    };

    if (options?.status) {
      filter.status = options.status;
    }

    if (options?.type) {
      filter.type = options.type;
    }

    if (options?.startDate || options?.endDate) {
      filter.createdAt = {};
      if (options.startDate) {
        filter.createdAt.$gte = options.startDate;
      }
      if (options.endDate) {
        filter.createdAt.$lte = options.endDate;
      }
    }

    if (options?.cursor) {
      filter.id = { $lt: options.cursor };
    }

    try {
      const sortField = options?.sortBy || 'createdAt';
      const sortOrder = options?.sortOrder === 'asc' ? 1 : -1;

      const docs = await this.collection
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .limit(limit + 1)
        .toArray();

      const hasMore = docs.length > limit;
      const items = docs.slice(0, limit).map((doc) => this.documentToTransaction(doc));

      return {
        items,
        hasMore,
        nextCursor: hasMore ? items[items.length - 1].id : undefined,
      };
    } catch (error) {
      throw new NoSQLQueryException(`Failed to query transactions by wallet ID: ${(error as Error).message}`, {
        walletId,
        error: error as Error,
      });
    }
  }

  /**
   * Query transactions by date range
   */
  async queryByDateRange(
    startDate: Date,
    endDate: Date,
    options?: QueryOptions,
  ): Promise<PaginatedResult<Transaction>> {
    if (!this.connected || !this.collection) {
      throw new NoSQLConnectionException('Not connected to MongoDB');
    }

    const limit = options?.limit || 50;
    const filter: Filter<Document> = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (options?.status) {
      filter.status = options.status;
    }

    if (options?.type) {
      filter.type = options.type;
    }

    if (options?.cursor) {
      filter.id = { $lt: options.cursor };
    }

    try {
      const sortField = options?.sortBy || 'createdAt';
      const sortOrder = options?.sortOrder === 'asc' ? 1 : -1;

      const docs = await this.collection
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .limit(limit + 1)
        .toArray();

      const hasMore = docs.length > limit;
      const items = docs.slice(0, limit).map((doc) => this.documentToTransaction(doc));

      return {
        items,
        hasMore,
        nextCursor: hasMore ? items[items.length - 1].id : undefined,
      };
    } catch (error) {
      throw new NoSQLQueryException(`Failed to query transactions by date range: ${(error as Error).message}`, {
        startDate,
        endDate,
        error: error as Error,
      });
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(id: string, status: string): Promise<Transaction> {
    if (!this.connected || !this.collection) {
      throw new NoSQLConnectionException('Not connected to MongoDB');
    }

    try {
      const result = await this.collection.findOneAndUpdate(
        { id },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      );

      if (!result) {
        throw new TransactionNotFoundException(id);
      }

      return this.documentToTransaction(result);
    } catch (error) {
      throw new NoSQLUpdateException(`Failed to update transaction status: ${(error as Error).message}`, {
        id,
        status,
        error: error as Error,
      });
    }
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(id: string): Promise<boolean> {
    if (!this.connected || !this.collection) {
      throw new NoSQLConnectionException('Not connected to MongoDB');
    }

    try {
      const result = await this.collection.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      throw new NoSQLDeleteException(`Failed to delete transaction: ${(error as Error).message}`, {
        id,
        error: error as Error,
      });
    }
  }

  /**
   * Count transactions for a wallet
   */
  async countTransactions(walletId: string, options?: QueryOptions): Promise<number> {
    if (!this.connected || !this.collection) {
      throw new NoSQLConnectionException('Not connected to MongoDB');
    }

    const filter: Filter<Document> = {
      $or: [{ sourceWalletId: walletId }, { destinationWalletId: walletId }],
    };

    if (options?.status) {
      filter.status = options.status;
    }

    if (options?.type) {
      filter.type = options.type;
    }

    if (options?.startDate || options?.endDate) {
      filter.createdAt = {};
      if (options.startDate) {
        filter.createdAt.$gte = options.startDate;
      }
      if (options.endDate) {
        filter.createdAt.$lte = options.endDate;
      }
    }

    try {
      return await this.collection.countDocuments(filter);
    } catch (error) {
      throw new NoSQLQueryException(`Failed to count transactions: ${(error as Error).message}`, {
        walletId,
        error: error as Error,
      });
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    if (!this.connected || !this.db) {
      return { healthy: false, message: 'Not connected to MongoDB' };
    }

    try {
      await this.db.admin().ping();
      return { healthy: true };
    } catch (error) {
      return { healthy: false, message: (error as Error).message };
    }
  }

  /**
   * Convert Transaction to MongoDB document
   */
  private transactionToDocument(transaction: Transaction): Document {
    return {
      id: transaction.id,
      reference: transaction.reference,
      type: transaction.type,
      sourceWalletId: transaction.sourceWalletId,
      destinationWalletId: transaction.destinationWalletId,
      amount: transaction.amount,
      currency: transaction.currency,
      fees: transaction.fees,
      status: transaction.status,
      narration: transaction.narration,
      metadata: transaction.metadata ? sanitizeMetadata(transaction.metadata) : undefined,
      idempotencyKey: transaction.idempotencyKey,
      hash: transaction.hash,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      completedAt: transaction.completedAt,
    };
  }

  /**
   * Convert MongoDB document to Transaction
   */
  private documentToTransaction(doc: Document): Transaction {
    return {
      id: doc.id,
      reference: doc.reference,
      type: doc.type,
      sourceWalletId: doc.sourceWalletId,
      destinationWalletId: doc.destinationWalletId,
      amount: doc.amount,
      currency: doc.currency,
      fees: doc.fees,
      status: doc.status,
      narration: doc.narration,
      metadata: doc.metadata,
      idempotencyKey: doc.idempotencyKey,
      hash: doc.hash,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
      completedAt: doc.completedAt ? new Date(doc.completedAt) : undefined,
    };
  }
}
