import { INoSQLAdapter } from '../interfaces/nosql-adapter.interface';
import { NoSQLConfig } from '../interfaces/nosql-config.interface';
import { NoSQLConfigurationException } from '../exceptions';
import {
  Transaction,
  QueryOptions,
  PaginatedResult,
  BulkInsertOptions,
  BulkInsertResult,
} from '../types';

/**
 * Abstract base class for NoSQL adapter implementations
 */
export abstract class BaseNoSQLAdapter implements INoSQLAdapter {
  protected config: NoSQLConfig;
  protected databaseName: string;
  protected connected: boolean = false;

  constructor(config: NoSQLConfig, databaseName: string) {
    this.config = config;
    this.databaseName = databaseName;
    this.validateConfig();
  }

  /**
   * Validate adapter configuration
   * @throws {NoSQLConfigurationException} If configuration is invalid
   */
  protected validateConfig(): void {
    if (!this.config) {
      throw new NoSQLConfigurationException(`${this.databaseName}: Configuration is required`, {
        databaseName: this.databaseName,
      });
    }
  }

  /**
   * Get the database name
   */
  getDatabaseName(): string {
    return this.databaseName;
  }

  /**
   * Check if adapter is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Set connection status
   */
  protected setConnected(connected: boolean): void {
    this.connected = connected;
  }

  // Abstract methods to be implemented by concrete classes
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract insertTransaction(transaction: Transaction): Promise<Transaction>;
  abstract bulkInsertTransactions(
    transactions: Transaction[],
    options?: BulkInsertOptions,
  ): Promise<BulkInsertResult>;
  abstract getTransactionById(id: string): Promise<Transaction | null>;
  abstract getTransactionByReference(reference: string): Promise<Transaction | null>;
  abstract getTransactionByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null>;
  abstract queryByWalletId(
    walletId: string,
    options?: QueryOptions,
  ): Promise<PaginatedResult<Transaction>>;
  abstract queryByDateRange(
    startDate: Date,
    endDate: Date,
    options?: QueryOptions,
  ): Promise<PaginatedResult<Transaction>>;
  abstract updateTransactionStatus(id: string, status: string): Promise<Transaction>;
  abstract deleteTransaction(id: string): Promise<boolean>;
  abstract countTransactions(walletId: string, options?: QueryOptions): Promise<number>;
  abstract healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
