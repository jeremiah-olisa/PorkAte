import { StripeGateway } from '../../src/core/stripe-gateway';
import { Currency, createMoney, PaymentStatus } from '@porkate/payment';

describe('StripeGateway', () => {
  let gateway: StripeGateway;

  beforeEach(() => {
    gateway = new StripeGateway({
      secretKey: 'sk_test_xxxxxxxxxxxxx',
      debug: false,
    });
  });

  describe('Configuration', () => {
    it('should initialize with valid config', () => {
      expect(gateway).toBeDefined();
      expect(gateway.getGatewayName()).toBe('Stripe');
      expect(gateway.isReady()).toBe(true);
    });

    it('should throw error with invalid config', () => {
      expect(() => {
        new StripeGateway({ secretKey: '' });
      }).toThrow('Secret key is required');
    });
  });

  describe('initiatePayment', () => {
    it('should initiate payment successfully', async () => {
      // Mock test - replace with actual API mocking
      const request = {
        amount: createMoney(5000, Currency.USD),
        customer: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        callbackUrl: 'https://example.com/callback',
      };

      // In actual tests, mock the Stripe SDK call
      // const response = await gateway.initiatePayment(request);
      // expect(response.success).toBe(true);
      // expect(response.reference).toBeDefined();
      // expect(response.accessCode).toBeDefined();
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      // Mock test - replace with actual API mocking
      const request = {
        reference: 'TEST_REF_123',
      };

      // In actual tests, mock the Stripe SDK call
      // const response = await gateway.verifyPayment(request);
      // expect(response.success).toBe(true);
      // expect(response.status).toBe(PaymentStatus.SUCCESS);
    });
  });

  // Add more tests for other methods
});
