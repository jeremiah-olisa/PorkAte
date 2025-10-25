# @porkate/payment - Quick Reference

Quick reference guide for common operations with the payment library.

## Installation

```bash
# Single gateway (Paystack)
pnpm add @porkate/payment @porkate/paystack

# Multiple gateways
pnpm add @porkate/payment @porkate/paystack @porkate/flutterwave @porkate/stripe
```

## Quick Start

### Express - Single Gateway (5 minutes)

```typescript
import { PaymentGatewayManager, Currency } from '@porkate/payment';
import { PaystackGateway } from '@porkate/paystack';

// 1. Setup
const manager = new PaymentGatewayManager({
  gateways: [{
    name: 'paystack',
    config: { secretKey: 'sk_test_xxx', publicKey: 'pk_test_xxx' },
    enabled: true,
  }],
  defaultGateway: 'paystack',
});

manager.registerFactory('paystack', (config) => new PaystackGateway(config));

// 2. Initiate Payment
const result = await manager.getDefaultGateway().initiatePayment({
  amount: { amount: 50000, currency: Currency.NGN },
  customer: { email: 'customer@example.com' },
});

// 3. Redirect user
window.location.href = result.authorizationUrl;

// 4. Verify Payment (after redirect back)
const verified = await manager.getDefaultGateway().verifyPayment({ 
  reference: 'payment_reference' 
});
```

### NestJS - Single Gateway (10 minutes)

```typescript
// payment.module.ts
@Module({
  providers: [{
    provide: 'PAYMENT_GATEWAY',
    useFactory: (config: ConfigService) => new PaystackGateway({
      secretKey: config.get('PAYSTACK_SECRET_KEY'),
      publicKey: config.get('PAYSTACK_PUBLIC_KEY'),
    }),
    inject: [ConfigService],
  }],
})
export class PaymentModule {}

// payment.service.ts
@Injectable()
export class PaymentService {
  constructor(@Inject('PAYMENT_GATEWAY') private gateway: IPaymentGateway) {}
  
  async pay(dto: PaymentDto) {
    return this.gateway.initiatePayment({
      amount: { amount: dto.amount, currency: Currency.NGN },
      customer: { email: dto.email },
    });
  }
}
```

## Common Operations

### Initiate Payment

```typescript
const result = await gateway.initiatePayment({
  amount: { 
    amount: 50000, // 500 NGN in kobo
    currency: Currency.NGN 
  },
  customer: {
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+2348012345678',
  },
  callbackUrl: 'https://myapp.com/callback',
  metadata: { orderId: '12345' },
  description: 'Payment for Order #12345',
});

// Redirect user
if (result.success) {
  window.location.href = result.authorizationUrl;
}
```

### Verify Payment

```typescript
const result = await gateway.verifyPayment({ 
  reference: 'payment_reference' 
});

if (result.success && result.status === PaymentStatus.SUCCESS) {
  // Payment successful - fulfill order
  console.log('Paid:', result.amount);
}
```

### Get Payment Details

```typescript
const result = await gateway.getPayment({ 
  reference: 'payment_reference' 
});

console.log(result);
```

### Refund Payment

```typescript
// Full refund
const result = await gateway.refundPayment({
  reference: 'payment_reference',
  reason: 'Customer requested refund',
});

// Partial refund
const result = await gateway.refundPayment({
  reference: 'payment_reference',
  amount: { amount: 25000, currency: Currency.NGN },
  reason: 'Partial refund for returned items',
});
```

## Multiple Gateways

### Setup

```typescript
const manager = new PaymentGatewayManager({
  gateways: [
    { name: 'paystack', config: {...}, enabled: true, priority: 100 },
    { name: 'flutterwave', config: {...}, enabled: true, priority: 90 },
    { name: 'stripe', config: {...}, enabled: true, priority: 80 },
  ],
  defaultGateway: 'paystack',
  enableFallback: true,
});

// Register all
manager.registerFactory('paystack', (c) => new PaystackGateway(c));
manager.registerFactory('flutterwave', (c) => new FlutterwaveGateway(c));
manager.registerFactory('stripe', (c) => new StripeGateway(c));
```

### Smart Selection

```typescript
// By currency
function selectGateway(currency: Currency): string {
  if (currency === Currency.NGN) return 'paystack';
  if ([Currency.USD, Currency.EUR].includes(currency)) return 'stripe';
  return 'flutterwave';
}

const gatewayName = selectGateway(Currency.NGN);
const gateway = manager.getGateway(gatewayName);
```

### List Gateways

```typescript
const gateways = manager.listGateways();
console.log('Available:', gateways); // ['paystack', 'flutterwave', 'stripe']
```

## Error Handling

