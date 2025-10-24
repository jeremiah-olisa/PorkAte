// Define payload types
export interface InitiatePaymentPayload {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callback_url?: string;
  channels?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface RefundPaymentPayload {
  transaction: string;
  amount?: number;
  merchant_note?: string;
}
