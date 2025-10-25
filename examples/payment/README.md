# @porkate/payment Examples

This directory contains comprehensive examples demonstrating how to use the `@porkate/payment` library with different frameworks and configurations.

## Table of Contents

- [Overview](#overview)
- [Use Cases](#use-cases)
- [Examples](#examples)
  - [Basic Examples](#basic-examples)
  - [Express API Examples](#express-api-examples)
  - [NestJS Examples](#nestjs-examples)
- [Getting Started](#getting-started)
- [Configuration](#configuration)

## Overview

The `@porkate/payment` library provides a unified interface for integrating multiple payment gateways into your application. It supports:

- **Single Gateway**: Use one payment provider (e.g., Paystack)
- **Multiple Gateways**: Support multiple payment providers with automatic failover
- **Factory Pattern**: Easy registration and management of payment adapters
- **Type Safety**: Full TypeScript support with proper typing

## Use Cases

### 1. Single Payment Gateway
Perfect for applications that:
- Use only one payment provider
- Have simple payment requirements
- Want minimal configuration overhead

**Example**: A local Nigerian business using only Paystack.

### 2. Multiple Payment Gateways
Ideal for applications that:
- Need redundancy and high availability
- Serve multiple markets (different payment preferences)
- Want to route payments based on business logic
- Need automatic failover when one gateway is down

**Example**: An international e-commerce platform supporting Paystack (Nigeria), Flutterwave (Africa), and Stripe (Global).

### 3. Dynamic Gateway Selection
For applications that:
- Let users choose their preferred payment method
- Route based on transaction amount, currency, or customer location
- Implement A/B testing for payment conversion optimization

## Examples

### Basic Examples

#### Paystack Gateway (Direct Usage)
- **File**: `src/paystack-example.ts`
- **Description**: Direct usage of Paystack gateway without manager
- **Use Case**: Simple, single-provider integration

#### Gateway Manager (Basic)
- **File**: `src/gateway-manager-example.ts`
- **Description**: Basic PaymentGatewayManager usage
- **Use Case**: Introduction to the manager pattern

### Express API Examples

#### Single Adapter
- **File**: `src/express-single-gateway.ts`
- **Description**: RESTful API with Paystack integration
- **Use Case**: Simple payment API with one provider
- **Features**:
  - Payment initialization endpoint
  - Payment verification endpoint
  - Refund processing
  - Error handling middleware

#### Multiple Adapters
- **File**: `src/express-multiple-gateways.ts`
- **Description**: RESTful API with multiple payment gateways
- **Use Case**: High availability payment system with automatic failover
- **Features**:
  - Support for Paystack, Flutterwave, and Stripe
  - Automatic failover when primary gateway fails
  - Gateway selection endpoint
  - Provider health checking
  - Smart routing based on currency

### NestJS Examples

#### Single Adapter
- **Directory**: `src/nestjs-single-gateway/`
- **Description**: NestJS module with Paystack integration
- **Use Case**: Type-safe payment integration in NestJS applications
- **Features**:
  - Payment module with service and controller
  - Configuration module integration
  - Dependency injection
  - Exception filters
  - Swagger/OpenAPI documentation

#### Multiple Adapters
- **Directory**: `src/nestjs-multiple-gateways/`
- **Description**: NestJS module with multiple payment gateways
- **Use Case**: Enterprise-grade payment system with provider selection
- **Features**:
  - Dynamic gateway registration
  - Strategy pattern for gateway selection
  - Health checks for all gateways
  - Event-driven architecture
  - Transaction logging and monitoring

## Getting Started

### Prerequisites

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in this directory:

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Flutterwave (for multiple gateway examples)
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxx

# Stripe (for multiple gateway examples)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Application
PORT=3000
NODE_ENV=development
```

### Running Examples

```bash
# Basic Examples
pnpm paystack                    # Run Paystack direct example
pnpm gateway-manager             # Run gateway manager example

# Express Examples - Single Gateway
pnpm express:single              # Run Express API with single gateway (Paystack)

# Express Examples - Multiple Gateways
pnpm express:multiple            # Run Express API with multiple gateways

# NestJS Examples
pnpm nest:start                  # Run NestJS application (single gateway)
pnpm nest:dev                    # Run NestJS with watch mode
```

**Detailed Commands:**

```bash
# Paystack Direct Usage
pnpm paystack
# Demonstrates direct usage of Paystack gateway without manager

# Gateway Manager Basic
pnpm gateway-manager
# Shows basic PaymentGatewayManager usage

# Express Single Gateway (runs on port 3000)
pnpm express:single
# RESTful API with Paystack integration
# Available at: http://localhost:3000

# Express Multiple Gateways (runs on port 3000)
pnpm express:multiple
# RESTful API with Paystack, Flutterwave, and Stripe
# Available at: http://localhost:3000

# NestJS Single Gateway (runs on port 3000)
pnpm nest:start
# NestJS application with Paystack
# API docs: http://localhost:3000/api
# Available at: http://localhost:3000

# NestJS with Watch Mode
pnpm nest:dev
# Auto-restarts on file changes
```

## Configuration

### Single Gateway Configuration

```typescript
const paymentManager = new PaymentGatewayManager<PaystackConfig>({
  gateways: [
    {
      name: 'paystack',
      config: {
        secretKey: process.env.PAYSTACK_SECRET_KEY,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY,
        debug: true,
      },
      enabled: true,
    },
  ],
  defaultGateway: 'paystack',
  enableFallback: false,
});
```

### Multiple Gateway Configuration

```typescript
const paymentManager = new PaymentGatewayManager({
  gateways: [
    {
      name: 'paystack',
      config: { /* Paystack config */ },
      enabled: true,
      priority: 100, // Highest priority
    },
    {
      name: 'flutterwave',
      config: { /* Flutterwave config */ },
      enabled: true,
      priority: 90, // Fallback option
    },
    {
      name: 'stripe',
      config: { /* Stripe config */ },
      enabled: true,
      priority: 80, // Last resort
    },
  ],
  defaultGateway: 'paystack',
  enableFallback: true, // Enable automatic failover
});
```

## API Endpoints

All examples expose the following REST endpoints:

### Common Endpoints
- `POST /api/payments/initiate` - Initialize a payment
- `GET /api/payments/verify/:reference` - Verify a payment
- `GET /api/payments/:reference` - Get payment details
- `POST /api/payments/refund` - Refund a payment
- `POST /api/payments/cancel` - Cancel a pending payment

### Multiple Gateway Examples Only
- `GET /api/payments/gateways` - List available gateways
- `POST /api/payments/initiate/:gateway` - Use a specific gateway
- `GET /api/payments/gateways/:gateway/health` - Check gateway health

## Testing

Use the provided test scripts to interact with the APIs:

```bash
# Test payment initiation
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "NGN",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "callbackUrl": "https://yourapp.com/callback"
  }'

# Test payment verification
curl http://localhost:3000/api/payments/verify/PAYMENT_REFERENCE

# Test with specific gateway (multiple gateway examples)
curl -X POST http://localhost:3000/api/payments/initiate/stripe \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## Test Cards

### Paystack Test Cards
- **Successful Payment**: 4084084084084081
- **Insufficient Funds**: 5060666666666666666
- **Declined**: 5061004410004

### Flutterwave Test Cards
- **Successful Payment**: 4242424242424242
- **Declined**: 4000000000000002

### Stripe Test Cards
- **Successful Payment**: 4242424242424242
- **Declined**: 4000000000000002
- **Requires Authentication**: 4000002500003155

## Best Practices

1. **Always use environment variables** for sensitive credentials
2. **Implement proper error handling** for payment failures
3. **Log all payment transactions** for audit purposes
4. **Use webhooks** for real-time payment notifications
5. **Implement idempotency** to prevent duplicate payments
6. **Test in sandbox mode** before going to production
7. **Set up monitoring** for payment gateway availability
8. **Implement retry logic** with exponential backoff
9. **Store payment references** in your database
10. **Validate webhook signatures** to prevent fraud

## Additional Resources

- [Payment Gateway Manager Guide](../../packages/payment/core/docs/GATEWAY-MANAGER-GUIDE.md)
- [Paystack Documentation](https://paystack.com/docs)
- [Flutterwave Documentation](https://developer.flutterwave.com)
- [Stripe Documentation](https://stripe.com/docs)

## License

MIT

## Notes

- The examples use test keys and test mode
- Always verify payments on your backend
- Store payment references for reconciliation
- Use webhooks for real-time payment updates

## Resources

- [Paystack Documentation](https://paystack.com/docs/)
- [@porkate/payment Core Documentation](../../packages/standalone/@porkate-payment/core/README.md)
- [@porkate/paystack Documentation](../../packages/standalone/@porkate-payment/paystack/README.md)
