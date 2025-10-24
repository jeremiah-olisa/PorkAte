/**
 * Paystack-specific errors
 */

export class PaystackError extends Error {
  constructor(
    message: string,
    public code: string = 'PAYSTACK_ERROR',
    public details?: any,
  ) {
    super(message);
    this.name = 'PaystackError';
    Object.setPrototypeOf(this, PaystackError.prototype);
  }
}

export class PaystackApiError extends PaystackError {
  constructor(message: string, public statusCode?: number, details?: any) {
    super(message, 'PAYSTACK_API_ERROR', details);
    this.name = 'PaystackApiError';
    Object.setPrototypeOf(this, PaystackApiError.prototype);
  }
}

export class PaystackConfigError extends PaystackError {
  constructor(message: string) {
    super(message, 'PAYSTACK_CONFIG_ERROR');
    this.name = 'PaystackConfigError';
    Object.setPrototypeOf(this, PaystackConfigError.prototype);
  }
}
