import { FlutterwaveGateway } from '../../src/core/flutterwave-gateway';
import { Currency, createMoney, PaymentStatus } from '@porkate/payment';

describe('FlutterwaveGateway', () => {
  let gateway: FlutterwaveGateway;

  beforeEach(() => {
    gateway = new FlutterwaveGateway({
      secretKey: 'FLWSECK_TEST-xxxxxxxxxxxxx',
      debug: false,
    });
  });

  describe('Configuration', () => {
    it('should initialize with valid config', () => {
      expect(gateway).toBeDefined();
      expect(gateway.getGatewayName()).toBe('Flutterwave');
      expect(gateway.isReady()).toBe(true);
    });

    it('should throw error with invalid config', () => {
      expect(() => {
        new FlutterwaveGateway({ secretKey: '' });
      }).toThrow('Secret key is required');
    });
  });

  describe('initiatePayment', () => {
    it('should initiate payment successfully', async () => {
      // Mock test - replace with actual API mocking
      const request = {
        amount: createMoney(5000, Currency.NGN),
        customer: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        callbackUrl: 'https://example.com/callback',
      };

      // In actual tests, mock the axios call
      // const response = await gateway.initiatePayment(request);
      // expect(response.success).toBe(true);
      // expect(response.reference).toBeDefined();
      // expect(response.authorizationUrl).toBeDefined();
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      // Mock test - replace with actual API mocking
      const request = {
        reference: 'TEST_REF_123',
      };

      // In actual tests, mock the axios call
      // const response = await gateway.verifyPayment(request);
      // expect(response.success).toBe(true);
      // expect(response.status).toBe(PaymentStatus.SUCCESS);
    });
  });

  // Add more tests for other methods
});
