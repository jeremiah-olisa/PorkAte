/**
 * Transaction status enum
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
  PARTIAL = 'PARTIAL',
}

/**
 * Transaction type enum
 */
export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  TRANSFER = 'TRANSFER',
  REVERSAL = 'REVERSAL',
  FEE = 'FEE',
  REFUND = 'REFUND',
}

/**
 * Currency enum
 */
export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

/**
 * Transaction entity
 */
export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  sourceWalletId?: string;
  destinationWalletId?: string;
  amount: number;
  currency: Currency;
  fees?: number;
  status: TransactionStatus;
  narration?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
  hash?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Query options for fetching transactions
 */
export interface QueryOptions {
  limit?: number;
  cursor?: string;
  startDate?: Date;
  endDate?: Date;
  status?: TransactionStatus;
  type?: TransactionType;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated query result
 */
export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

/**
 * Bulk insert options
 */
export interface BulkInsertOptions {
  batchSize?: number;
  throwOnError?: boolean;
}

/**
 * Bulk insert result
 */
export interface BulkInsertResult {
  successful: number;
  failed: number;
  errors?: Array<{ index: number; error: Error }>;
}
