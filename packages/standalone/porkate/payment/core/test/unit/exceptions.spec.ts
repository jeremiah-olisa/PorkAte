import {
  PaymentException,
  PaymentConfigurationException,
  PaymentInitializationException,
  PaymentVerificationException,
  PaymentNotFoundException,
  PaymentRefundException,
  PaymentCancellationException,
  PaymentGatewayException,
  PaymentGatewayTimeoutException,
  InvalidPaymentAmountException,
  UnsupportedCurrencyException,
  UnsupportedPaymentChannelException,
  PaymentValidationException,
  DuplicatePaymentException,
  InvalidRefundAmountException,
  PaymentNotRefundableException,
} from '../../src/exceptions';

describe('Payment Exceptions', () => {
  describe('PaymentException', () => {
    it('should create base exception with code and details', () => {
      const error = new PaymentException('Test error', 'TEST_CODE', { foo: 'bar' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ foo: 'bar' });
      expect(error.name).toBe('PaymentException');
    });

    it('should use default code if not provided', () => {
      const error = new PaymentException('Test error');
      expect(error.code).toBe('PAYMENT_ERROR');
    });

    it('should serialize to JSON properly', () => {
      const error = new PaymentException('Test error', 'TEST_CODE', { foo: 'bar' });
      const json = error.toJSON();
      
      expect(json).toEqual({
        name: 'PaymentException',
        message: 'Test error',
        code: 'TEST_CODE',
        details: { foo: 'bar' },
      });
    });
  });

  describe('PaymentConfigurationException', () => {
    it('should create configuration exception', () => {
      const error = new PaymentConfigurationException('Invalid config', { key: 'missing' });
      
      expect(error).toBeInstanceOf(PaymentException);
      expect(error.message).toBe('Invalid config');
      expect(error.code).toBe('PAYMENT_CONFIGURATION_ERROR');
      expect(error.name).toBe('PaymentConfigurationException');
    });
  });

  describe('PaymentNotFoundException', () => {
    it('should create not found exception with reference', () => {
      const error = new PaymentNotFoundException('PAY_123');
      
      expect(error.message).toBe("Payment with reference 'PAY_123' not found");
      expect(error.code).toBe('PAYMENT_NOT_FOUND');
      expect(error.name).toBe('PaymentNotFoundException');
    });
  });

  describe('PaymentGatewayException', () => {
    it('should create gateway exception with status code', () => {
      const error = new PaymentGatewayException('API error', 500, { response: 'data' });
      
      expect(error).toBeInstanceOf(PaymentException);
      expect(error.message).toBe('API error');
      expect(error.code).toBe('PAYMENT_GATEWAY_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('PaymentGatewayException');
    });

    it('should include statusCode in JSON', () => {
      const error = new PaymentGatewayException('API error', 500);
      const json = error.toJSON();
      
      expect(json.statusCode).toBe(500);
    });
  });

  describe('PaymentGatewayTimeoutException', () => {
    it('should create timeout exception with default message', () => {
      const error = new PaymentGatewayTimeoutException();
      
      expect(error.message).toBe('Payment gateway request timed out');
      expect(error.code).toBe('PAYMENT_GATEWAY_TIMEOUT');
      expect(error.name).toBe('PaymentGatewayTimeoutException');
    });

    it('should allow custom message', () => {
      const error = new PaymentGatewayTimeoutException('Custom timeout message');
      expect(error.message).toBe('Custom timeout message');
    });
  });

  describe('InvalidPaymentAmountException', () => {
    it('should create exception with amount and currency', () => {
      const error = new InvalidPaymentAmountException(100, 'NGN', 'Amount too small');
      
      expect(error.message).toBe('Invalid payment amount 100 NGN: Amount too small');
      expect(error.code).toBe('INVALID_PAYMENT_AMOUNT');
      expect(error.details).toEqual({
        amount: 100,
        currency: 'NGN',
        reason: 'Amount too small',
      });
    });

    it('should work without reason', () => {
      const error = new InvalidPaymentAmountException(100, 'NGN');
      expect(error.message).toBe('Invalid payment amount 100 NGN');
    });
  });

  describe('UnsupportedCurrencyException', () => {
    it('should create exception with supported currencies list', () => {
      const error = new UnsupportedCurrencyException('EUR', ['NGN', 'USD', 'GHS']);
      
      expect(error.message).toBe(
        "Currency 'EUR' is not supported. Supported currencies: NGN, USD, GHS",
      );
      expect(error.code).toBe('UNSUPPORTED_CURRENCY');
      expect(error.details).toEqual({
        currency: 'EUR',
        supportedCurrencies: ['NGN', 'USD', 'GHS'],
      });
    });

    it('should work without supported currencies list', () => {
      const error = new UnsupportedCurrencyException('EUR');
      expect(error.message).toBe("Currency 'EUR' is not supported");
    });
  });

  describe('UnsupportedPaymentChannelException', () => {
    it('should create exception with supported channels list', () => {
      const error = new UnsupportedPaymentChannelException('crypto', ['card', 'bank']);
      
      expect(error.message).toBe(
        "Payment channel 'crypto' is not supported. Supported channels: card, bank",
      );
      expect(error.code).toBe('UNSUPPORTED_PAYMENT_CHANNEL');
    });
  });

  describe('PaymentValidationException', () => {
    it('should create validation exception with field', () => {
      const error = new PaymentValidationException('Email is invalid', 'email', {
        value: 'invalid',
      });
      
      expect(error.message).toBe('Email is invalid');
      expect(error.code).toBe('PAYMENT_VALIDATION_ERROR');
      expect(error.field).toBe('email');
      expect(error.details).toEqual({
        field: 'email',
        value: 'invalid',
      });
    });
  });

  describe('DuplicatePaymentException', () => {
    it('should create duplicate payment exception', () => {
      const error = new DuplicatePaymentException('PAY_123', { previousId: 456 });
      
      expect(error.message).toBe(
        "Payment with reference 'PAY_123' has already been processed",
      );
      expect(error.code).toBe('DUPLICATE_PAYMENT');
      expect(error.details).toEqual({
        reference: 'PAY_123',
        previousId: 456,
      });
    });
  });

  describe('InvalidRefundAmountException', () => {
    it('should create invalid refund amount exception', () => {
      const error = new InvalidRefundAmountException(15000, 10000);
      
      expect(error.message).toBe('Refund amount 15000 exceeds payment amount 10000');
      expect(error.code).toBe('INVALID_REFUND_AMOUNT');
      expect(error.details).toEqual({
        refundAmount: 15000,
        paymentAmount: 10000,
      });
    });
  });

  describe('PaymentNotRefundableException', () => {
    it('should create not refundable exception with reason', () => {
      const error = new PaymentNotRefundableException('PAY_123', 'Payment is too old');
      
      expect(error.message).toBe("Payment 'PAY_123' cannot be refunded: Payment is too old");
      expect(error.code).toBe('PAYMENT_NOT_REFUNDABLE');
      expect(error.details).toEqual({
        reference: 'PAY_123',
        reason: 'Payment is too old',
      });
    });

    it('should work without reason', () => {
      const error = new PaymentNotRefundableException('PAY_123');
      expect(error.message).toBe("Payment 'PAY_123' cannot be refunded");
    });
  });

  describe('Exception inheritance', () => {
    it('should maintain prototype chain', () => {
      const error = new PaymentConfigurationException('Test');
      
      expect(error instanceof PaymentConfigurationException).toBe(true);
      expect(error instanceof PaymentException).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should work with instanceof checks', () => {
      const errors = [
        new PaymentConfigurationException('Test'),
        new PaymentInitializationException('Test'),
        new PaymentVerificationException('Test'),
        new PaymentNotFoundException('REF'),
        new PaymentRefundException('Test'),
        new PaymentCancellationException('Test'),
        new PaymentGatewayException('Test'),
        new PaymentGatewayTimeoutException(),
        new InvalidPaymentAmountException(100, 'NGN'),
        new UnsupportedCurrencyException('EUR'),
        new UnsupportedPaymentChannelException('crypto'),
        new PaymentValidationException('Test'),
        new DuplicatePaymentException('REF'),
        new InvalidRefundAmountException(100, 50),
        new PaymentNotRefundableException('REF'),
      ];

      errors.forEach((error) => {
        expect(error instanceof PaymentException).toBe(true);
        expect(error instanceof Error).toBe(true);
      });
    });
  });
});
