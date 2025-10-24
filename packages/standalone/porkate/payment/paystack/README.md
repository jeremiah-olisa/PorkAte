# @porkate/paystack

Paystack payment gateway adapter for PorkAte. This package provides a complete implementation of the `@porkate/payment` interface for Paystack.

## Installation

```bash
npm install @porkate/paystack @porkate/payment
# or
pnpm add @porkate/paystack @porkate/payment
```

## Features

- ✅ Full implementation of PorkAte payment interface
- 🇳🇬 Support for Nigerian Naira (NGN)
- 🌍 Support for GHS, ZAR, and USD
- 💳 Multiple payment channels (card, bank transfer, USSD, etc.)
- 🔄 Payment verification and status tracking
- 💰 Refund support
- 🔐 Secure API integration
- 🐛 Debug mode for development

## Supported Operations

- ✅ Initiate Payment
- ✅ Verify Payment
- ✅ Get Payment by Reference
- ✅ Refund Payment
- ⚠️ Cancel Payment (limited support)

## Quick Start

```typescript
import { PaystackGateway } from '@porkate/paystack';
import { Currency, createMoney } from '@porkate/payment';

// Initialize the gateway
const paystack = new PaystackGateway({
  secretKey: 'sk_test_your_secret_key',
  debug: true, // Enable debug mode for development
});

// Initiate a payment
const payment = await paystack.initiatePayment({
  amount: createMoney(5000, Currency.NGN), // 5000 Naira
  customer: {
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+2348012345678',
  },
  callbackUrl: 'https://yourapp.com/payment/callback',
  metadata: {
    order_id: 'ORD123',
    cart_id: 'CART456',
  },
});

if (payment.success) {
  // Redirect user to payment.authorizationUrl
  console.log('Payment URL:', payment.authorizationUrl);
  console.log('Reference:', payment.reference);
}
```

## Configuration

```typescript
interface PaystackConfig {
  secretKey: string; // Required: Your Paystack secret key
  publicKey?: string; // Optional: Public key for frontend
  baseUrl?: string; // Optional: Custom API base URL (for testing)
  timeout?: number; // Optional: Request timeout in ms (default: 30000)
  debug?: boolean; // Optional: Enable debug logging
}
```

## Usage Examples

### 1. Initialize Payment

```typescript
const response = await paystack.initiatePayment({
  amount: createMoney(10000, Currency.NGN),
  customer: {
    email: 'customer@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
  },
  callbackUrl: 'https://yourapp.com/callback',
  channels: [PaymentChannel.CARD, PaymentChannel.BANK_TRANSFER],
  metadata: {
    custom_field: 'custom_value',
  },
});

if (response.success) {
  // Redirect user to response.authorizationUrl
}
```

### 2. Verify Payment

```typescript
const verification = await paystack.verifyPayment({
  reference: 'PAY_1234567890_ABC123',
});

if (verification.success && verification.status === PaymentStatus.SUCCESS) {
  console.log('Payment successful!');
  console.log('Amount:', verification.amount);
  console.log('Customer:', verification.customer);
}
```

### 3. Get Payment Details

```typescript
const payment = await paystack.getPayment({
  reference: 'PAY_1234567890_ABC123',
});

if (payment.success) {
  console.log('Status:', payment.status);
  console.log('Amount:', payment.amount);
  console.log('Channel:', payment.channel);
  console.log('Paid at:', payment.paidAt);
}
```

### 4. Refund Payment

```typescript
const refund = await paystack.refundPayment({
  reference: 'PAY_1234567890_ABC123',
  reason: 'Customer requested refund',
  // Optional: partial refund
  // amount: createMoney(5000, Currency.NGN),
});

if (refund.success) {
  console.log('Refund Reference:', refund.refundReference);
  console.log('Refund Status:', refund.status);
}
```

## Error Handling

```typescript
const payment = await paystack.initiatePayment(request);

if (!payment.success) {
  console.error('Error Code:', payment.error?.code);
  console.error('Error Message:', payment.error?.message);
  console.error('Error Details:', payment.error?.details);
}
```

## Supported Payment Channels

- `CARD` - Debit/Credit cards
- `BANK` - Bank account
- `BANK_TRANSFER` - Bank transfer
- `USSD` - USSD codes
- `QR` - QR code payments
- `MOBILE_MONEY` - Mobile money (Ghana)
- `EFT` - Electronic Funds Transfer (South Africa)

## Supported Currencies

- `NGN` - Nigerian Naira
- `GHS` - Ghanaian Cedi
- `ZAR` - South African Rand
- `USD` - US Dollar

## Testing

Use Paystack's test keys for development:

```typescript
const paystack = new PaystackGateway({
  secretKey: 'sk_test_xxxxxxxxxxxxx',
  debug: true,
});
```

### Test Cards

- **Success**: 4084084084084081
- **Insufficient Funds**: 5060666666666666666
- **Declined**: 5061004410004

## Best Practices

1. **Store References**: Always store payment references for tracking
2. **Verify on Backend**: Always verify payments on your backend
3. **Handle Webhooks**: Implement Paystack webhooks for real-time updates
4. **Use Metadata**: Store relevant information in metadata field
5. **Error Handling**: Always check `success` flag before processing
6. **Amount Format**: Use `createMoney()` utility to ensure correct amount format

## API Reference

### Methods

#### `initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse>`

Initializes a new payment transaction.

#### `verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>`

Verifies the status of a payment transaction.

#### `getPayment(request: GetPaymentRequest): Promise<GetPaymentResponse>`

Retrieves detailed information about a payment.

#### `refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse>`

Processes a refund for a completed payment.

#### `cancelPayment(request: CancelPaymentRequest): Promise<CancelPaymentResponse>`

Attempts to cancel a pending payment (limited support).

#### `getGatewayName(): string`

Returns "Paystack".

#### `isReady(): boolean`

Checks if the gateway is properly configured.

## Resources

- [Paystack API Documentation](https://paystack.com/docs/api/)
- [Paystack Dashboard](https://dashboard.paystack.com/)
- [@porkate/payment Documentation](../core/README.md)

## License

MIT

## Author

Jeremiah Olisa


Paystack payment gateway adapter for PorkAte wallet package.

**Status:** ✅ Extraction-Ready (Can be moved to separate repository)

## Features

- 💳 Initialize payments
- ✅ Verify transactions
- 💰 Transfer to bank accounts
- 🔄 Webhook handling
- 🇳🇬 Optimized for Nigerian market

## Installation

```bash
npm install @porkate/paystack @porkate/payment
```

## License

MIT
