/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Paystack-specific types
 */

export interface PaystackConfig {
  [key: string]: string | number | boolean | undefined | object | null;
  secretKey: string;
  publicKey?: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

export interface PaystackApiResponse<T = any> {
  status: boolean;
  message: string;
  data?: T;
}

export interface PaystackInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}
export interface PaystackRefundData {
  id: number;
  integration: number;
  transaction: number;
  dispute: number;
  merchant_note: string;
  customer_note: string;
  status: string;
  refunded_by: string;
  refunded_at: string;
  expected_at: string;
  currency: string;
  amount: number;
  fully_deducted: boolean;
  deducted_amount: number;
  created_at: string;
}
