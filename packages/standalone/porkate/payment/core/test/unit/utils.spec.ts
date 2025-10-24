import {
  toMinorUnits,
  toMajorUnits,
  createMoney,
  formatMoney,
  generateReference,
  isValidEmail,
  Currency,
} from '../../src/utils';

describe('Payment Utils', () => {
  describe('toMinorUnits', () => {
    it('should convert major units to minor units', () => {
      expect(toMinorUnits(100, Currency.NGN)).toBe(10000);
      expect(toMinorUnits(50.5, Currency.NGN)).toBe(5050);
      expect(toMinorUnits(1, Currency.USD)).toBe(100);
    });
  });

  describe('toMajorUnits', () => {
    it('should convert minor units to major units', () => {
      expect(toMajorUnits(10000, Currency.NGN)).toBe(100);
      expect(toMajorUnits(5050, Currency.NGN)).toBe(50.5);
      expect(toMajorUnits(100, Currency.USD)).toBe(1);
    });
  });

  describe('createMoney', () => {
    it('should create money object', () => {
      const money = createMoney(100, Currency.NGN);
      expect(money.amount).toBe(10000);
      expect(money.currency).toBe(Currency.NGN);
    });
  });

  describe('formatMoney', () => {
    it('should format money for display', () => {
      const money = createMoney(100, Currency.NGN);
      expect(formatMoney(money)).toBe('NGN 100.00');
    });
  });

  describe('generateReference', () => {
    it('should generate unique references', () => {
      const ref1 = generateReference('PAY');
      const ref2 = generateReference('PAY');
      
      expect(ref1).toContain('PAY_');
      expect(ref2).toContain('PAY_');
      expect(ref1).not.toBe(ref2);
    });

    it('should use default prefix', () => {
      const ref = generateReference();
      expect(ref).toContain('TXN_');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@invalid.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });
});
