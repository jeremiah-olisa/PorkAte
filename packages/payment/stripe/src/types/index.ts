/**
 * Stripe-specific types
 */

export interface StripeConfig {
  secretKey: string;
  publicKey?: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

export interface StripeApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}