```typescript
try {
  const result = await gateway.initiatePayment(request);
  
  if (!result.success) {
    // Business logic error
    console.error('Payment failed:', result.error?.message);
    return;
  }
  
  // Success
  console.log('Payment initiated:', result.reference);
  
} catch (error) {
  // System error
  console.error('System error:', error);
}
```

## Webhooks

```typescript
app.post('/webhooks/payment', (req, res) => {
  const { event, data } = req.body;
  
  // Verify signature
  const signature = req.headers['x-paystack-signature'];
  if (!verifySignature(req.body, signature)) {
    return res.status(401).send();
  }
  
  // Handle events
  switch (event) {
    case 'charge.success':
      await fulfillOrder(data.reference);
      break;
    case 'charge.failed':
      await handleFailure(data.reference);
      break;
  }
  
  res.status(200).send();
});
```

## Testing

### Test Cards

**Paystack:**
- Success: `4084084084084081`
- Declined: `5061004410004`

**Stripe:**
- Success: `4242424242424242`
- Declined: `4000000000000002`

### Test Amounts

For testing different scenarios:
- `50000` kobo = 500 NGN (successful payment)
- Any amount with test cards

## Environment Variables

```bash
# .env
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
NODE_ENV=development
```

## Currency Codes

```typescript
Currency.NGN  // Nigerian Naira
Currency.USD  // US Dollar
Currency.EUR  // Euro
Currency.GBP  // British Pound
Currency.ZAR  // South African Rand
Currency.KES  // Kenyan Shilling
Currency.GHS  // Ghanaian Cedi
```

## Payment Status

```typescript
PaymentStatus.PENDING    // Awaiting payment
PaymentStatus.SUCCESS    // Payment successful
PaymentStatus.FAILED     // Payment failed
PaymentStatus.CANCELLED  // Payment cancelled
```

## API Endpoints Reference

### Single Gateway
- `POST /api/payments/initiate` - Start payment
- `GET /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/:reference` - Get details
- `POST /api/payments/refund` - Refund payment

### Multiple Gateways (Additional)
- `GET /api/payments/gateways` - List gateways
- `POST /api/payments/initiate/:gateway` - Use specific gateway
- `GET /api/payments/gateways/:gateway/health` - Check health

## Common Patterns

### E-commerce Checkout Flow

```typescript
// 1. User clicks "Pay"
const payment = await gateway.initiatePayment({
  amount: { amount: cartTotal, currency: Currency.NGN },
  customer: { email: user.email },
  callbackUrl: `/orders/${orderId}/confirm`,
});

// 2. Save reference
await db.orders.update(orderId, { 
  paymentReference: payment.reference 
});

// 3. Redirect
res.redirect(payment.authorizationUrl);

// 4. On callback
app.get('/orders/:id/confirm', async (req, res) => {
  const order = await db.orders.get(req.params.id);
  const payment = await gateway.verifyPayment({ 
    reference: order.paymentReference 
  });
  
  if (payment.status === PaymentStatus.SUCCESS) {
    await fulfillOrder(order.id);
    res.redirect('/orders/success');
  } else {
    res.redirect('/orders/failed');
  }
});
```

### Subscription Billing

```typescript
// Charge monthly subscription
async function chargeMonthly(subscription) {
  const payment = await gateway.initiatePayment({
    amount: { amount: subscription.plan.price, currency: Currency.NGN },
    customer: { email: subscription.user.email },
    metadata: { 
      type: 'subscription',
      subscriptionId: subscription.id,
    },
  });
  
  // Send payment link via email
  await sendPaymentEmail(subscription.user.email, payment.authorizationUrl);
}
```

## Troubleshooting

### Gateway Not Ready
```typescript
if (!gateway.isReady()) {
  console.error('Gateway not configured properly');
  // Check: API keys, network connection
}
```

### Payment Not Found
```typescript
const result = await gateway.getPayment({ reference });
if (!result.success) {
  // Check: reference is correct, payment was created
}
```

### Webhook Not Received
- Check: webhook URL is accessible
- Verify: webhook signature validation
- Test: using provider's webhook testing tool

## Best Practices

1. ✅ Always verify webhooks signatures
2. ✅ Use HTTPS in production
3. ✅ Store payment references in database
4. ✅ Implement idempotency
5. ✅ Log all transactions
6. ✅ Use environment variables for keys
7. ✅ Test with test keys first
8. ✅ Handle errors gracefully
9. ✅ Monitor payment success rates
10. ✅ Set up alerts for failures

## Support

- Documentation: See [USAGE_GUIDE.md](./USAGE_GUIDE.md)
- Examples: Check `src/` directory
- Issues: GitHub repository

## Links

- Paystack Docs: https://paystack.com/docs
- Flutterwave Docs: https://developer.flutterwave.com
- Stripe Docs: https://stripe.com/docs
