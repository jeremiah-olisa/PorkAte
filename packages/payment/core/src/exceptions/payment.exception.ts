import { nameof } from '../utils';
import { PaymentErrorCode } from './payment-error-codes';

/**
 * Base exception class for payment operations
 */
export class PaymentException<TDetails = unknown> extends Error {
  protected readonly _code: PaymentErrorCode;

  constructor(
    message: string,
    code: PaymentErrorCode = PaymentErrorCode.PAYMENT_ERROR,
    public readonly details?: TDetails,
  ) {
    super(message);
    this._code = code;
    this.name = nameof(PaymentException);
    Object.setPrototypeOf(this, PaymentException.prototype);
  }

  get code(): PaymentErrorCode {
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
 * Exception thrown when payment gateway configuration is invalid
 */
export class PaymentConfigurationException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, PaymentErrorCode.PAYMENT_CONFIGURATION_ERROR, details);
    this.name = nameof(PaymentConfigurationException);
    Object.setPrototypeOf(this, PaymentConfigurationException.prototype);
  }
}

/**
 * Exception thrown when payment initialization fails
 */
export class PaymentInitializationException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, PaymentErrorCode.PAYMENT_INITIALIZATION_ERROR, details);
    this.name = nameof(PaymentInitializationException);
    Object.setPrototypeOf(this, PaymentInitializationException.prototype);
  }
}

/**
 * Exception thrown when payment verification fails
 */
export class PaymentVerificationException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, PaymentErrorCode.PAYMENT_VERIFICATION_ERROR, details);
    this.name = nameof(PaymentVerificationException);
    Object.setPrototypeOf(this, PaymentVerificationException.prototype);
  }
}

/**
 * Exception thrown when payment not found
 */
export class PaymentNotFoundException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(reference: string, details?: TDetails) {
    super(
      `Payment with reference '\${reference}' not found`,
      PaymentErrorCode.PAYMENT_NOT_FOUND,
      details,
    );
    this.name = nameof(PaymentNotFoundException);
    Object.setPrototypeOf(this, PaymentNotFoundException.prototype);
  }
}

/**
 * Exception thrown when refund operation fails
 */
export class PaymentRefundException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, PaymentErrorCode.PAYMENT_REFUND_ERROR, details);
    this.name = nameof(PaymentRefundException);
    Object.setPrototypeOf(this, PaymentRefundException.prototype);
  }
}

/**
 * Exception thrown when payment cancellation fails
 */
export class PaymentCancellationException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(message: string, details?: TDetails) {
    super(message, PaymentErrorCode.PAYMENT_CANCELLATION_ERROR, details);
    this.name = nameof(PaymentCancellationException);
    Object.setPrototypeOf(this, PaymentCancellationException.prototype);
  }
}

/**
 * Exception thrown when payment gateway API call fails
 */
export class PaymentGatewayException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(
    message: string,
    public readonly statusCode?: number,
    details?: TDetails,
  ) {
    super(message, PaymentErrorCode.PAYMENT_GATEWAY_ERROR, details);
    this.name = nameof(PaymentGatewayException);
    Object.setPrototypeOf(this, PaymentGatewayException.prototype);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
    };
  }
}

/**
 * Exception thrown when payment gateway times out
 */
export class PaymentGatewayTimeoutException<
  TDetails = unknown,
> extends PaymentGatewayException<TDetails> {
  constructor(message: string = 'Payment gateway request timed out', details?: TDetails) {
    super(message, 408, details);
    this.name = nameof(PaymentGatewayTimeoutException);
    Object.setPrototypeOf(this, PaymentGatewayTimeoutException.prototype);
  }

  get code(): PaymentErrorCode {
    return PaymentErrorCode.PAYMENT_GATEWAY_TIMEOUT;
  }
}

/**
 * Exception thrown when payment amount is invalid
 */
export class InvalidPaymentAmountException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(amount: number, currency: string, reason?: string) {
    const message = reason
      ? `Invalid payment amount \${amount} \${currency}: \${reason}`
      : `Invalid payment amount \${amount} \${currency}`;
    super(message, PaymentErrorCode.INVALID_PAYMENT_AMOUNT, {
      amount,
      currency,
      reason,
    } as TDetails);
    this.name = nameof(InvalidPaymentAmountException);
    Object.setPrototypeOf(this, InvalidPaymentAmountException.prototype);
  }
}

