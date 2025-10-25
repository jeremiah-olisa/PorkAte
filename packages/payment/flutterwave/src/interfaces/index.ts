/**
 * Flutterwave-specific interfaces
 */

export interface FlutterwaveTransaction {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
}

export interface FlutterwaveCharge {
  id: number;
  amount: number;
  currency: string;
  status: string;
}
