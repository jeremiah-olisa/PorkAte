# Multiple Payment Gateways Example

This example demonstrates how to integrate and manage multiple payment gateways in a NestJS application using the PorkAte Payment Gateway Manager.

## 🚀 Features Demonstrated

- **Multiple Gateway Support**: Paystack, Flutterwave, and Stripe
- **Automatic Failover**: Seamless fallback when primary gateway fails
- **Smart Routing**: Currency-based gateway selection
- **Manual Selection**: Allow users to choose their preferred gateway
- **Health Monitoring**: Real-time gateway status checking
- **Unified API**: Single interface for all payment operations

## 📋 Prerequisites

Set up your environment variables for the payment gateways you want to use:

```bash
# Paystack (Primary gateway - best for NGN)
export PAYSTACK_SECRET_KEY=sk_test_xxxxx
export PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# Flutterwave (Fallback - good for African markets)
export FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx

# Stripe (International - best for USD, EUR, GBP)
export STRIPE_SECRET_KEY=sk_test_xxxxx
```

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Import the Module**
   Add the `MultipleGatewaysModule` to your main app module:

   ```typescript
   import { Module } from '@nestjs/common';
   import { MultipleGatewaysModule } from './payment/multiple/multiple-gateways.module';

   @Module({
     imports: [
       // ... other modules
       MultipleGatewaysModule,
     ],
   })
   export class AppModule {}
   ```

## 🎯 API Endpoints

### Health Check
```http
GET /api/payments/multiple/health
```
Check the health status of all configured gateways.

### List Gateways
```http
GET /api/payments/multiple/gateways
```
Get information about all available gateways and their status.

### Initiate Payment (Auto-selection)
```http
POST /api/payments/multiple/initiate
Content-Type: application/json

{
  "amount": 5000,
  "currency": "NGN",
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "description": "Payment for order #123",
  "metadata": {
    "orderId": "123",
    "userId": "456"
  }
}
```
Automatically selects the best gateway based on currency and availability.

### Initiate Payment (Specific Gateway)
```http
POST /api/payments/multiple/initiate-with-gateway?gateway=paystack
Content-Type: application/json

{
  "amount": 5000,
  "currency": "NGN",
  "email": "customer@example.com"
}
```
Force the use of a specific gateway (useful for testing).

### Verify Payment
```http
GET /api/payments/multiple/verify/{reference}
```
Verify a payment using any of the configured gateways.

### Get Payment Details
```http
GET /api/payments/multiple/{reference}
```
Retrieve payment details from any gateway.

## 🎨 Gateway Selection Logic

The service automatically selects the best gateway using this priority:

1. **Preferred Gateway**: If specified by the user
2. **Currency-Based**: Based on payment currency
   - NGN → Paystack
   - USD/EUR/GBP → Stripe
   - Others → Flutterwave
3. **Default Gateway**: Paystack (if available)
4. **Fallback**: Any available healthy gateway

## 🔧 Configuration

The gateways are configured with priorities:

- **Paystack**: Priority 100 (Primary)
- **Flutterwave**: Priority 90 (Fallback)
- **Stripe**: Priority 80 (Last resort)

You can modify priorities and add more gateways in `multiple-gateways.module.ts`.

## 🧪 Testing

1. **Start the server**:
   ```bash
   pnpm run start:dev
   ```

2. **Test health check**:
   ```bash
   curl http://localhost:3000/api/payments/multiple/health
   ```

3. **Test payment initiation**:
   ```bash
   curl -X POST http://localhost:3000/api/payments/multiple/initiate \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 1000,
       "currency": "NGN",
       "email": "test@example.com",
       "description": "Test payment"
     }'
   ```

## 🚨 Error Handling

The service includes comprehensive error handling:

- **Gateway Failures**: Automatic fallback to other gateways
- **Configuration Errors**: Clear error messages for missing keys
- **Network Issues**: Timeout handling and retries
- **Validation**: Input validation with helpful error messages

## 📈 Monitoring

Use the health endpoint to monitor gateway status:

```typescript
const health = await fetch('/api/payments/multiple/health');
const status = await health.json();

console.log(`Healthy gateways: ${status.data.healthyGateways}/${status.data.totalGateways}`);
```

## 🎉 Benefits

- **High Availability**: Never fail due to single gateway issues
- **Cost Optimization**: Use cheapest gateway per currency
- **User Experience**: Fast payments with automatic optimization
- **Developer Experience**: Single API for multiple providers
- **Scalability**: Easy to add new gateways

This example shows how to build robust, production-ready payment systems that can handle multiple providers seamlessly!