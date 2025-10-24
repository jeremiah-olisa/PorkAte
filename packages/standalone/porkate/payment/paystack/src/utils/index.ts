/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utility functions for Paystack operations
 */

import {
  Currency,
  Money,
  PaymentChannel,
  PaymentValidationException,
  UnsupportedCurrencyException,
} from '@porkate/payment';
import currencyConfig from '../core/config';
export { MetadataParser } from './meta-data-parser';
/**
 * Constant for currency subunit divisor
 */
export const CURRENCY_SUBUNIT_DIVISOR = 100;

/**
 * Map common currency codes to Paystack-supported currencies
 * @throws {UnsupportedCurrencyException} If currency is not supported by Paystack
 */
export function mapToPaystackCurrency(currency: Currency): Currency {
  if (currency in currencyConfig) {
    return currency;
  }

  throw new UnsupportedCurrencyException(currency, Object.keys(currencyConfig));
}

/**
 * Validates the amount for a given currency based on Paystack requirements
 * @throws {PaymentValidationException} If amount is invalid for the currency
 */
export function validatePaystackAmount(money: Money): void {
  const currency = mapToPaystackCurrency(money.currency);
  const config = currencyConfig[currency];

  if (!config) {
    throw new PaymentValidationException(`Currency ${currency} is not supported`, 'currency', {
      currency: money.currency,
    });
  }

  // Check minimum amount (in subunits)
  if (money.amount < config.minimum) {
    throw new PaymentValidationException(
      `Amount is below minimum of ${config.minimum / CURRENCY_SUBUNIT_DIVISOR} ${money.currency}`,
      'amount',
      { amount: money.amount, minimum: config.minimum },
    );
  }

  // Special handling for XOF - no fractional parts allowed
  if (String(money.currency) === 'XOF' && money.amount % CURRENCY_SUBUNIT_DIVISOR !== 0) {
    throw new PaymentValidationException('XOF amounts must not have fractional parts', 'amount', {
      amount: money.amount,
    });
  }
}

/**
 * Maps a Money object to its Paystack-compatible amount in subunits
 * @param money The Money object with amount in base currency units (e.g., Naira, Dollars)
 * @returns The amount in subunits (e.g., kobo, cents) for Paystack
 * @throws {PaymentValidationException} If the currency is not supported or the amount is invalid
 */
export function mapToPaystackAmount(money: Money): number {
  const currency = mapToPaystackCurrency(money.currency);
  const config = currencyConfig[currency];

  if (!config) {
    throw new PaymentValidationException(`Currency ${currency} is not supported`, 'currency', {
      currency: money.currency,
    });
  }

  // Convert base amount to subunits by multiplying by 100
  const amountInSubunits = Math.round(money.amount * CURRENCY_SUBUNIT_DIVISOR);

  // Validate the converted amount
  validatePaystackAmount({ amount: amountInSubunits, currency: money.currency });

  return amountInSubunits;
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
export function sanitizeMetadata(metadata?: Record<string, any>): Record<string, string> {
  if (!metadata) return {};

  // Paystack has limitations on metadata
  // Remove any null or undefined values
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (value !== null && value !== undefined) {
      sanitized[key] = toString(value);
    }
  }

  return sanitized;
}

export function toString(
  value: string | number | boolean | symbol | bigint | object | null | undefined | any[],
): string {
  if (value === null || value === undefined) {
    return String(value);
  }

  if (Array.isArray(value) || typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return String(value);
    }
  }

  if (typeof value === 'symbol') {
    return value.toString();
  }

  if (typeof value === 'bigint') {
    return value.toString() + 'n';
  }

  return String(value);
}

/**
 * Map standard payment channel to Paystack channel
 */
export function mapChannel(channel: PaymentChannel): string {
  const channelMap: Record<PaymentChannel, string> = {
    [PaymentChannel.CARD]: 'card',
    [PaymentChannel.BANK]: 'bank',
    [PaymentChannel.APPLE_PAY]: 'apple_pay',
    [PaymentChannel.USSD]: 'ussd',
    [PaymentChannel.QR]: 'qr',
    [PaymentChannel.MOBILE_MONEY]: 'mobile_money',
    [PaymentChannel.BANK_TRANSFER]: 'bank_transfer',
    [PaymentChannel.EFT]: 'eft',
    [PaymentChannel.PAYATTITUDE]: 'payattitude',
  };

  return channelMap[channel] || 'card';
}

/**
 * Map Paystack channel to standard payment channel
 */
export function mapPaystackChannel(channel: string): PaymentChannel {
  const channelMap: Record<string, PaymentChannel> = {
    card: PaymentChannel.CARD,
    bank: PaymentChannel.BANK,
    apple_pay: PaymentChannel.APPLE_PAY,
    ussd: PaymentChannel.USSD,
    qr: PaymentChannel.QR,
    mobile_money: PaymentChannel.MOBILE_MONEY,
    bank_transfer: PaymentChannel.BANK_TRANSFER,
    eft: PaymentChannel.EFT,
    payattitude: PaymentChannel.PAYATTITUDE,
  };

  return channelMap[channel.toLowerCase()] || PaymentChannel.CARD;
}
