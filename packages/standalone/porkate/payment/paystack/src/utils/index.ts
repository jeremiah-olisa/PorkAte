/**
 * Utility functions for Paystack operations
 */

import { Currency, UnsupportedCurrencyException } from '@porkate/payment';

/**
 * Map common currency codes to Paystack-supported currencies
 * @throws {UnsupportedCurrencyException} If currency is not supported by Paystack
 */
export function mapToPaystackCurrency(currency: Currency): string {
  // Paystack supports NGN, GHS, ZAR, USD
  const supportedCurrencies = ['NGN', 'GHS', 'ZAR', 'USD'];
  
  if (supportedCurrencies.includes(currency)) {
    return currency;
  }
  
  throw new UnsupportedCurrencyException(currency, supportedCurrencies);
}

/**
 * Map Paystack status to standard PaymentStatus
 */
export function mapPaystackStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'success':
      return 'success';
    case 'failed':
      return 'failed';
    case 'abandoned':
      return 'abandoned';
    case 'reversed':
      return 'reversed';
    case 'pending':
    default:
      return 'pending';
  }
}

/**
 * Build Paystack API URL
 */
export function buildUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

/**
 * Sanitize metadata for Paystack
 */
export function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
  if (!metadata) return {};
  
  // Paystack has limitations on metadata
  // Remove any null or undefined values
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== null && value !== undefined) {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
