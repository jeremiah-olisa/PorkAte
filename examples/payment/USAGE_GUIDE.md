# @porkate/payment - Complete Usage Guide

This guide provides comprehensive documentation on how to use the `@porkate/payment` library with Express.js and NestJS frameworks, covering both single and multiple gateway scenarios.

## Table of Contents

1. [Overview](#overview)
2. [Single Gateway vs Multiple Gateways](#single-gateway-vs-multiple-gateways)
3. [Express.js Implementation](#expressjs-implementation)
4. [NestJS Implementation](#nestjs-implementation)
5. [Common Use Cases](#common-use-cases)
6. [Best Practices](#best-practices)
7. [Production Checklist](#production-checklist)

---

## Overview

The `@porkate/payment` library provides a unified interface for integrating payment gateways into your application. It follows the adapter pattern, allowing you to:

- Use a single payment gateway with minimal configuration
- Support multiple payment gateways with automatic failover
- Switch between gateways without changing your application code
- Implement custom gateway selection logic

### Supported Gateways

- **Paystack** (`@porkate/paystack`) - Best for Nigerian market (NGN)
- **Flutterwave** (`@porkate/flutterwave`) - Good for African markets
- **Stripe** (`@porkate/stripe`) - Best for international payments (USD, EUR, GBP)

---

## Single Gateway vs Multiple Gateways

### When to Use Single Gateway

✅ **Use single gateway when:**
- You serve a single market (e.g., only Nigeria)
- You have simple payment requirements
- You want minimal configuration
- You trust one provider's uptime
- You're just getting started

**Example Use Cases:**
- Local Nigerian e-commerce store
- SaaS product targeting one country
- MVP or proof of concept
- Small businesses with predictable payment patterns

### When to Use Multiple Gateways

✅ **Use multiple gateways when:**
- You need high availability (99.99%+ uptime)
- You serve multiple markets/currencies
- You want to optimize payment success rates
- You need redundancy for business continuity
- You want to A/B test payment providers

**Example Use Cases:**
- International e-commerce platforms
- Mission-critical payment systems
- Multi-market SaaS products
- High-volume transaction platforms
- Enterprise applications requiring redundancy

---

## Express.js Implementation

### Single Gateway Setup

#### 1. Installation

```bash
npm install @porkate/payment @porkate/paystack
# or
pnpm add @porkate/payment @porkate/paystack
```

#### 2. Basic Configuration

```typescript
import express from 'express';
import { PaymentGatewayManager, Currency } from '@porkate/payment';
import { PaystackConfig, PaystackGateway } from '@porkate/paystack';

const app = express();
app.use(express.json());

// Initialize gateway manager
const paymentManager = new PaymentGatewayManager<PaystackConfig>({
  gateways: [
    {
      name: 'paystack',
      config: {
        secretKey: process.env.PAYSTACK_SECRET_KEY,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY,
        debug: process.env.NODE_ENV === 'development',
      },
      enabled: true,
    },
  ],
  defaultGateway: 'paystack',
  enableFallback: false,
});

// Register gateway factory
paymentManager.registerFactory<PaystackConfig>('paystack', (config) => {
  return new PaystackGateway(config);
});
```

#### 3. Create Payment Endpoint

```typescript
app.post('/api/payments/initiate', async (req, res) => {
  try {
    const gateway = paymentManager.getDefaultGateway();
    
    const result = await gateway.initiatePayment({
      amount: {
        amount: req.body.amount, // Amount in kobo
        currency: Currency.NGN,
      },
      customer: {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      },
      callbackUrl: req.body.callbackUrl,
      metadata: req.body.metadata,
    });

    if (result.success) {
      res.json({
        success: true,
        reference: result.reference,
        authorizationUrl: result.authorizationUrl,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error?.message,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

#### 4. Verify Payment Endpoint

```typescript
app.get('/api/payments/verify/:reference', async (req, res) => {
  try {
    const gateway = paymentManager.getDefaultGateway();
    
    const result = await gateway.verifyPayment({ 
      reference: req.params.reference 
    });

    if (result.success) {
      res.json({
        success: true,
        status: result.status,
        amount: result.amount,
        paidAt: result.paidAt,
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Multiple Gateways Setup

#### 1. Installation

```bash
npm install @porkate/payment @porkate/paystack @porkate/flutterwave @porkate/stripe
```

#### 2. Advanced Configuration

```typescript
import { PaymentGatewayManager, Currency } from '@porkate/payment';
import { PaystackGateway } from '@porkate/paystack';
import { FlutterwaveGateway } from '@porkate/flutterwave';
import { StripeGateway } from '@porkate/stripe';

const paymentManager = new PaymentGatewayManager({
  gateways: [
    {
      name: 'paystack',
      config: {
        secretKey: process.env.PAYSTACK_SECRET_KEY,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY,
        debug: true,
      },
      enabled: true,
      priority: 100, // Highest priority
    },
    {
      name: 'flutterwave',
      config: {
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
        publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
        debug: true,
      },
      enabled: true,
      priority: 90, // Fallback
    },
    {
      name: 'stripe',
      config: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publicKey: process.env.STRIPE_PUBLIC_KEY,
        debug: true,
      },
      enabled: true,
      priority: 80, // Last resort
    },
  ],
  defaultGateway: 'paystack',
  enableFallback: true, // ⚠️ Enable automatic failover
});

// Register all gateways
paymentManager.registerFactory('paystack', (config) => new PaystackGateway(config));
paymentManager.registerFactory('flutterwave', (config) => new FlutterwaveGateway(config));
paymentManager.registerFactory('stripe', (config) => new StripeGateway(config));
```

#### 3. Smart Gateway Selection

```typescript
// Helper function for currency-based selection
function selectGatewayByCurrency(currency: Currency): string {
  switch (currency) {
    case Currency.NGN:
      return 'paystack'; // Best for Naira
    case Currency.USD:
    case Currency.EUR:
    case Currency.GBP:
      return 'stripe'; // Best for international
    default:
      return 'flutterwave'; // Good for African markets
  }
}

// Use in endpoint
app.post('/api/payments/initiate', async (req, res) => {
  const currency = req.body.currency || Currency.NGN;
  const gatewayName = selectGatewayByCurrency(currency);
  
  const gateway = paymentManager.getGateway(gatewayName);
  // ... proceed with payment
});
```

#### 4. Automatic Failover

```typescript
app.post('/api/payments/initiate', async (req, res) => {
  const gateways = ['paystack', 'flutterwave', 'stripe'];
  
  for (const gatewayName of gateways) {
    try {
      const gateway = paymentManager.getGateway(gatewayName);
      
      const result = await gateway.initiatePayment({
        // ... payment details
      });
      
      if (result.success) {
        return res.json({ 
          success: true, 
          gateway: gatewayName,
          ...result 
        });
      }
    } catch (error) {
      console.warn(`Gateway ${gatewayName} failed, trying next...`);
      continue; // Try next gateway
    }
  }
  
  res.status(500).json({ error: 'All gateways failed' });
});
```

---

## NestJS Implementation

### Single Gateway Setup

#### 1. Installation

```bash
npm install @nestjs/common @nestjs/core @nestjs/config
npm install @porkate/payment @porkate/paystack
npm install class-validator class-transformer
```

#### 2. Payment Module

```typescript
// payment.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaystackGateway } from '@porkate/paystack';
import { IPaymentGateway } from '@porkate/payment';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [
    {
      provide: 'PAYMENT_GATEWAY',
      useFactory: (configService: ConfigService): IPaymentGateway => {
        return new PaystackGateway({
          secretKey: configService.get('PAYSTACK_SECRET_KEY'),
          publicKey: configService.get('PAYSTACK_PUBLIC_KEY'),
          debug: configService.get('NODE_ENV') === 'development',
        });
      },
      inject: [ConfigService],
    },
    PaymentService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
```

#### 3. Payment Service

```typescript
// payment.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { IPaymentGateway, Currency } from '@porkate/payment';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PAYMENT_GATEWAY')
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async initiatePayment(dto: InitiatePaymentDto) {
    return this.paymentGateway.initiatePayment({
      amount: {
        amount: dto.amount,
        currency: dto.currency as Currency,
      },
      customer: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      callbackUrl: dto.callbackUrl,
      metadata: dto.metadata,
    });
  }

  async verifyPayment(reference: string) {
    return this.paymentGateway.verifyPayment({ reference });
  }
}
```

#### 4. Payment Controller

```typescript
// payment.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(dto);
  }

  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.paymentService.verifyPayment(reference);
  }
}
```

### Multiple Gateways Setup

#### 1. Gateway Manager Service

```typescript
// gateway-manager.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGatewayManager, Currency } from '@porkate/payment';
import { PaystackGateway } from '@porkate/paystack';
import { FlutterwaveGateway } from '@porkate/flutterwave';
import { StripeGateway } from '@porkate/stripe';

@Injectable()
export class GatewayManagerService {
  private readonly manager: PaymentGatewayManager;

  constructor(private configService: ConfigService) {
    this.manager = new PaymentGatewayManager({
      gateways: [
        {
          name: 'paystack',
          config: {
            secretKey: this.configService.get('PAYSTACK_SECRET_KEY'),
            publicKey: this.configService.get('PAYSTACK_PUBLIC_KEY'),
          },
          enabled: true,
          priority: 100,
        },
        {
          name: 'flutterwave',
          config: {
            secretKey: this.configService.get('FLUTTERWAVE_SECRET_KEY'),
            publicKey: this.configService.get('FLUTTERWAVE_PUBLIC_KEY'),
          },
          enabled: true,
          priority: 90,
        },
        {
          name: 'stripe',
          config: {
            secretKey: this.configService.get('STRIPE_SECRET_KEY'),
            publicKey: this.configService.get('STRIPE_PUBLIC_KEY'),
          },
          enabled: true,
          priority: 80,
        },
      ],
      defaultGateway: 'paystack',
      enableFallback: true,
    });

    this.registerGateways();
  }

  private registerGateways() {
    this.manager.registerFactory('paystack', (config) => new PaystackGateway(config));
    this.manager.registerFactory('flutterwave', (config) => new FlutterwaveGateway(config));
    this.manager.registerFactory('stripe', (config) => new StripeGateway(config));
  }

  getGateway(name?: string) {
    return name 
      ? this.manager.getGateway(name)
      : this.manager.getDefaultGateway();
  }

  listGateways() {
    return this.manager.listGateways();
  }
}
```

#### 2. Enhanced Payment Service

```typescript
// payment.service.ts (with multiple gateways)
import { Injectable } from '@nestjs/common';
import { GatewayManagerService } from './gateway-manager.service';
import { Currency } from '@porkate/payment';

@Injectable()
export class PaymentService {
  constructor(private gatewayManager: GatewayManagerService) {}

  async initiatePayment(dto: InitiatePaymentDto) {
    // Select gateway based on currency
    const gatewayName = this.selectGatewayByCurrency(dto.currency);
    const gateway = this.gatewayManager.getGateway(gatewayName);

    return gateway.initiatePayment({
      amount: {
        amount: dto.amount,
        currency: dto.currency as Currency,
      },
      customer: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      callbackUrl: dto.callbackUrl,
      metadata: {
        ...dto.metadata,
        gateway: gatewayName,
      },
    });
  }

  private selectGatewayByCurrency(currency: Currency): string {
    switch (currency) {
      case Currency.NGN:
        return 'paystack';
      case Currency.USD:
      case Currency.EUR:
      case Currency.GBP:
        return 'stripe';
      default:
        return 'flutterwave';
    }
  }
}
```

---

## Common Use Cases

### Use Case 1: E-commerce Checkout

```typescript
// Customer clicks "Pay Now"
const paymentResult = await gateway.initiatePayment({
  amount: { amount: orderTotal, currency: Currency.NGN },
  customer: { email: customer.email },
  callbackUrl: `https://mystore.com/orders/${orderId}/confirm`,
  metadata: { orderId, items: cart.items },
});

// Redirect customer to payment page
window.location.href = paymentResult.authorizationUrl;
```

### Use Case 2: Subscription Billing

```typescript
// Monthly subscription charge
async function chargeSubscription(subscription: Subscription) {
  const result = await gateway.initiatePayment({
    amount: { 
      amount: subscription.plan.price, 
      currency: Currency.NGN 
    },
    customer: {
      email: subscription.user.email,
    },
    metadata: {
      subscriptionId: subscription.id,
      planId: subscription.plan.id,
      billingCycle: 'monthly',
    },
  });

  // Save payment reference
  await savePaymentReference(subscription.id, result.reference);
}
```

### Use Case 3: Marketplace Split Payments

```typescript
// Split payment between platform and vendor
const result = await gateway.initiatePayment({
  amount: { amount: orderTotal, currency: Currency.NGN },
  customer: { email: buyer.email },
  metadata: {
    orderId,
    vendorId: vendor.id,
    platformFee: calculatePlatformFee(orderTotal),
    vendorAmount: calculateVendorAmount(orderTotal),
  },
});
```

### Use Case 4: International Payments

```typescript
// Detect customer location and select gateway
const gateway = customer.country === 'NG' 
  ? paymentManager.getGateway('paystack')
  : paymentManager.getGateway('stripe');

const result = await gateway.initiatePayment({
  amount: { 
    amount: convertToSmallestUnit(price, currency),
    currency: currency,
  },
  customer: { email: customer.email },
});
```

---

## Best Practices

### 1. Error Handling

```typescript
try {
  const result = await gateway.initiatePayment(request);
  
  if (!result.success) {
    // Handle business logic error
    logger.warn('Payment initiation failed', result.error);
    return res.status(400).json({ error: result.error.message });
  }
  
  // Success
  return res.json(result);
} catch (error) {
  // Handle system error
  logger.error('Payment system error', error);
  return res.status(500).json({ error: 'Payment system unavailable' });
}
```

### 2. Idempotency

```typescript
// Use unique reference to prevent duplicate payments
const reference = generateUniqueReference(orderId);

const result = await gateway.initiatePayment({
  reference, // Provide your own reference
  amount: { amount: 50000, currency: Currency.NGN },
  customer: { email: 'customer@example.com' },
});
```

### 3. Webhook Verification

```typescript
app.post('/webhooks/payment', async (req, res) => {
  // Verify webhook signature (example for Paystack)
  const signature = req.headers['x-paystack-signature'];
  
  if (!verifySignature(req.body, signature, SECRET_KEY)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook
  const { event, data } = req.body;
  
  switch (event) {
    case 'charge.success':
      await handleSuccessfulPayment(data);
      break;
    case 'charge.failed':
      await handleFailedPayment(data);
      break;
  }

  res.status(200).json({ status: 'received' });
});
```

### 4. Logging and Monitoring

```typescript
// Log all payment operations
logger.info('Payment initiated', {
  reference: result.reference,
  amount: request.amount,
  gateway: gateway.getGatewayName(),
  customer: request.customer.email,
  timestamp: new Date().toISOString(),
});

// Monitor success rates
metrics.increment('payment.initiated', {
  gateway: gateway.getGatewayName(),
  currency: request.amount.currency,
});
```

### 5. Testing

```typescript
// Use test mode in development
const gateway = new PaystackGateway({
  secretKey: process.env.NODE_ENV === 'production'
    ? process.env.PAYSTACK_SECRET_KEY
    : process.env.PAYSTACK_TEST_SECRET_KEY,
  debug: process.env.NODE_ENV !== 'production',
});

// Use test cards
const testCards = {
  success: '4084084084084081',
  declined: '5061004410004',
  insufficientFunds: '5060666666666666666',
};
```

---

## Production Checklist

### Before Going Live

- [ ] **Environment Variables**
  - [ ] Use production API keys
  - [ ] Secure sensitive credentials
  - [ ] Use secret management service (AWS Secrets Manager, etc.)

- [ ] **Error Handling**
  - [ ] Implement retry logic with exponential backoff
  - [ ] Set up error monitoring (Sentry, Rollbar)
  - [ ] Create fallback mechanisms

- [ ] **Logging**
  - [ ] Log all transactions
  - [ ] Implement structured logging
  - [ ] Set up log aggregation (ELK, CloudWatch)

- [ ] **Monitoring**
  - [ ] Set up APM (Application Performance Monitoring)
  - [ ] Create dashboards for payment metrics
  - [ ] Configure alerts for failures

- [ ] **Security**
  - [ ] Verify webhook signatures
  - [ ] Use HTTPS only
  - [ ] Implement rate limiting
  - [ ] Sanitize user inputs

- [ ] **Testing**
  - [ ] Test all payment flows
  - [ ] Test webhook handlers
  - [ ] Load test payment endpoints
  - [ ] Test failover scenarios

- [ ] **Documentation**
  - [ ] Document payment flow
  - [ ] Create runbooks for common issues
  - [ ] Document webhook events

- [ ] **Compliance**
  - [ ] Ensure PCI DSS compliance (if handling cards)
  - [ ] Implement data privacy measures
  - [ ] Set up audit logs

---

## Conclusion

This guide covers the essential patterns for integrating payment gateways into your Express.js or NestJS application. Choose single gateway for simplicity or multiple gateways for high availability and multi-market support.

For more details, see:
- [Express Single Gateway Example](./src/express-single-gateway.ts)
- [Express Multiple Gateways Example](./src/express-multiple-gateways.ts)
- [NestJS Single Gateway Example](./src/nestjs-single-gateway/)
- [NestJS Multiple Gateways Example](./src/nestjs-multiple-gateways/)
