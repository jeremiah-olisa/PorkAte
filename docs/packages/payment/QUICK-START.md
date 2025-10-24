# Payment Gateway Quick Start

Get started with the PorkAte payment system in minutes.

## Installation

```bash
# Install core and Paystack adapter
pnpm add @porkate/payment @porkate/paystack

# Or with npm
npm install @porkate/payment @porkate/paystack
```

## Quick Example

```typescript
import { PaystackGateway } from '@porkate/paystack';
import { createMoney, Currency, PaymentStatus } from '@porkate/payment';

// 1. Initialize the gateway
const gateway = new PaystackGateway({
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
});

// 2. Create a payment
const payment = await gateway.initiatePayment({
  amount: createMoney(5000, Currency.NGN), // 5,000 Naira
  customer: {
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  callbackUrl: 'https://yourapp.com/payment/callback',
});

// 3. Redirect user to payment page
if (payment.success) {
  // Send user to: payment.authorizationUrl
  console.log('Payment URL:', payment.authorizationUrl);
  console.log('Reference:', payment.reference);
}

// 4. Verify payment (after user returns)
const verification = await gateway.verifyPayment({
  reference: payment.reference,
});

if (verification.success && verification.status === PaymentStatus.SUCCESS) {
  console.log('Payment successful! ✅');
  console.log('Amount:', verification.amount);
  console.log('Customer:', verification.customer);
  // Fulfill the order...
}
```

## Express.js Integration

```typescript
import express from 'express';
import { PaystackGateway } from '@porkate/paystack';
import { createMoney, Currency, PaymentStatus } from '@porkate/payment';

const app = express();
const gateway = new PaystackGateway({
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
});

// Initiate payment
app.post('/api/payment/initiate', async (req, res) => {
  try {
    const { amount, email } = req.body;

    const payment = await gateway.initiatePayment({
      amount: createMoney(amount, Currency.NGN),
      customer: { email },
      callbackUrl: `${process.env.APP_URL}/payment/callback`,
      metadata: {
        user_id: req.user?.id,
        order_id: req.body.order_id,
      },
    });

    if (payment.success) {
      // Save payment reference to database
      await db.savePaymentReference(payment.reference, req.body.order_id);

      res.json({
        success: true,
        authorization_url: payment.authorizationUrl,
        reference: payment.reference,
      });
    } else {
      res.status(400).json({
        success: false,
        error: payment.error,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// Payment callback
app.get('/payment/callback', async (req, res) => {
  try {
    const { reference } = req.query;

    const verification = await gateway.verifyPayment({
      reference: reference as string,
    });

    if (verification.success && verification.status === PaymentStatus.SUCCESS) {
      // Update order status in database
      await db.updateOrderStatus(reference, 'paid');
      res.redirect('/payment/success');
    } else {
      res.redirect('/payment/failed');
    }
  } catch (error) {
    res.redirect('/payment/error');
  }
});

// Webhook endpoint (for real-time updates)
app.post('/api/webhooks/paystack', async (req, res) => {
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference } = event.data;
      // Update order status
      await db.updateOrderStatus(reference, 'paid');
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});
```

## NestJS Integration

```typescript
import { Injectable } from '@nestjs/common';
import { PaystackGateway } from '@porkate/paystack';
import { createMoney, Currency } from '@porkate/payment';

@Injectable()
export class PaymentService {
  private gateway: PaystackGateway;

  constructor() {
    this.gateway = new PaystackGateway({
      secretKey: process.env.PAYSTACK_SECRET_KEY!,
    });
  }

  async initiatePayment(amount: number, email: string, orderId: string) {
    return this.gateway.initiatePayment({
      amount: createMoney(amount, Currency.NGN),
      customer: { email },
      callbackUrl: `${process.env.APP_URL}/payment/callback`,
      metadata: { order_id: orderId },
    });
  }

  async verifyPayment(reference: string) {
    return this.gateway.verifyPayment({ reference });
  }

  async refundPayment(reference: string, reason: string) {
    return this.gateway.refundPayment({ reference, reason });
  }
}

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('initiate')
  async initiate(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(
      dto.amount,
      dto.email,
      dto.orderId,
    );
  }

  @Get('verify/:reference')
  async verify(@Param('reference') reference: string) {
    return this.paymentService.verifyPayment(reference);
  }
}
```

## Environment Variables

Create a `.env` file:

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# App
APP_URL=http://localhost:3000
```

## Common Operations

### Check Payment Status

```typescript
const payment = await gateway.getPayment({ reference: 'PAY_123' });
console.log('Status:', payment.status);
console.log('Amount:', payment.amount);
```

### Process Refund

```typescript
const refund = await gateway.refundPayment({
  reference: 'PAY_123',
  reason: 'Customer request',
});

if (refund.success) {
  console.log('Refunded:', refund.amount);
}
```

### Handle Errors

```typescript
const payment = await gateway.initiatePayment(request);

if (!payment.success) {
  switch (payment.error?.code) {
    case 'PAYSTACK_API_ERROR':
      // Handle API errors
      break;
    case 'PAYSTACK_CONFIG_ERROR':
      // Handle config errors
      break;
    default:
      // Handle other errors
      break;
  }
}
```

## Best Practices

1. **Always verify on backend** - Never trust frontend verification
2. **Store references** - Save payment references to your database
3. **Use webhooks** - Implement webhooks for real-time updates
4. **Handle errors** - Always check the `success` flag
5. **Test thoroughly** - Use test keys and test cards
6. **Use metadata** - Store relevant data in payment metadata
7. **Log transactions** - Keep audit trails of all payment operations

## Test Mode

### Test Keys
Use test keys for development:
- Secret: `sk_test_xxxxxxxxxxxxx`
- Public: `pk_test_xxxxxxxxxxxxx`

### Test Cards
- **Success**: 4084084084084081
- **Insufficient Funds**: 5060666666666666666
- **Declined**: 5061004410004

## Next Steps

- [Full Documentation](./IMPLEMENTATION.md)
- [API Reference](../../@porkate-payment/core/README.md)
- [Paystack Guide](../../@porkate-payment/paystack/README.md)
- [Examples](../../../examples/payment/README.md)

## Support

- GitHub Issues: [porkate/issues](https://github.com/jeremiah-olisa/porkate--pocket-/issues)
- Documentation: [docs/packages/payment/](.)

## License

MIT
