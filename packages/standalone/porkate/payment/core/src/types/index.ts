/* eslint-disable @typescript-eslint/no-explicit-any */
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
  APPLE_PAY = 'apple_pay',
  USSD = 'ussd',
  QR = 'qr',
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  EFT = 'eft',
  PAYATTITUDE = 'payattitude',
}

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  GHS = 'GHS',
  ZAR = 'ZAR',
  KES = 'KES',
  EUR = 'EUR',
  GBP = 'GBP',
  XOF = 'XOF',
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
