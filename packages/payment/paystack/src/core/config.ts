import { Currency } from '@porkate/payment';

/**
 * Currency configuration based on Paystack documentation
 */
const currencyConfig: Record<
  Currency,
  { subunit: string | null; description: string; minimum: number }
> = {
  NGN: { subunit: 'Kobo', description: 'Nigerian Naira', minimum: 5000 }, // ₦50.00 in kobo
  USD: { subunit: 'Cent', description: 'US Dollar', minimum: 200 }, // $2.00 in cents
  GHS: { subunit: 'Pesewa', description: 'Ghanaian Cedi', minimum: 10 }, // ₵0.10 in pesewas
  ZAR: { subunit: 'Cent', description: 'South African Rand', minimum: 100 }, // R1.00 in cents
  KES: { subunit: 'Cent', description: 'Kenyan Shilling', minimum: 300 }, // Ksh.3.00 in cents
  EUR: { subunit: 'Cent', description: 'Euro', minimum: 200 }, // €2.00 in cents
  GBP: { subunit: 'Penny', description: 'British Pound Sterling', minimum: 200 }, // £2.00 in pence
  XOF: { subunit: null, description: 'West African CFA Franc', minimum: 100 }, // XOF 1.00 (multiplied by 100)
};

export default currencyConfig;
