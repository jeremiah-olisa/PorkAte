# Payment Exception Handling Guide

This guide covers all exception types available in the `@porkate/payment` core package.

## Table of Contents

- [Overview](#overview)
- [Exception Hierarchy](#exception-hierarchy)
- [Exception Types](#exception-types)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Overview

All payment operations can throw exceptions when errors occur. The package provides a comprehensive set of exception classes to help you handle different error scenarios gracefully.

### Key Features

- **Type-safe**: All exceptions are TypeScript classes with proper typing
- **Hierarchical**: Exceptions inherit from base classes for easy catching
- **Detailed**: Each exception includes error codes and additional details
- **Serializable**: All exceptions can be converted to JSON

## Exception Hierarchy

```
PaymentException (base class)
│
├── PaymentConfigurationException
│   └── Thrown when gateway configuration is invalid
│
├── PaymentInitializationException
│   └── Thrown when payment initialization fails
│
├── PaymentVerificationException
│   └── Thrown when payment verification fails
│
├── PaymentNotFoundException
│   └── Thrown when payment is not found
│
├── PaymentRefundException
│   └── Thrown when refund operation fails
│
├── PaymentCancellationException
│   └── Thrown when payment cancellation fails
│
├── PaymentGatewayException
│   ├── Thrown when gateway API calls fail
│   └── PaymentGatewayTimeoutException
│       └── Thrown when gateway request times out
│
├── InvalidPaymentAmountException
│   └── Thrown when payment amount is invalid
│
├── UnsupportedCurrencyException
│   └── Thrown when currency is not supported
│
├── UnsupportedPaymentChannelException
│   └── Thrown when payment channel is not supported
│
├── PaymentValidationException
│   └── Thrown when payment data validation fails
│
├── DuplicatePaymentException
│   └── Thrown when payment already exists
│
├── InvalidRefundAmountException
│   └── Thrown when refund amount is invalid
│
└── PaymentNotRefundableException
    └── Thrown when payment cannot be refunded
```

## Exception Types

### PaymentException (Base)

Base class for all payment exceptions.

**Properties:**
- `message`: string - Error message
- `code`: string - Error code (default: 'PAYMENT_ERROR')
- `details`: any - Additional error details

**Methods:**
- `toJSON()`: Serialize to JSON object

**Example:**
```typescript
const error = new PaymentException('Something went wrong', 'CUSTOM_ERROR', {
  userId: 123,
  timestamp: Date.now(),
});

console.log(error.message); // "Something went wrong"
console.log(error.code); // "CUSTOM_ERROR"
console.log(error.details); // { userId: 123, timestamp: ... }
```

### PaymentConfigurationException

Thrown when payment gateway configuration is invalid or missing.

**Code:** `PAYMENT_CONFIGURATION_ERROR`

**Example:**
```typescript
throw new PaymentConfigurationException('Secret key is required', {
  gateway: 'Paystack',
  missing: ['secretKey'],
});
```

### PaymentInitializationException

Thrown when payment initialization fails.

**Code:** `PAYMENT_INITIALIZATION_ERROR`

**Example:**
```typescript
throw new PaymentInitializationException('Failed to create payment session', {
  amount: 5000,
  currency: 'NGN',
});
```

### PaymentVerificationException

Thrown when payment verification fails.

**Code:** `PAYMENT_VERIFICATION_ERROR`

**Example:**
```typescript
throw new PaymentVerificationException('Unable to verify payment status', {
  reference: 'PAY_123',
  attempts: 3,
});
```

### PaymentNotFoundException

Thrown when a payment with the given reference is not found.

**Code:** `PAYMENT_NOT_FOUND`

**Constructor:**
```typescript
new PaymentNotFoundException(reference: string, details?: any)
```

**Example:**
```typescript
throw new PaymentNotFoundException('PAY_123', {
  searchedAt: new Date(),
  gateway: 'Paystack',
});
// Message: "Payment with reference 'PAY_123' not found"
```

### PaymentRefundException

Thrown when a refund operation fails.

**Code:** `PAYMENT_REFUND_ERROR`

**Example:**
```typescript
throw new PaymentRefundException('Refund processing failed', {
  reference: 'PAY_123',
  amount: 5000,
  reason: 'Insufficient balance in merchant account',
});
```

### PaymentCancellationException

Thrown when payment cancellation fails.

**Code:** `PAYMENT_CANCELLATION_ERROR`

**Example:**
```typescript
throw new PaymentCancellationException('Cannot cancel completed payment', {
  reference: 'PAY_123',
  status: 'success',
});
```

### PaymentGatewayException

Thrown when payment gateway API calls fail.

**Code:** `PAYMENT_GATEWAY_ERROR`

**Properties:**
- `statusCode`: number - HTTP status code

**Example:**
```typescript
throw new PaymentGatewayException('API request failed', 500, {
  endpoint: '/transaction/initialize',
  response: { error: 'Internal server error' },
});
```

### PaymentGatewayTimeoutException

Thrown when a payment gateway request times out.

**Code:** `PAYMENT_GATEWAY_TIMEOUT`

**Constructor:**
```typescript
new PaymentGatewayTimeoutException(message?: string, details?: any)
```

**Example:**
```typescript
throw new PaymentGatewayTimeoutException('Request timed out after 30s', {
  timeout: 30000,
  endpoint: '/transaction/verify',
});
```

### InvalidPaymentAmountException

Thrown when payment amount is invalid.

**Code:** `INVALID_PAYMENT_AMOUNT`

**Constructor:**
```typescript
new InvalidPaymentAmountException(amount: number, currency: string, reason?: string)
```

**Example:**
```typescript
throw new InvalidPaymentAmountException(50, 'NGN', 'Minimum amount is 100');
// Message: "Invalid payment amount 50 NGN: Minimum amount is 100"
```

### UnsupportedCurrencyException

Thrown when a currency is not supported by the gateway.

**Code:** `UNSUPPORTED_CURRENCY`

**Constructor:**
```typescript
new UnsupportedCurrencyException(currency: string, supportedCurrencies?: string[])
```

**Example:**
```typescript
throw new UnsupportedCurrencyException('EUR', ['NGN', 'USD', 'GHS']);
// Message: "Currency 'EUR' is not supported. Supported currencies: NGN, USD, GHS"
```

### UnsupportedPaymentChannelException

Thrown when a payment channel is not supported.

**Code:** `UNSUPPORTED_PAYMENT_CHANNEL`

**Constructor:**
```typescript
new UnsupportedPaymentChannelException(channel: string, supportedChannels?: string[])
```

**Example:**
```typescript
throw new UnsupportedPaymentChannelException('crypto', ['card', 'bank', 'ussd']);
// Message: "Payment channel 'crypto' is not supported. Supported channels: card, bank, ussd"
```

### PaymentValidationException

Thrown when payment data validation fails.

**Code:** `PAYMENT_VALIDATION_ERROR`

**Properties:**
- `field`: string - The field that failed validation

**Example:**
```typescript
throw new PaymentValidationException('Email is invalid', 'email', {
  value: 'invalid-email',
  pattern: /^.+@.+\..+$/,
});
```

### DuplicatePaymentException

Thrown when a payment with the same reference already exists.

**Code:** `DUPLICATE_PAYMENT`

**Constructor:**
```typescript
new DuplicatePaymentException(reference: string, details?: any)
```

**Example:**
```typescript
throw new DuplicatePaymentException('PAY_123', {
  existingPaymentId: 456,
  createdAt: new Date('2025-10-01'),
});
// Message: "Payment with reference 'PAY_123' has already been processed"
```

### InvalidRefundAmountException

Thrown when refund amount exceeds payment amount.

**Code:** `INVALID_REFUND_AMOUNT`

**Constructor:**
```typescript
new InvalidRefundAmountException(refundAmount: number, paymentAmount: number, details?: any)
```

**Example:**
```typescript
throw new InvalidRefundAmountException(15000, 10000);
// Message: "Refund amount 15000 exceeds payment amount 10000"
```

### PaymentNotRefundableException

Thrown when a payment cannot be refunded.

**Code:** `PAYMENT_NOT_REFUNDABLE`

**Constructor:**
```typescript
new PaymentNotRefundableException(reference: string, reason?: string, details?: any)
```

**Example:**
```typescript
throw new PaymentNotRefundableException('PAY_123', 'Refund period expired', {
  paymentDate: new Date('2025-01-01'),
  refundDeadline: new Date('2025-02-01'),
});
// Message: "Payment 'PAY_123' cannot be refunded: Refund period expired"
```

## Usage Examples

### Basic Exception Handling

```typescript
import { PaystackGateway } from '@porkate/paystack';
import { PaymentException, PaymentNotFoundException } from '@porkate/payment';

try {
  const payment = await gateway.getPayment({ reference: 'PAY_123' });
} catch (error) {
  if (error instanceof PaymentNotFoundException) {
    console.error('Payment not found:', error.message);
    // Handle payment not found
  } else if (error instanceof PaymentException) {
    console.error('Payment error:', error.code, error.message);
    // Handle other payment errors
  } else {
    console.error('Unexpected error:', error);
    // Handle unexpected errors
  }
}
```

### Catching Multiple Exception Types

```typescript
import {
  PaymentConfigurationException,
  PaymentGatewayException,
  UnsupportedCurrencyException,
} from '@porkate/payment';

try {
  const gateway = new PaystackGateway(config);
  const payment = await gateway.initiatePayment(request);
} catch (error) {
  if (error instanceof PaymentConfigurationException) {
    // Configuration error - fix config
    console.error('Config error:', error.details);
  } else if (error instanceof UnsupportedCurrencyException) {
    // Currency not supported - inform user
    console.error('Supported currencies:', error.details.supportedCurrencies);
  } else if (error instanceof PaymentGatewayException) {
    // Gateway error - retry or use fallback
    console.error('Gateway error:', error.statusCode, error.message);
  }
}
```

### Using Exception Details

```typescript
try {
  await gateway.refundPayment({ reference: 'PAY_123', amount: 15000 });
} catch (error) {
  if (error instanceof InvalidRefundAmountException) {
    console.error(`Cannot refund ${error.details.refundAmount}`);
    console.error(`Payment amount was ${error.details.paymentAmount}`);
    // Show user the maximum refundable amount
  }
}
```

### Serializing Exceptions

```typescript
try {
  await gateway.initiatePayment(request);
} catch (error) {
  if (error instanceof PaymentException) {
    // Log to monitoring service
    logger.error('Payment error', error.toJSON());
    
    // Send to API
    await api.logError({
      type: 'payment_error',
      error: error.toJSON(),
    });
  }
}
```

### Custom Error Handling

```typescript
class PaymentService {
  async processPayment(request: InitiatePaymentRequest) {
    try {
      return await this.gateway.initiatePayment(request);
    } catch (error) {
      // Transform exceptions to API responses
      if (error instanceof PaymentValidationException) {
        return {
          status: 400,
          error: {
            field: error.field,
            message: error.message,
          },
        };
      }
      
      if (error instanceof PaymentGatewayTimeoutException) {
        return {
          status: 504,
          error: {
            message: 'Payment gateway timeout - please retry',
            retryable: true,
          },
        };
      }
      
      // Default error response
      return {
        status: 500,
        error: {
          message: 'Payment processing failed',
        },
      };
    }
  }
}
```

## Best Practices

### 1. Always Catch Specific Exceptions First

```typescript
// ✅ Good - specific to general
try {
  // ...
} catch (error) {
  if (error instanceof PaymentNotFoundException) {
    // Handle not found
  } else if (error instanceof PaymentException) {
    // Handle general payment error
  } else {
    // Handle other errors
  }
}

// ❌ Bad - general first (specific catch never reached)
try {
  // ...
} catch (error) {
  if (error instanceof PaymentException) {
    // This catches everything!
  } else if (error instanceof PaymentNotFoundException) {
    // Never reached
  }
}
```

### 2. Provide Meaningful Details

```typescript
// ✅ Good - includes helpful details
throw new PaymentValidationException('Invalid email format', 'email', {
  value: userInput.email,
  pattern: EMAIL_REGEX.toString(),
  suggestion: 'Please enter a valid email address',
});

// ❌ Bad - no context
throw new PaymentValidationException('Invalid email');
```

### 3. Log Exception Details

```typescript
try {
  await gateway.verifyPayment({ reference });
} catch (error) {
  if (error instanceof PaymentException) {
    logger.error('Payment verification failed', {
      code: error.code,
      message: error.message,
      details: error.details,
      reference,
    });
  }
  throw error; // Re-throw after logging
}
```

### 4. Don't Swallow Exceptions

```typescript
// ✅ Good - handle or re-throw
try {
  await gateway.initiatePayment(request);
} catch (error) {
  logger.error('Payment failed', error);
  throw error; // Let caller handle it
}

// ❌ Bad - swallows the error
try {
  await gateway.initiatePayment(request);
} catch (error) {
  console.log('Error occurred'); // Error is lost
}
```

### 5. Use Exception Codes for Programmatic Handling

```typescript
function getErrorMessage(error: PaymentException): string {
  switch (error.code) {
    case 'PAYMENT_NOT_FOUND':
      return 'We could not find this payment';
    case 'UNSUPPORTED_CURRENCY':
      return `We don't support ${error.details.currency} yet`;
    case 'PAYMENT_GATEWAY_TIMEOUT':
      return 'Payment is taking longer than expected. Please check back later';
    default:
      return 'An error occurred processing your payment';
  }
}
```

## License

MIT
