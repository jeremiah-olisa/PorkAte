/**
 * Paystack-specific types
 */

export interface PaystackConfig {
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

export interface PaystackTransactionData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string | null;
  gateway_response: string;
  paid_at: string | null;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: any;
  fees?: number;
  fees_split?: any;
  customer: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    customer_code: string;
    phone: string | null;
    metadata: any;
    risk_action: string;
  };
  authorization?: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
    account_name: string | null;
  };
  plan?: any;
  split?: any;
  order_id?: any;
  paidAt?: string;
  createdAt?: string;
  requested_amount?: number;
  pos_transaction_data?: any;
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
