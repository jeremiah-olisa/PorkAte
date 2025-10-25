import { IPaymentGateway } from './payment-gateway.interface';

/**
 * Configuration for a payment gateway
 */
export interface GatewayConfig<TConfig = GatewayEnvConfig> {
  /**
   * Name of the gateway (e.g., 'paystack', 'flutterwave', 'stripe')
   */
  name: string;

  /**
   * Gateway-specific configuration
   */
  config: TConfig;

  /**
   * Whether this gateway is enabled
   */
  enabled?: boolean;

  /**
   * Priority for fallback (higher = higher priority)
   */
  priority?: number;
}

/**
 * Configuration for the payment gateway manager
 */
export interface PaymentGatewayManagerConfig<TConfig = any> {
  /**
   * List of gateway configurations
   */
  gateways: GatewayConfig<TConfig>[];

  /**
   * Default gateway to use if none specified
   */
  defaultGateway?: string;

  /**
   * Whether to enable automatic fallback to next available gateway
   */
  enableFallback?: boolean;
}

/**
 * Factory function type for creating gateway instances
 */
export type GatewayFactory<T = GatewayEnvConfig> = (config: T) => IPaymentGateway;

export type GatewayEnvConfig = Record<
  string,
  string | number | boolean | undefined | object | null
>;
