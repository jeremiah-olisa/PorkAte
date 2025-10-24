import { Money, PaymentStatus, PaymentChannel, PaymentMetadata, PaymentError } from '../types';

/**
 * Base response for payment operations
 */
export interface PaymentResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * Error information if operation failed
   */
  error?: PaymentError;

  /**
   * Gateway-specific response data
   */
  raw?: any;
}

/**
 * Response from initiating a payment
 */
export interface InitiatePaymentResponse extends PaymentResponse {
  /**
   * Unique reference for this transaction
   */
  reference: string;

  /**
   * URL to redirect user for payment
   */
  authorizationUrl?: string;

  /**
   * Access code for the payment (if provided by gateway)
   */
  accessCode?: string;

  /**
   * Payment amount details
   */
  amount: Money;

  /**
   * Current status of the payment
   */
  status: PaymentStatus;

  /**
   * Additional metadata
   */
  metadata?: PaymentMetadata;
}

/**
 * Response from verifying a payment
 */
export interface VerifyPaymentResponse extends PaymentResponse {
  /**
   * Payment reference
   */
  reference: string;

  /**
   * Payment status
   */
  status: PaymentStatus;

  /**
   * Amount paid
   */
  amount: Money;

  /**
   * Payment channel used
   */
  channel?: PaymentChannel;

  /**
   * Gateway transaction ID
   */
  gatewayTransactionId?: string;

  /**
   * When the payment was made
   */
  paidAt?: Date;

  /**
   * Customer information
   */
  customer?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };

  /**
   * Additional metadata
   */
  metadata?: PaymentMetadata;
}

/**
 * Response from getting payment details
 */
export interface GetPaymentResponse extends PaymentResponse {
  /**
   * Payment reference
   */
  reference: string;

  /**
   * Gateway transaction ID
   */
  gatewayTransactionId?: string;

  /**
   * Payment status
   */
  status: PaymentStatus;

  /**
   * Amount
   */
  amount: Money;

  /**
   * Payment channel used
   */
  channel?: PaymentChannel;

  /**
   * When the payment was initiated
   */
  createdAt?: Date;

  /**
   * When the payment was completed
   */
  paidAt?: Date;

  /**
   * Customer information
   */
  customer?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };

  /**
   * Authorization details (if available)
   */
  authorization?: {
    authorizationCode?: string;
    cardType?: string;
    last4?: string;
    expMonth?: string;
    expYear?: string;
    bin?: string;
    bank?: string;
    channel?: string;
    reusable?: boolean;
  };

  /**
   * Additional metadata
   */
  metadata?: PaymentMetadata;
}

/**
 * Response from refunding a payment
 */
export interface RefundPaymentResponse extends PaymentResponse {
  /**
   * Original payment reference
   */
  reference: string;

  /**
   * Refund reference/ID
   */
  refundReference: string;

  /**
   * Amount refunded
   */
  amount: Money;

  /**
   * Status of the refund
   */
  status: PaymentStatus;

  /**
   * When the refund was processed
   */
  refundedAt?: Date;

  /**
   * Additional metadata
   */
  metadata?: PaymentMetadata;
}

/**
 * Response from canceling a payment
 */
export interface CancelPaymentResponse extends PaymentResponse {
  /**
   * Payment reference
   */
  reference: string;

  /**
   * Status after cancellation
   */
  status: PaymentStatus;

  /**
   * Additional metadata
   */
  metadata?: PaymentMetadata;
}
