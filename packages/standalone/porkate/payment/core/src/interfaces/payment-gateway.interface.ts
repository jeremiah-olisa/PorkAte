import {
  InitiatePaymentRequest,
  VerifyPaymentRequest,
  GetPaymentRequest,
  RefundPaymentRequest,
  CancelPaymentRequest,
} from './payment-request.interface';
import {
  InitiatePaymentResponse,
  VerifyPaymentResponse,
  GetPaymentResponse,
  RefundPaymentResponse,
  CancelPaymentResponse,
} from './payment-response.interface';

/**
 * Core interface that all payment gateway adapters must implement
 */
export interface IPaymentGateway {
  /**
   * Initialize a payment transaction
   * @param request - Payment initialization request
   * @returns Promise with payment initialization response
   */
  initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse>;

  /**
   * Verify a payment transaction
   * @param request - Payment verification request
   * @returns Promise with payment verification response
   */
  verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;

  /**
   * Get payment details by reference
   * @param request - Get payment request
   * @returns Promise with payment details
   */
  getPayment(request: GetPaymentRequest): Promise<GetPaymentResponse>;

  /**
   * Refund a payment transaction
   * @param request - Payment refund request
   * @returns Promise with refund response
   */
  refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse>;

  /**
   * Cancel a pending payment
   * @param request - Payment cancellation request
   * @returns Promise with cancellation response
   */
  cancelPayment?(request: CancelPaymentRequest): Promise<CancelPaymentResponse>;

  /**
   * Get the name of the payment gateway
   */
  getGatewayName(): string;

  /**
   * Check if the gateway is properly configured and ready
   */
  isReady(): boolean;
}
