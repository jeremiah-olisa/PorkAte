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
import { FlutterwaveConfig } from '../types';

/**
 * Flutterwave payment gateway implementation
 * Note: This is a placeholder. Full implementation requires flutterwave SDK
 */
export class FlutterwaveGateway implements IPaymentGateway {
  private config: FlutterwaveConfig;

  constructor(config: FlutterwaveConfig) {
    if (!config.secretKey) {
      throw new PaymentConfigurationException('Secret key is required for Flutterwave', {
        gateway: 'Flutterwave',
      });
    }
    this.config = config;
  }

  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    // TODO: Implement actual Flutterwave payment initiation
    console.warn('Flutterwave gateway: initiatePayment() is not fully implemented');
    throw new Error('Flutterwave gateway not fully implemented');
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    // TODO: Implement actual Flutterwave payment verification
    console.warn('Flutterwave gateway: verifyPayment() is not fully implemented');
    throw new Error('Flutterwave gateway not fully implemented');
  }

  async getPayment(request: GetPaymentRequest): Promise<GetPaymentResponse> {
    // TODO: Implement actual Flutterwave get payment
    console.warn('Flutterwave gateway: getPayment() is not fully implemented');
    throw new Error('Flutterwave gateway not fully implemented');
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    // TODO: Implement actual Flutterwave refund
    console.warn('Flutterwave gateway: refundPayment() is not fully implemented');
    throw new Error('Flutterwave gateway not fully implemented');
  }

  async cancelPayment(request: CancelPaymentRequest): Promise<CancelPaymentResponse> {
    // TODO: Implement actual Flutterwave cancellation
    console.warn('Flutterwave gateway: cancelPayment() is not fully implemented');
    throw new Error('Flutterwave gateway not fully implemented');
  }

  getGatewayName(): string {
    return 'Flutterwave';
  }

  isReady(): boolean {
    return !!this.config.secretKey;
  }
}
