/**
 * Base configuration for payment gateways
 */
export interface PaymentGatewayConfig {
  /**
   * API key or secret key for authentication
   */
  secretKey: string;

  /**
   * Public key (if required by the gateway)
   */
  publicKey?: string;

  /**
   * Base URL for API calls (useful for testing/sandbox environments)
   */
  baseUrl?: string;

  /**
   * Timeout for API requests in milliseconds
   */
  timeout?: number;

  /**
   * Enable debug mode
   */
  debug?: boolean;

  /**
   * Additional configuration options specific to the gateway
   */
  metadata?: Record<string, any>;
}
