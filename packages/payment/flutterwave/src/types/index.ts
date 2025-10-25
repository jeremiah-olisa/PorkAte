/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Flutterwave-specific types
 */

export interface FlutterwaveConfig {
  [key: string]: string | number | boolean | undefined | object | null;
  secretKey: string;
  publicKey?: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

export interface FlutterwaveApiResponse<T = any> {
  status: string;
  message: string;
  data?: T;
}

export interface FlutterwaveInitializeData {
  link: string;
}

export interface FlutterwaveRefundData {
  id: number;
  account_id: number;
  tx_id: number;
  flw_ref: string;
  wallet_id: number;
  amount_refunded: number;
  status: string;
  destination: string;
  meta: any;
  created_at: string;
}
