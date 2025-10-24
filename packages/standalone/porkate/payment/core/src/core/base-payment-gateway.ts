import { IPaymentGateway } from '../interfaces/payment-gateway.interface';
import { PaymentGatewayConfig } from '../interfaces/payment-config.interface';
import { PaymentConfigurationException } from '../exceptions';

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
      throw new PaymentConfigurationException(
        `${this.gatewayName}: Secret key is required`,
        { gatewayName: this.gatewayName },
      );
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

  // Abstract methods to be implemented by concrete classes
  abstract initiatePayment(request: any): Promise<any>;
  abstract verifyPayment(request: any): Promise<any>;
  abstract getPayment(request: any): Promise<any>;
  abstract refundPayment(request: any): Promise<any>;
  abstract cancelPayment?(request: any): Promise<any>;
}
