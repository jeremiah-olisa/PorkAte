import { Money, Customer, PaymentChannel, PaymentMetadata } from '../types';

/**
 * Request to initiate a payment
 */
export interface InitiatePaymentRequest {
  /**
   * Payment amount details
   */
  amount: Money;

  /**
   * Customer information
   */
  customer: Customer;

  /**
   * Unique reference for this transaction
   */
  reference?: string;

  /**
   * URL to redirect to after payment
   */
  callbackUrl?: string;

  /**
   * Preferred payment channels
   */
  channels?: PaymentChannel[];

  /**
   * Additional metadata for the payment
   */
  metadata?: PaymentMetadata;

  /**
   * Description of the payment
   */
  description?: string;
}

/**
 * Request to verify a payment
 */
export interface VerifyPaymentRequest {
  /**
   * Payment reference to verify
   */
  reference: string;
}

/**
 * Request to get payment details
 */
export interface GetPaymentRequest {
  /**
   * Payment reference or ID
   */
  reference: string;
}

/**
 * Request to refund a payment
 */
export interface RefundPaymentRequest {
  /**
   * Payment reference or transaction ID
   */
  reference: string;

  /**
   * Amount to refund (if partial refund is supported)
   */
  amount?: Money;

  /**
   * Reason for refund
   */
  reason?: string;

  /**
   * Additional metadata for the refund
   */
  metadata?: PaymentMetadata;
}

/**
 * Request to cancel a payment
 */
export interface CancelPaymentRequest {
  /**
   * Payment reference to cancel
   */
  reference: string;

  /**
   * Reason for cancellation
   */
  reason?: string;
}
