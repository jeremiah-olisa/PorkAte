/**
 * Common types for payment gateway operations
 */

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  ABANDONED = 'abandoned',
  REVERSED = 'reversed',
}

export enum PaymentChannel {
  CARD = 'card',
  BANK = 'bank',
  BANK_TRANSFER = 'bank_transfer',
  USSD = 'ussd',
  QR = 'qr',
  MOBILE_MONEY = 'mobile_money',
  EFT = 'eft',
}

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  GHS = 'GHS',
  ZAR = 'ZAR',
  KES = 'KES',
  EUR = 'EUR',
  GBP = 'GBP',
}

export interface Money {
  amount: number; // Amount in smallest currency unit (e.g., kobo for NGN)
  currency: Currency;
}

export interface Customer {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface PaymentMetadata {
  [key: string]: any;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: any;
}
