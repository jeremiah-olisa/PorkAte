/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PaystackTransactionData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  receipt_number: any;
  amount: number;
  message: any;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: string;
  log: PaystackTransactionLog;
  fees: number;
  fees_split: any;
  authorization: PaystackTransactionAuthorization;
  customer: PaystackTransactionCustomer;
  plan: any;
  split: PaystackTransactionSplit;
  order_id: any;
  paidAt: string;
  createdAt: string;
  requested_amount: number;
  pos_transaction_data: any;
  source: PasystackTransactionSource;
  fees_breakdown: any;
  connect: any;
  transaction_date: string;
  plan_object: PaystackTransactionPlanObject;
  subaccount: PaystackTransactionSubaccount;
}

export interface PaystackTransactionLog {
  start_time: number;
  time_spent: number;
  attempts: number;
  errors: number;
  success: boolean;
  mobile: boolean;
  input: any[];
  history: PaystackTransactionHistory[];
}

export interface PaystackTransactionHistory {
  type: string;
  message: string;
  time: number;
}

export interface PaystackTransactionAuthorization {
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
  account_name: any;
}

export interface PaystackTransactionCustomer {
  id: number;
  first_name: any;
  last_name: any;
  email: string;
  customer_code: string;
  phone: any;
  metadata: PasystackTransactionMetadata & Record<string, any>;
  risk_action: string;
  international_format_phone: any;
}

export interface PaystackTransactionSplit {}

export interface PaystackTransactionPlanObject {}

export interface PaystackTransactionSubaccount {}

export interface PasystackTransactionSource {
  type: string;
  source: string;
  identifier: any;
}

export interface PasystackTransactionMetadata {
  custom_fields: PasystackTransactionCustomField[];
}

export interface PasystackTransactionCustomField {
  display_name: string;
  variable_name: string;
  value: string;
}
