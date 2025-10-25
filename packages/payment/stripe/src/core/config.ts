import { Currency } from '@porkate/payment';

/**
 * Currency configuration based on Stripe documentation
 * Stripe uses smallest currency unit (cents, pence, etc.) for most currencies
 */
const currencyConfig: Record<
  Currency,
  { subunit: string | null; description: string; minimum: number; zeroDecimal: boolean }
> = {
  NGN: { subunit: 'Kobo', description: 'Nigerian Naira', minimum: 5000, zeroDecimal: false }, // ₦50.00 in kobo
  USD: { subunit: 'Cent', description: 'US Dollar', minimum: 50, zeroDecimal: false }, // $0.50 in cents
  GHS: { subunit: 'Pesewa', description: 'Ghanaian Cedi', minimum: 100, zeroDecimal: false }, // ₵1.00 in pesewas
  ZAR: { subunit: 'Cent', description: 'South African Rand', minimum: 50, zeroDecimal: false }, // R0.50 in cents
  KES: { subunit: 'Cent', description: 'Kenyan Shilling', minimum: 50, zeroDecimal: false }, // Ksh.0.50 in cents
  EUR: { subunit: 'Cent', description: 'Euro', minimum: 50, zeroDecimal: false }, // €0.50 in cents
  GBP: { subunit: 'Penny', description: 'British Pound Sterling', minimum: 30, zeroDecimal: false }, // £0.30 in pence
  XOF: { subunit: null, description: 'West African CFA Franc', minimum: 100, zeroDecimal: true }, // XOF 100 (zero-decimal currency)
};

export default currencyConfig;
