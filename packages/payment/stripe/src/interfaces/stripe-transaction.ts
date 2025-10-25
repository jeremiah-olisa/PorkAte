/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from 'stripe';

export interface StripePaymentIntentData extends Stripe.PaymentIntent {
  // Additional fields if needed
}

export interface StripeChargeData extends Stripe.Charge {
  // Additional fields if needed
}

export interface StripeRefundData extends Stripe.Refund {
  // Additional fields if needed
}

export interface StripeCustomerData extends Stripe.Customer {
  // Additional fields if needed
}
