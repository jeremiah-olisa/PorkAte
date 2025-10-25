/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stripe-specific types
 */

export interface StripeConfig {
  [key: string]: string | number | boolean | undefined | object | null;
  secretKey: string;
  publicKey?: string;
  apiVersion?: string;
  timeout?: number;
  debug?: boolean;
}

export interface StripeApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}
