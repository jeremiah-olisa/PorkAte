import { Currency } from '@porkate/payment';

/**
 * Currency configuration based on Flutterwave documentation
 * Flutterwave uses base currency units (not subunits)
 */
const currencyConfig: Record<
  Currency,
  { subunit: string | null; description: string; minimum: number }
> = {
  NGN: { subunit: 'Kobo', description: 'Nigerian Naira', minimum: 10 }, // ₦10.00
  USD: { subunit: 'Cent', description: 'US Dollar', minimum: 1 }, // $1.00
  GHS: { subunit: 'Pesewa', description: 'Ghanaian Cedi', minimum: 1 }, // ₵1.00
  ZAR: { subunit: 'Cent', description: 'South African Rand', minimum: 10 }, // R10.00
  KES: { subunit: 'Cent', description: 'Kenyan Shilling', minimum: 10 }, // Ksh.10.00
  EUR: { subunit: 'Cent', description: 'Euro', minimum: 1 }, // €1.00
  GBP: { subunit: 'Penny', description: 'British Pound Sterling', minimum: 1 }, // £1.00
  XOF: { subunit: null, description: 'West African CFA Franc', minimum: 100 }, // XOF 100.00
};

export default currencyConfig;
