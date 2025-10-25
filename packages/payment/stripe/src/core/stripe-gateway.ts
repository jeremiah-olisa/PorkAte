import {
  IPaymentGateway,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
  CancelPaymentRequest,
  CancelPaymentResponse,
  PaymentConfigurationException,
} from '@porkate/payment';
import { StripeConfig } from '../types';

/**
 * Stripe payment gateway implementation
 * Note: This is a placeholder. Full implementation requires stripe SDK
 */
export class StripeGateway implements IPaymentGateway {
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    if (!config.secretKey) {
      throw new PaymentConfigurationException('Secret key is required for Stripe', {
        gateway: 'Stripe',
      });
    }
    this.config = config;
  }

  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    // TODO: Implement actual Stripe payment initiation
    console.warn('Stripe gateway: initiatePayment() is not fully implemented');
    throw new Error('Stripe gateway not fully implemented');
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    // TODO: Implement actual Stripe payment verification
    console.warn('Stripe gateway: verifyPayment() is not fully implemented');
    throw new Error('Stripe gateway not fully implemented');
  }

  async getPayment(request: GetPaymentRequest): Promise<GetPaymentResponse> {
    // TODO: Implement actual Stripe get payment
    console.warn('Stripe gateway: getPayment() is not fully implemented');
    throw new Error('Stripe gateway not fully implemented');
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    // TODO: Implement actual Stripe refund
    console.warn('Stripe gateway: refundPayment() is not fully implemented');
    throw new Error('Stripe gateway not fully implemented');
  }

  async cancelPayment(request: CancelPaymentRequest): Promise<CancelPaymentResponse> {
    // TODO: Implement actual Stripe cancellation
    console.warn('Stripe gateway: cancelPayment() is not fully implemented');
    throw new Error('Stripe gateway not fully implemented');
  }

  getGatewayName(): string {
    return 'Stripe';
  }

  isReady(): boolean {
    return !!this.config.secretKey;
  }
}
