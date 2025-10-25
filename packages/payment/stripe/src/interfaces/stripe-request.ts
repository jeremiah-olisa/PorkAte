/* eslint-disable @typescript-eslint/no-explicit-any */
// Define payload types for Stripe API
export interface CreatePaymentIntentPayload {
  amount: number;
  currency: string;
  payment_method_types?: string[];
  metadata?: Record<string, any>;
  receipt_email?: string;
  description?: string;
  confirm?: boolean;
  return_url?: string;
}

export interface RefundPaymentPayload {
  payment_intent?: string;
  charge?: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, any>;
}
