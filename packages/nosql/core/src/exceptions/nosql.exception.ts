import { nameof } from '../utils';
import { NoSQLErrorCode } from './nosql-error-codes';

/**
 * Base exception class for NoSQL operations
 */
export class NoSQLException<TDetails = unknown> extends Error {
  protected readonly _code: NoSQLErrorCode;

  constructor(
    message: string,
    code: NoSQLErrorCode = NoSQLErrorCode.NOSQL_ERROR,
    public readonly details?: TDetails,
  ) {
    super(message);
    this._code = code;
    this.name = nameof(NoSQLException);
    Object.setPrototypeOf(this, NoSQLException.prototype);
  }

  get code(): NoSQLErrorCode {
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
 * Exception thrown when NoSQL configuration is invalid
 */
export class NoSQLConfigurationException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, NoSQLErrorCode.NOSQL_CONFIGURATION_ERROR, details);
    this.name = nameof(NoSQLConfigurationException);
    Object.setPrototypeOf(this, NoSQLConfigurationException.prototype);
  }
}

/**
 * Exception thrown when connection to NoSQL database fails
 */
export class NoSQLConnectionException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, NoSQLErrorCode.NOSQL_CONNECTION_ERROR, details);
    this.name = nameof(NoSQLConnectionException);
    Object.setPrototypeOf(this, NoSQLConnectionException.prototype);
  }
}

/**
 * Exception thrown when connection times out
 */
export class NoSQLConnectionTimeoutException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string = 'NoSQL connection timed out', details?: TDetails) {
    super(message, NoSQLErrorCode.NOSQL_CONNECTION_TIMEOUT, details);
    this.name = nameof(NoSQLConnectionTimeoutException);
    Object.setPrototypeOf(this, NoSQLConnectionTimeoutException.prototype);
  }
}

/**
 * Exception thrown when disconnection fails
 */
export class NoSQLDisconnectionException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, NoSQLErrorCode.NOSQL_DISCONNECTION_ERROR, details);
    this.name = nameof(NoSQLDisconnectionException);
    Object.setPrototypeOf(this, NoSQLDisconnectionException.prototype);
  }
}

/**
 * Exception thrown when transaction insert fails
 */
export class NoSQLInsertException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, NoSQLErrorCode.NOSQL_INSERT_ERROR, details);
    this.name = nameof(NoSQLInsertException);
    Object.setPrototypeOf(this, NoSQLInsertException.prototype);
  }
}

/**
 * Exception thrown when query operation fails
 */
export class NoSQLQueryException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, NoSQLErrorCode.NOSQL_QUERY_ERROR, details);
    this.name = nameof(NoSQLQueryException);
    Object.setPrototypeOf(this, NoSQLQueryException.prototype);
  }
}

/**
 * Exception thrown when update operation fails
 */
export class NoSQLUpdateException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, NoSQLErrorCode.NOSQL_UPDATE_ERROR, details);
    this.name = nameof(NoSQLUpdateException);
    Object.setPrototypeOf(this, NoSQLUpdateException.prototype);
  }
}

/**
 * Exception thrown when delete operation fails
 */
export class NoSQLDeleteException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, NoSQLErrorCode.NOSQL_DELETE_ERROR, details);
    this.name = nameof(NoSQLDeleteException);
    Object.setPrototypeOf(this, NoSQLDeleteException.prototype);
  }
}

/**
 * Exception thrown when bulk insert fails
 */
export class NoSQLBulkInsertException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, NoSQLErrorCode.NOSQL_BULK_INSERT_ERROR, details);
    this.name = nameof(NoSQLBulkInsertException);
    Object.setPrototypeOf(this, NoSQLBulkInsertException.prototype);
  }
}

/**
 * Exception thrown when transaction is not found
 */
export class TransactionNotFoundException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(identifier: string, details?: TDetails) {
    super(
      `Transaction with identifier '${identifier}' not found`,
      NoSQLErrorCode.TRANSACTION_NOT_FOUND,
      details,
    );
    this.name = nameof(TransactionNotFoundException);
    Object.setPrototypeOf(this, TransactionNotFoundException.prototype);
  }
}

/**
 * Exception thrown when duplicate transaction is detected
 */
export class DuplicateTransactionException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(identifier: string, details?: TDetails) {
    super(
      `Transaction with identifier '${identifier}' already exists`,
      NoSQLErrorCode.DUPLICATE_TRANSACTION,
      details,
    );
    this.name = nameof(DuplicateTransactionException);
    Object.setPrototypeOf(this, DuplicateTransactionException.prototype);
  }
}

/**
 * Exception thrown when transaction data is invalid
 */
export class InvalidTransactionDataException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string, public readonly field?: string, details?: TDetails) {
    super(message, NoSQLErrorCode.INVALID_TRANSACTION_DATA, { field, ...details } as TDetails);
    this.name = nameof(InvalidTransactionDataException);
    Object.setPrototypeOf(this, InvalidTransactionDataException.prototype);
  }
}

/**
 * Exception thrown when health check fails
 */
export class NoSQLHealthCheckException<TDetails = unknown> extends NoSQLException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, NoSQLErrorCode.NOSQL_HEALTH_CHECK_FAILED, details);
    this.name = nameof(NoSQLHealthCheckException);
    Object.setPrototypeOf(this, NoSQLHealthCheckException.prototype);
  }
}
