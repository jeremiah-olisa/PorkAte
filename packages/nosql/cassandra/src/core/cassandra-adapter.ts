import { Client, types, DseClientOptions } from 'cassandra-driver';
import {
  BaseNoSQLAdapter,
  Transaction,
  QueryOptions,
  PaginatedResult,
  BulkInsertOptions,
  BulkInsertResult,
  CassandraConfig,
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
 * Cassandra NoSQL adapter implementation
 */
export class CassandraAdapter extends BaseNoSQLAdapter {
  private client: Client | null = null;
  private readonly cassandraConfig: CassandraConfig;

  constructor(config: CassandraConfig) {
    super(config, 'Cassandra');
    this.cassandraConfig = config;
    this.validateCassandraConfig();
  }

  /**
   * Validate Cassandra-specific configuration
   */
  private validateCassandraConfig(): void {
    if (!this.cassandraConfig.contactPoints || this.cassandraConfig.contactPoints.length === 0) {
      throw new NoSQLConfigurationException('Cassandra: Contact points are required', {
        databaseName: this.databaseName,
      });
    }

    if (!this.cassandraConfig.localDataCenter) {
      throw new NoSQLConfigurationException('Cassandra: Local data center is required', {
        databaseName: this.databaseName,
      });
    }

    if (!this.cassandraConfig.keyspace) {
      throw new NoSQLConfigurationException('Cassandra: Keyspace is required', {
        databaseName: this.databaseName,
      });
    }
  }

  /**
   * Connect to Cassandra
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      const clientOptions: DseClientOptions = {
        contactPoints: this.cassandraConfig.contactPoints,
        localDataCenter: this.cassandraConfig.localDataCenter,
        keyspace: this.cassandraConfig.keyspace,
        ...(this.cassandraConfig.port && { protocolOptions: { port: this.cassandraConfig.port } }),
        ...(this.cassandraConfig.username &&
          this.cassandraConfig.password && {
            credentials: {
              username: this.cassandraConfig.username,
              password: this.cassandraConfig.password,
            },
          }),
        ...(this.cassandraConfig.ssl && { sslOptions: {} }),
      };

      this.client = new Client(clientOptions);

      await retryOperation(
        () => this.client!.connect(),
        this.cassandraConfig.maxRetries || 3,
        this.cassandraConfig.timeout || 5000,
      );

      await this.ensureSchema();

      this.setConnected(true);

      if (this.cassandraConfig.debug) {
        console.log('[Cassandra] Connected successfully');
      }
    } catch (error) {
      throw new NoSQLConnectionException(`Failed to connect to Cassandra: ${(error as Error).message}`, {
        error: error as Error,
      });
    }
  }

  /**
   * Ensure the required schema exists
   */
  private async ensureSchema(): Promise<void> {
    if (!this.client) {
      throw new NoSQLConnectionException('Client is not initialized');
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${this.cassandraConfig.keyspace}.transactions (
        id UUID PRIMARY KEY,
        reference TEXT,
        type TEXT,
        source_wallet_id TEXT,
        destination_wallet_id TEXT,
        amount DECIMAL,
        currency TEXT,
        fees DECIMAL,
        status TEXT,
        narration TEXT,
        metadata TEXT,
        idempotency_key TEXT,
        hash TEXT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        completed_at TIMESTAMP
      )
    `;

    const createIndexQueries = [
      `CREATE INDEX IF NOT EXISTS ON ${this.cassandraConfig.keyspace}.transactions (reference)`,
      `CREATE INDEX IF NOT EXISTS ON ${this.cassandraConfig.keyspace}.transactions (idempotency_key)`,
      `CREATE INDEX IF NOT EXISTS ON ${this.cassandraConfig.keyspace}.transactions (source_wallet_id)`,
      `CREATE INDEX IF NOT EXISTS ON ${this.cassandraConfig.keyspace}.transactions (destination_wallet_id)`,
      `CREATE INDEX IF NOT EXISTS ON ${this.cassandraConfig.keyspace}.transactions (status)`,
    ];

    try {
      await this.client.execute(createTableQuery);
      for (const indexQuery of createIndexQueries) {
        await this.client.execute(indexQuery);
      }
    } catch (error) {
      if (this.cassandraConfig.debug) {
        console.error('[Cassandra] Schema creation error:', error);
      }
      // Continue even if indexes fail (they might already exist)
    }
  }

  /**
   * Disconnect from Cassandra
   */
  async disconnect(): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      await this.client.shutdown();
      this.client = null;
      this.setConnected(false);

      if (this.cassandraConfig.debug) {
        console.log('[Cassandra] Disconnected successfully');
      }
    } catch (error) {
      throw new NoSQLDisconnectionException(`Failed to disconnect from Cassandra: ${(error as Error).message}`, {
        error: error as Error,
      });
    }
  }

  /**
   * Insert a single transaction
   */
  async insertTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.connected || !this.client) {
      throw new NoSQLConnectionException('Not connected to Cassandra');
    }

    const query = `
      INSERT INTO ${this.cassandraConfig.keyspace}.transactions (
        id, reference, type, source_wallet_id, destination_wallet_id,
        amount, currency, fees, status, narration, metadata,
        idempotency_key, hash, created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      types.Uuid.fromString(transaction.id),
      transaction.reference,
      transaction.type,
      transaction.sourceWalletId || null,
      transaction.destinationWalletId || null,
      transaction.amount,
      transaction.currency,
      transaction.fees || null,
      transaction.status,
      transaction.narration || null,
      transaction.metadata ? JSON.stringify(sanitizeMetadata(transaction.metadata)) : null,
      transaction.idempotencyKey || null,
      transaction.hash || null,
      transaction.createdAt,
      transaction.updatedAt,
      transaction.completedAt || null,
    ];

    try {
      await this.client.execute(query, params, { prepare: true });
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
    if (!this.connected || !this.client) {
      throw new NoSQLConnectionException('Not connected to Cassandra');
    }

    const batchSize = options?.batchSize || 50;
    const throwOnError = options?.throwOnError ?? false;

    let successful = 0;
    let failed = 0;
    const errors: Array<{ index: number; error: Error }> = [];

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const queries = batch.map((transaction) => {
        const query = `
          INSERT INTO ${this.cassandraConfig.keyspace}.transactions (
            id, reference, type, source_wallet_id, destination_wallet_id,
            amount, currency, fees, status, narration, metadata,
            idempotency_key, hash, created_at, updated_at, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          types.Uuid.fromString(transaction.id),
          transaction.reference,
          transaction.type,
          transaction.sourceWalletId || null,
          transaction.destinationWalletId || null,
          transaction.amount,
          transaction.currency,
          transaction.fees || null,
          transaction.status,
          transaction.narration || null,
          transaction.metadata ? JSON.stringify(sanitizeMetadata(transaction.metadata)) : null,
          transaction.idempotencyKey || null,
          transaction.hash || null,
          transaction.createdAt,
          transaction.updatedAt,
          transaction.completedAt || null,
        ];

        return { query, params };
      });

      try {
        await this.client.batch(queries, { prepare: true });
        successful += batch.length;
      } catch (error) {
        failed += batch.length;
        batch.forEach((_, index) => {
          errors.push({ index: i + index, error: error as Error });
        });

        if (throwOnError) {
          throw new NoSQLInsertException(`Bulk insert failed at batch starting at index ${i}`, {
            batchIndex: i,
            error: error as Error,
          });
        }
      }
    }

    return { successful, failed, errors: errors.length > 0 ? errors : undefined };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    if (!this.connected || !this.client) {
      throw new NoSQLConnectionException('Not connected to Cassandra');
    }

    const query = `SELECT * FROM ${this.cassandraConfig.keyspace}.transactions WHERE id = ?`;

    try {
      const result = await this.client.execute(query, [types.Uuid.fromString(id)], { prepare: true });
      return result.rowLength > 0 ? this.mapRowToTransaction(result.first()) : null;
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
    if (!this.connected || !this.client) {
      throw new NoSQLConnectionException('Not connected to Cassandra');
    }

    const query = `SELECT * FROM ${this.cassandraConfig.keyspace}.transactions WHERE reference = ? ALLOW FILTERING`;

    try {
      const result = await this.client.execute(query, [reference], { prepare: true });
      return result.rowLength > 0 ? this.mapRowToTransaction(result.first()) : null;
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
    if (!this.connected || !this.client) {
      throw new NoSQLConnectionException('Not connected to Cassandra');
    }

    const query = `SELECT * FROM ${this.cassandraConfig.keyspace}.transactions WHERE idempotency_key = ? ALLOW FILTERING`;

    try {
      const result = await this.client.execute(query, [idempotencyKey], { prepare: true });
      return result.rowLength > 0 ? this.mapRowToTransaction(result.first()) : null;
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
    if (!this.connected || !this.client) {
      throw new NoSQLConnectionException('Not connected to Cassandra');
    }

    const limit = options?.limit || 50;
    let query = `SELECT * FROM ${this.cassandraConfig.keyspace}.transactions WHERE source_wallet_id = ? OR destination_wallet_id = ? ALLOW FILTERING`;

    if (options?.status) {
      query += ` AND status = '${options.status}'`;
    }

    query += ` LIMIT ${limit}`;

    try {
      const result = await this.client.execute(query, [walletId, walletId], { prepare: true });
      const items = result.rows.map((row) => this.mapRowToTransaction(row));
      
      return {
        items,
        hasMore: result.rowLength === limit,
        nextCursor: result.rowLength === limit ? items[items.length - 1].id : undefined,
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
    if (!this.connected || !this.client) {
      throw new NoSQLConnectionException('Not connected to Cassandra');
    }

    const limit = options?.limit || 50;
    const query = `SELECT * FROM ${this.cassandraConfig.keyspace}.transactions WHERE created_at >= ? AND created_at <= ? ALLOW FILTERING LIMIT ${limit}`;

    try {
      const result = await this.client.execute(query, [startDate, endDate], { prepare: true });
      const items = result.rows.map((row) => this.mapRowToTransaction(row));

      return {
        items,
        hasMore: result.rowLength === limit,
        nextCursor: result.rowLength === limit ? items[items.length - 1].id : undefined,
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
    if (!this.connected || !this.client) {
      throw new NoSQLConnectionException('Not connected to Cassandra');
    }

    const query = `UPDATE ${this.cassandraConfig.keyspace}.transactions SET status = ?, updated_at = ? WHERE id = ?`;

    try {
      await this.client.execute(query, [status, new Date(), types.Uuid.fromString(id)], { prepare: true });
      const transaction = await this.getTransactionById(id);
      
      if (!transaction) {
        throw new TransactionNotFoundException(id);
      }

      return transaction;
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
    if (!this.connected || !this.client) {
      throw new NoSQLConnectionException('Not connected to Cassandra');
    }

    const query = `DELETE FROM ${this.cassandraConfig.keyspace}.transactions WHERE id = ?`;

    try {
      await this.client.execute(query, [types.Uuid.fromString(id)], { prepare: true });
      return true;
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
    if (!this.connected || !this.client) {
      throw new NoSQLConnectionException('Not connected to Cassandra');
    }

    let query = `SELECT COUNT(*) as count FROM ${this.cassandraConfig.keyspace}.transactions WHERE source_wallet_id = ? OR destination_wallet_id = ? ALLOW FILTERING`;

    if (options?.status) {
      query += ` AND status = '${options.status}'`;
    }

    try {
      const result = await this.client.execute(query, [walletId, walletId], { prepare: true });
      return result.first()?.count?.toNumber() || 0;
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
    if (!this.connected || !this.client) {
      return { healthy: false, message: 'Not connected to Cassandra' };
    }

    try {
      await this.client.execute('SELECT now() FROM system.local');
      return { healthy: true };
    } catch (error) {
      return { healthy: false, message: (error as Error).message };
    }
  }

  /**
   * Map Cassandra row to Transaction object
   */
  private mapRowToTransaction(row: any): Transaction {
    return {
      id: row.id.toString(),
      reference: row.reference,
      type: row.type,
      sourceWalletId: row.source_wallet_id,
      destinationWalletId: row.destination_wallet_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      fees: row.fees ? parseFloat(row.fees) : undefined,
      status: row.status,
      narration: row.narration,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      idempotencyKey: row.idempotency_key,
      hash: row.hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    };
  }
}