/**
 * Exception thrown when currency is not supported
 */
export class UnsupportedCurrencyException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(currency: string, supportedCurrencies?: string[]) {
    const message = supportedCurrencies
      ? `Currency '\${currency}' is not supported. Supported currencies: \${supportedCurrencies.join(', '\)}`
      : `Currency '\${currency}' is not supported`;
    super(message, PaymentErrorCode.UNSUPPORTED_CURRENCY, {
      currency,
      supportedCurrencies,
    } as TDetails);
    this.name = nameof(UnsupportedCurrencyException);
    Object.setPrototypeOf(this, UnsupportedCurrencyException.prototype);
  }
}

/**
 * Exception thrown when payment channel is not supported
 */
export class UnsupportedPaymentChannelException<
  TDetails = unknown,
> extends PaymentException<TDetails> {
  constructor(channel: string, supportedChannels?: string[]) {
    const message = supportedChannels
      ? `Payment channel '\${channel}' is not supported. Supported channels: \${supportedChannels.join(', '\)}`
      : `Payment channel '\${channel}' is not supported`;
    super(message, PaymentErrorCode.UNSUPPORTED_PAYMENT_CHANNEL, {
      channel,
      supportedChannels,
    } as TDetails);
    this.name = nameof(UnsupportedPaymentChannelException);
    Object.setPrototypeOf(this, UnsupportedPaymentChannelException.prototype);
  }
}

/**
 * Exception thrown when payment validation fails
 */
export class PaymentValidationException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(
    message: string,
    public readonly field?: string,
    details?: TDetails,
  ) {
    super(message, PaymentErrorCode.PAYMENT_VALIDATION_ERROR, { field, ...details } as TDetails);
    this.name = nameof(PaymentValidationException);
    Object.setPrototypeOf(this, PaymentValidationException.prototype);
  }
}

/**
 * Exception thrown when payment has already been processed
 */
export class DuplicatePaymentException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(reference: string, details?: TDetails) {
    super(
      `Payment with reference '\${reference}' has already been processed`,
      PaymentErrorCode.DUPLICATE_PAYMENT,
      { reference, ...details } as TDetails,
    );
    this.name = nameof(DuplicatePaymentException);
    Object.setPrototypeOf(this, DuplicatePaymentException.prototype);
  }
}

/**
 * Exception thrown when refund amount exceeds payment amount
 */
export class InvalidRefundAmountException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(refundAmount: number, paymentAmount: number, details?: TDetails) {
    super(
      `Refund amount \${refundAmount} exceeds payment amount \${paymentAmount}`,
      PaymentErrorCode.INVALID_REFUND_AMOUNT,
      { refundAmount, paymentAmount, ...details } as TDetails,
    );
    this.name = nameof(InvalidRefundAmountException);
    Object.setPrototypeOf(this, InvalidRefundAmountException.prototype);
  }
}

/**
 * Exception thrown when payment cannot be refunded
 */
export class PaymentNotRefundableException<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(reference: string, reason?: string, details?: TDetails) {
    const message = reason
      ? `Payment '\${reference}' cannot be refunded: \${reason}`
      : `Payment '\${reference}' cannot be refunded`;
    super(message, PaymentErrorCode.PAYMENT_NOT_REFUNDABLE, {
      reference,
      reason,
      ...details,
    } as TDetails);
    this.name = nameof(PaymentNotRefundableException);
    Object.setPrototypeOf(this, PaymentNotRefundableException.prototype);
  }
}

/**
 * Exception thrown when Payment API returns an invalid response structure
 */
export class PaymentInvalidResponseError<TDetails = unknown> extends PaymentException<TDetails> {
  constructor(
    message: string = 'Payment API returned an invalid response structure',
    public responseData?: unknown,
    details?: unknown,
  ) {
    super(
      message,
      PaymentErrorCode.PAYMENT_INVALID_RESPONSE_ERROR,
      ({
        responseData,
        ...(details && typeof details === 'object' ? details : { details }),
      } as unknown) as TDetails,
    );
    this.name = nameof(PaymentInvalidResponseError);
    Object.setPrototypeOf(this, PaymentInvalidResponseError.prototype);
  }
}