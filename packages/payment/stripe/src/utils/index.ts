/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utility functions for Stripe operations
 */

import {
  Currency,
  Money,
  PaymentChannel,
  PaymentValidationException,
  UnsupportedCurrencyException,
} from '@porkate/payment';
import currencyConfig from '../core/config';

/**
 * Constant for currency subunit divisor
 */
export const CURRENCY_SUBUNIT_DIVISOR = 100;

/**
 * Map common currency codes to Stripe-supported currencies
 * @throws {UnsupportedCurrencyException} If currency is not supported by Stripe
 */
export function mapToStripeCurrency(currency: Currency): string {
  if (currency in currencyConfig) {
    return currency.toLowerCase();
  }

  throw new UnsupportedCurrencyException(currency, Object.keys(currencyConfig));
}

/**
 * Validates the amount for a given currency based on Stripe requirements
 * @throws {PaymentValidationException} If amount is invalid for the currency
 */
export function validateStripeAmount(money: Money): void {
  const currency = money.currency;
  const config = currencyConfig[currency];

  if (!config) {
    throw new PaymentValidationException(`Currency ${currency} is not supported`, 'currency', {
      currency: money.currency,
    });
  }

  // Check minimum amount (in subunits or base units for zero-decimal currencies)
  if (money.amount < config.minimum) {
    const displayAmount = config.zeroDecimal
      ? config.minimum
      : config.minimum / CURRENCY_SUBUNIT_DIVISOR;
    throw new PaymentValidationException(
      `Amount is below minimum of ${displayAmount} ${money.currency}`,
      'amount',
      { amount: money.amount, minimum: config.minimum },
    );
  }
}

/**
 * Maps a Money object to its Stripe-compatible amount
 * Stripe uses smallest currency units (cents) for most currencies, but some are zero-decimal
 * @param money The Money object with amount in base currency units
 * @returns The amount in smallest currency units for Stripe
 * @throws {PaymentValidationException} If the currency is not supported or the amount is invalid
 */
export function mapToStripeAmount(money: Money): number {
  const currency = money.currency;
  const config = currencyConfig[currency];

  if (!config) {
    throw new PaymentValidationException(`Currency ${currency} is not supported`, 'currency', {
      currency: money.currency,
    });
  }

  // For zero-decimal currencies, use the amount as-is
  // For others, convert to smallest unit (cents)
  const amountInSmallestUnit = config.zeroDecimal
    ? Math.round(money.amount)
    : Math.round(money.amount * CURRENCY_SUBUNIT_DIVISOR);

  // Validate the converted amount against the minimum in smallest units
  if (amountInSmallestUnit < config.minimum) {
    const displayAmount = config.zeroDecimal
      ? config.minimum
      : config.minimum / CURRENCY_SUBUNIT_DIVISOR;
    throw new PaymentValidationException(
      `Amount is below minimum of ${displayAmount} ${money.currency}`,
      'amount',
      { amount: amountInSmallestUnit, minimum: config.minimum },
    );
  }

  return amountInSmallestUnit;
}

/**
 * Convert Stripe amount back to base currency units
 */
export function stripeAmountToMoney(amount: number, currency: Currency): Money {
  const config = currencyConfig[currency];

  if (!config) {
    return { amount, currency };
  }

  // For zero-decimal currencies, amount is already in base units
  // For others, divide by 100 to get base units
  const baseAmount = config.zeroDecimal ? amount : amount / CURRENCY_SUBUNIT_DIVISOR;

  return { amount: baseAmount, currency };
}

/**
 * Map Stripe payment intent status to standard PaymentStatus
 */
export function mapStripeStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'succeeded':
      return 'success';
    case 'canceled':
      return 'abandoned';
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
    case 'processing':
      return 'pending';
    default:
      return 'failed';
  }
}

/**
 * Sanitize metadata for Stripe
 */
export function sanitizeMetadata(metadata?: Record<string, any>): Record<string, string> {
  if (!metadata) return {};

  // Stripe requires all metadata values to be strings
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (value !== null && value !== undefined) {
      sanitized[key] = String(value);
    }
  }

  return sanitized;
}

/**
 * Map standard payment channel to Stripe payment method types
 */
export function mapChannelsToPaymentMethodTypes(channels?: PaymentChannel[]): string[] {
  if (!channels || channels.length === 0) {
    return ['card']; // Default to card
  }

  const channelMap: Record<PaymentChannel, string> = {
    [PaymentChannel.CARD]: 'card',
    [PaymentChannel.BANK]: 'us_bank_account',
    [PaymentChannel.APPLE_PAY]: 'card', // Apple Pay uses card payment method
    [PaymentChannel.USSD]: 'card',
    [PaymentChannel.QR]: 'card',
    [PaymentChannel.MOBILE_MONEY]: 'card',
    [PaymentChannel.BANK_TRANSFER]: 'us_bank_account',
    [PaymentChannel.EFT]: 'us_bank_account',
    [PaymentChannel.PAYATTITUDE]: 'card',
  };

  const mappedChannels = channels
    .map((channel) => channelMap[channel])
    .filter((channel, index, self) => channel && self.indexOf(channel) === index); // Remove duplicates

  return mappedChannels.length > 0 ? mappedChannels : ['card'];
}

/**
 * Map Stripe payment method type to standard payment channel
 */
export function mapStripeChannel(paymentMethodType: string): PaymentChannel {
  const channelMap: Record<string, PaymentChannel> = {
    card: PaymentChannel.CARD,
    us_bank_account: PaymentChannel.BANK,
    sepa_debit: PaymentChannel.BANK,
    bacs_debit: PaymentChannel.BANK,
  };

  return channelMap[paymentMethodType.toLowerCase()] || PaymentChannel.CARD;
}
