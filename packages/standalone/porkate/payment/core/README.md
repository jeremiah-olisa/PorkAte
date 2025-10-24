# @porkate/payment

Core payment gateway interface for PorkAte wallet system. This package provides standard interfaces and types for implementing payment gateway adapters.

## Installation

```bash
npm install @porkate/payment
# or
pnpm add @porkate/payment
```

## Features

- 🔌 Standard payment gateway interface
- 💳 Support for multiple payment operations
- 🔄 Unified payment status and channel types
- 🛠️ Utility functions for money handling
- 📦 Type-safe TypeScript definitions
- ⚠️ Comprehensive exception handling

## Core Operations

The `IPaymentGateway` interface defines the following operations:

- **Initiate Payment**: Start a new payment transaction
- **Verify Payment**: Verify a payment transaction status
- **Get Payment**: Retrieve payment details by reference
- **Refund Payment**: Process a payment refund
- **Cancel Payment**: Cancel a pending payment (optional)

## Types

### PaymentStatus

```typescript
enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  ABANDONED = 'abandoned',
  REVERSED = 'reversed',
}
```

### PaymentChannel

```typescript
enum PaymentChannel {
  CARD = 'card',
  BANK = 'bank',
  BANK_TRANSFER = 'bank_transfer',
  USSD = 'ussd',
  QR = 'qr',
  MOBILE_MONEY = 'mobile_money',
  EFT = 'eft',
}
```

### Currency

```typescript
enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  GHS = 'GHS',
  ZAR = 'ZAR',
  KES = 'KES',
  EUR = 'EUR',
  GBP = 'GBP',
}
```

## Usage

### Implementing a Payment Gateway

```typescript
import { IPaymentGateway, InitiatePaymentRequest, InitiatePaymentResponse } from '@porkate/payment';

class MyPaymentGateway implements IPaymentGateway {
  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    // Implementation
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    // Implementation
  }

  async getPayment(request: GetPaymentRequest): Promise<GetPaymentResponse> {
    // Implementation
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    // Implementation
  }

  getGatewayName(): string {
    return 'MyGateway';
  }

  isReady(): boolean {
    return true;
  }
}
```

### Using Utility Functions

```typescript
import { createMoney, formatMoney, generateReference, Currency } from '@porkate/payment';

// Create money object
const amount = createMoney(1000, Currency.NGN); // 1000 Naira = 100000 kobo

// Format money for display
const formatted = formatMoney(amount); // "NGN 1000.00"

// Generate transaction reference
const reference = generateReference('PAY'); // "PAY_1234567890_ABC123"
```

## Exception Handling

The package provides comprehensive exception classes for handling errors:

### Exception Hierarchy

```typescript
PaymentException (base)
├── PaymentConfigurationException
├── PaymentInitializationException
├── PaymentVerificationException
├── PaymentNotFoundException
├── PaymentRefundException
├── PaymentCancellationException
├── PaymentGatewayException
│   └── PaymentGatewayTimeoutException
├── InvalidPaymentAmountException
├── UnsupportedCurrencyException
├── UnsupportedPaymentChannelException
├── PaymentValidationException
├── DuplicatePaymentException
├── InvalidRefundAmountException
└── PaymentNotRefundableException
```

### Using Exceptions

```typescript
import {
  PaymentConfigurationException,
  PaymentNotFoundException,
  UnsupportedCurrencyException,
} from '@porkate/payment';

try {
  // Gateway operations that may throw
  const gateway = new MyPaymentGateway(config);
  const payment = await gateway.initiatePayment(request);
} catch (error) {
  if (error instanceof PaymentConfigurationException) {
    console.error('Configuration error:', error.message);
    console.error('Details:', error.details);
  } else if (error instanceof PaymentNotFoundException) {
    console.error('Payment not found:', error.message);
  } else if (error instanceof UnsupportedCurrencyException) {
    console.error('Currency not supported:', error.message);
    console.error('Supported:', error.details.supportedCurrencies);
  }
}
```

### Exception Properties

All exceptions extend `PaymentException` and include:
- `message`: Error message
- `code`: Error code (e.g., 'PAYMENT_NOT_FOUND')
- `details`: Additional error details
- `toJSON()`: Serialize exception to JSON

```typescript
const error = new PaymentNotFoundException('PAY_123');
console.log(error.code); // 'PAYMENT_NOT_FOUND'
console.log(error.toJSON()); // { name, message, code, details }
```

## API Reference

### Interfaces

- `IPaymentGateway` - Core payment gateway interface
- `PaymentGatewayConfig` - Base configuration for gateways
- `InitiatePaymentRequest` - Request to initiate payment
- `InitiatePaymentResponse` - Response from payment initiation
- `VerifyPaymentRequest` - Request to verify payment
- `VerifyPaymentResponse` - Response from payment verification
- `GetPaymentRequest` - Request to get payment details
- `GetPaymentResponse` - Response with payment details
- `RefundPaymentRequest` - Request to refund payment
- `RefundPaymentResponse` - Response from refund
- `CancelPaymentRequest` - Request to cancel payment
- `CancelPaymentResponse` - Response from cancellation

### Types

- `Money` - Amount and currency representation
- `Customer` - Customer information
- `PaymentMetadata` - Additional payment data
- `PaymentError` - Error information

### Exceptions

All payment exception classes for error handling:
- `PaymentException` - Base exception
- `PaymentConfigurationException` - Configuration errors
- `PaymentGatewayException` - Gateway API errors
- `PaymentNotFoundException` - Payment not found
- `UnsupportedCurrencyException` - Currency not supported
- And 10+ more specific exception types

## License

MIT

## Author

Jeremiah Olisa


Payment gateway interface for PorkAte wallet package.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Description

This package provides the core interfaces and types for payment gateway integration with PorkAte wallets.

## Implementations

- [@porkate/paystack](../paystack) - Paystack payment gateway
- [@porkate/stripe](../stripe) - Stripe payment gateway
- [@porkate/flutterwave](../flutterwave) - Flutterwave payment gateway

## Installation

```bash
npm install @porkate/payment
# Install provider implementations
npm install @porkate/paystack @porkate/stripe @porkate/flutterwave
```

## License

MIT
