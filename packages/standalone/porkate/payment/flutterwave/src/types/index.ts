/**
 * Flutterwave-specific types
 */

export interface FlutterwaveConfig {
  secretKey: string;
  publicKey?: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

export interface FlutterwaveApiResponse<T = unknown> {
  status?: string;
  message?: string;
  data?: T;
}
