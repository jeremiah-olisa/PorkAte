/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utility functions for Flutterwave operations
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
 * Map common currency codes to Flutterwave-supported currencies
 * @throws {UnsupportedCurrencyException} If currency is not supported by Flutterwave
 */
export function mapToFlutterwaveCurrency(currency: Currency): Currency {
  if (currency in currencyConfig) {
    return currency;
  }

  throw new UnsupportedCurrencyException(currency, Object.keys(currencyConfig));
}

/**
 * Validates the amount for a given currency based on Flutterwave requirements
 * @throws {PaymentValidationException} If amount is invalid for the currency
 */
export function validateFlutterwaveAmount(money: Money): void {
  const currency = mapToFlutterwaveCurrency(money.currency);
  const config = currencyConfig[currency];

  if (!config) {
    throw new PaymentValidationException(`Currency ${currency} is not supported`, 'currency', {
      currency: money.currency,
    });
  }

  // Check minimum amount (in base units)
  if (money.amount < config.minimum) {
    throw new PaymentValidationException(
      `Amount is below minimum of ${config.minimum} ${money.currency}`,
      'amount',
      { amount: money.amount, minimum: config.minimum },
    );
  }
}

/**
 * Maps a Money object to its Flutterwave-compatible amount
 * Flutterwave accepts amounts in base currency units (not subunits)
 * @param money The Money object with amount in base currency units
 * @returns The amount in base currency units for Flutterwave
 * @throws {PaymentValidationException} If the currency is not supported or the amount is invalid
 */
export function mapToFlutterwaveAmount(money: Money): number {
  const currency = mapToFlutterwaveCurrency(money.currency);
  const config = currencyConfig[currency];

  if (!config) {
    throw new PaymentValidationException(`Currency ${currency} is not supported`, 'currency', {
      currency: money.currency,
    });
  }

  // Flutterwave uses base currency units, not subunits
  const amountInBaseUnits = money.amount;

  // Validate the amount
  validateFlutterwaveAmount({ amount: amountInBaseUnits, currency: money.currency });

  return amountInBaseUnits;
}

/**
 * Map Flutterwave status to standard PaymentStatus
 */
export function mapFlutterwaveStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'successful':
    case 'success':
      return 'success';
    case 'failed':
      return 'failed';
    case 'cancelled':
      return 'abandoned';
    case 'pending':
    default:
      return 'pending';
  }
}

/**
 * Sanitize metadata for Flutterwave
 */
export function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
  if (!metadata) return {};

  // Remove any null or undefined values
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (value !== null && value !== undefined) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Map standard payment channel to Flutterwave payment options
 */
export function mapChannelsToPaymentOptions(channels?: PaymentChannel[]): string | undefined {
  if (!channels || channels.length === 0) return undefined;

  const channelMap: Record<PaymentChannel, string> = {
    [PaymentChannel.CARD]: 'card',
    [PaymentChannel.BANK]: 'account',
    [PaymentChannel.APPLE_PAY]: 'applepay',
    [PaymentChannel.USSD]: 'ussd',
    [PaymentChannel.QR]: 'qr',
    [PaymentChannel.MOBILE_MONEY]: 'mobilemoney',
    [PaymentChannel.BANK_TRANSFER]: 'banktransfer',
    [PaymentChannel.EFT]: 'eft',
    [PaymentChannel.PAYATTITUDE]: 'payattitude',
  };

  const mappedChannels = channels
    .map((channel) => channelMap[channel])
    .filter((channel) => channel !== undefined);

  return mappedChannels.join(',');
}

/**
 * Map Flutterwave payment type to standard payment channel
 */
export function mapFlutterwaveChannel(paymentType: string): PaymentChannel {
  const channelMap: Record<string, PaymentChannel> = {
    card: PaymentChannel.CARD,
    account: PaymentChannel.BANK,
    applepay: PaymentChannel.APPLE_PAY,
    ussd: PaymentChannel.USSD,
    qr: PaymentChannel.QR,
    mobilemoney: PaymentChannel.MOBILE_MONEY,
    banktransfer: PaymentChannel.BANK_TRANSFER,
    eft: PaymentChannel.EFT,
  };

  return channelMap[paymentType.toLowerCase()] || PaymentChannel.CARD;
}
