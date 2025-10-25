/**
 * Stripe-specific interfaces
 */

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
}

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid: boolean;
}
