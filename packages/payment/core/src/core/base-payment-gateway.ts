import { IPaymentGateway } from '../interfaces/payment-gateway.interface';
import { PaymentGatewayConfig } from '../interfaces/payment-config.interface';
import { PaymentConfigurationException } from '../exceptions';
import {
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
} from '../interfaces';

/**
 * Abstract base class for payment gateway implementations
 */
export abstract class BasePaymentGateway implements IPaymentGateway {
  protected config: PaymentGatewayConfig;
  protected gatewayName: string;

  constructor(config: PaymentGatewayConfig, gatewayName: string) {
    this.config = config;
    this.gatewayName = gatewayName;
    this.validateConfig();
  }

  /**
   * Validate gateway configuration
   * @throws {PaymentConfigurationException} If configuration is invalid
   */
  protected validateConfig(): void {
    if (!this.config.secretKey) {
      throw new PaymentConfigurationException(`${this.gatewayName}: Secret key is required`, {
        gatewayName: this.gatewayName,
      });
    }
  }

  /**
   * Get the gateway name
   */
  getGatewayName(): string {
    return this.gatewayName;
  }

  /**
   * Check if the gateway is ready
   */
  isReady(): boolean {
    return !!this.config.secretKey;
  }

  // // Abstract methods to be implemented by concrete classes
  abstract initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse>;
  abstract verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  abstract getPayment(request: GetPaymentRequest): Promise<GetPaymentResponse>;
  abstract refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse>;
  abstract cancelPayment?(request: CancelPaymentRequest): Promise<CancelPaymentResponse>;
}
