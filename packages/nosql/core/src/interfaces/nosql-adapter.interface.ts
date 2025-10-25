import {
  Transaction,
  QueryOptions,
  PaginatedResult,
  BulkInsertOptions,
  BulkInsertResult,
} from '../types';

/**
 * Core interface for NoSQL adapters
 * All NoSQL database adapters must implement this interface
 */
export interface INoSQLAdapter {
  /**
   * Connect to the NoSQL database
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the NoSQL database
   */
  disconnect(): Promise<void>;

  /**
   * Check if the adapter is connected and ready
   */
  isConnected(): boolean;

  /**
   * Get the name of the NoSQL database
   */
  getDatabaseName(): string;

  /**
   * Insert a single transaction
   * @param transaction - Transaction to insert
   * @returns Promise with the inserted transaction
   */
  insertTransaction(transaction: Transaction): Promise<Transaction>;

  /**
   * Insert multiple transactions in bulk
   * @param transactions - Array of transactions to insert
   * @param options - Bulk insert options
   * @returns Promise with bulk insert result
   */
  bulkInsertTransactions(
    transactions: Transaction[],
    options?: BulkInsertOptions,
  ): Promise<BulkInsertResult>;

  /**
   * Get a transaction by its ID
   * @param id - Transaction ID
   * @returns Promise with transaction or null if not found
   */
  getTransactionById(id: string): Promise<Transaction | null>;

  /**
   * Get a transaction by its reference
   * @param reference - Transaction reference
   * @returns Promise with transaction or null if not found
   */
  getTransactionByReference(reference: string): Promise<Transaction | null>;

  /**
   * Get a transaction by its idempotency key
   * @param idempotencyKey - Idempotency key
   * @returns Promise with transaction or null if not found
   */
  getTransactionByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null>;

  /**
   * Query transactions by wallet ID with pagination
   * @param walletId - Wallet ID
   * @param options - Query options
   * @returns Promise with paginated result
   */
  queryByWalletId(walletId: string, options?: QueryOptions): Promise<PaginatedResult<Transaction>>;

  /**
   * Query transactions by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param options - Query options
   * @returns Promise with paginated result
   */
  queryByDateRange(
    startDate: Date,
    endDate: Date,
    options?: QueryOptions,
  ): Promise<PaginatedResult<Transaction>>;

  /**
   * Update transaction status
   * @param id - Transaction ID
   * @param status - New status
   * @returns Promise with updated transaction
   */
  updateTransactionStatus(id: string, status: string): Promise<Transaction>;

  /**
   * Delete a transaction (soft delete recommended)
   * @param id - Transaction ID
   * @returns Promise with boolean indicating success
   */
  deleteTransaction(id: string): Promise<boolean>;

  /**
   * Count transactions for a wallet
   * @param walletId - Wallet ID
   * @param options - Query options for filtering
   * @returns Promise with count
   */
  countTransactions(walletId: string, options?: QueryOptions): Promise<number>;

  /**
   * Check database health
   * @returns Promise with health status
   */
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
