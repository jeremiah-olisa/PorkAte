# NestJS Single Payment Gateway Example

This example demonstrates how to integrate a single payment gateway (Paystack) into a NestJS application using dependency injection and modular architecture.

## Use Case

- Type-safe payment integration in NestJS applications
- Single payment provider (Paystack)
- Clean architecture with services, controllers, and modules
- Exception filtering and validation
- Swagger/OpenAPI documentation

## Features

- **Payment Module**: Self-contained module with all payment functionality
- **Payment Service**: Business logic for payment operations
- **Payment Controller**: REST API endpoints with validation
- **Exception Filter**: Custom error handling for payment errors
- **DTOs**: Type-safe request/response validation with class-validator
- **Swagger Documentation**: Auto-generated API documentation

## Structure

```
src/nestjs-single-gateway/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── config/
│   └── payment.config.ts      # Payment configuration
├── payment/
│   ├── payment.module.ts      # Payment module
│   ├── payment.service.ts     # Payment business logic
│   ├── payment.controller.ts  # REST API endpoints
│   ├── dto/
│   │   ├── initiate-payment.dto.ts
│   │   ├── verify-payment.dto.ts
│   │   └── refund-payment.dto.ts
│   └── filters/
│       └── payment-exception.filter.ts
└── README.md
```

## Installation

```bash
npm install --save @nestjs/common @nestjs/core @nestjs/platform-express
npm install --save @nestjs/config @nestjs/swagger
npm install --save class-validator class-transformer
npm install --save @porkate/payment @porkate/paystack
```

## Configuration

Create a `.env` file:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
NODE_ENV=development
PORT=3000
```

## Running

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

All endpoints are prefixed with `/api/payments`:

- `POST /api/payments/initiate` - Initialize a payment
- `GET /api/payments/verify/:reference` - Verify a payment
- `GET /api/payments/:reference` - Get payment details
- `POST /api/payments/refund` - Refund a payment

Swagger documentation available at: `http://localhost:3000/api`

## Example Usage

### Initialize Payment

```bash
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
```

### Verify Payment

```bash
curl http://localhost:3000/api/payments/verify/PAYMENT_REFERENCE
```

## Key Concepts

### Dependency Injection

The `PaymentService` is injected into the controller, making it easy to test and maintain:

```typescript
@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
}
```

### Configuration

Payment configuration is managed through NestJS's ConfigModule:

```typescript
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: 'PAYMENT_GATEWAY',
      useFactory: (configService: ConfigService) => {
        return new PaystackGateway({
          secretKey: configService.get('PAYSTACK_SECRET_KEY'),
          publicKey: configService.get('PAYSTACK_PUBLIC_KEY'),
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class PaymentModule {}
```

### Validation

DTOs with class-validator ensure type safety:

```typescript
export class InitiatePaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEmail()
  email: string;
  
  // ... more fields
}
```

### Exception Handling

Custom exception filter for payment-specific errors:

```typescript
@Catch(PaymentException)
export class PaymentExceptionFilter implements ExceptionFilter {
  catch(exception: PaymentException, host: ArgumentsHost) {
    // Handle payment errors gracefully
  }
}
```

## Best Practices

1. **Use environment variables** for configuration
2. **Implement validation** with DTOs and class-validator
3. **Handle exceptions** with custom filters
4. **Document APIs** with Swagger decorators
5. **Use dependency injection** for testability
6. **Log all transactions** for audit trail
7. **Implement webhooks** for real-time notifications

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

# NestJS Multiple Payment Gateways Example

This example demonstrates how to integrate multiple payment gateways (Paystack, Flutterwave, Stripe) into a NestJS application with:
- Dynamic gateway registration
- Automatic failover
- Gateway selection strategy
- Health monitoring
- Event-driven architecture

## Use Case

- Enterprise-grade payment system
- Multi-market support (Nigeria, Africa, Global)
- High availability with automatic failover
- Provider selection based on business logic
- Currency-based routing
- Real-time monitoring and health checks

## Features

- **Multiple Gateway Support**: Paystack, Flutterwave, and Stripe
- **Smart Routing**: Automatic gateway selection based on currency, region, or custom logic
- **Health Monitoring**: Real-time health checks for all gateways
- **Automatic Failover**: Seamless fallback when primary gateway fails
- **Strategy Pattern**: Customizable gateway selection strategies
- **Event System**: Emit events for payment lifecycle hooks
- **Admin Dashboard**: Monitor gateway status and performance
- **Webhook Support**: Handle callbacks from multiple providers

## Structure

```
src/nestjs-multiple-gateways/
├── main.ts
├── app.module.ts
├── config/
│   └── payment.config.ts
├── payment/
│   ├── payment.module.ts
│   ├── payment.service.ts
│   ├── payment.controller.ts
│   ├── gateway-manager.service.ts
│   ├── strategies/
│   │   ├── gateway-selection.strategy.ts
│   │   ├── currency-based.strategy.ts
│   │   └── priority-based.strategy.ts
│   ├── dto/
│   │   ├── initiate-payment.dto.ts
│   │   ├── verify-payment.dto.ts
│   │   └── refund-payment.dto.ts
│   ├── events/
│   │   └── payment.events.ts
│   └── health/
│       └── gateway-health.service.ts
└── README.md
```

## Installation

```bash
npm install --save @nestjs/common @nestjs/core @nestjs/platform-express
npm install --save @nestjs/config @nestjs/swagger @nestjs/event-emitter
npm install --save class-validator class-transformer
npm install --save @porkate/payment @porkate/paystack @porkate/flutterwave @porkate/stripe
```

## Configuration

Create a `.env` file:

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Application
PORT=3000
NODE_ENV=development
DEFAULT_GATEWAY=paystack
ENABLE_FALLBACK=true
```

## Key Concepts

### Gateway Selection Strategy

The application uses a strategy pattern to select the best gateway:

```typescript
interface GatewaySelectionStrategy {
  selectGateway(
    currency: Currency,
    amount: number,
    metadata?: any
  ): string;
}
```

**Strategies included:**

1. **Currency-Based**: Select based on currency (NGN → Paystack, USD → Stripe)
2. **Priority-Based**: Use priority order with failover
3. **Load-Balanced**: Distribute load across gateways
4. **Custom**: Implement your own logic

### Health Monitoring

Continuous health checks for all gateways:

```typescript
{
  "gatewayName": "paystack",
  "healthy": true,
  "lastCheck": "2024-01-15T10:30:00Z",
  "responseTime": 150,
  "uptime": 99.9
}
```

### Event System

Payment events for hooks and notifications:

```typescript
// Listen to payment events
@OnEvent('payment.initiated')
handlePaymentInitiated(payload: PaymentInitiatedEvent) {
  // Send notification, log, etc.
}

@OnEvent('payment.success')
handlePaymentSuccess(payload: PaymentSuccessEvent) {
  // Fulfill order, update database
}
```

## API Endpoints

### Gateway Management
- `GET /api/payments/gateways` - List all gateways
- `GET /api/payments/gateways/:name/health` - Check gateway health
- `POST /api/payments/gateways/:name/enable` - Enable gateway
- `POST /api/payments/gateways/:name/disable` - Disable gateway

### Payment Operations
- `POST /api/payments/initiate` - Initialize with auto-selection
- `POST /api/payments/initiate/:gateway` - Use specific gateway
- `GET /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/:reference` - Get payment details
- `POST /api/payments/refund` - Refund payment

### Monitoring
- `GET /api/payments/health` - Overall system health
- `GET /api/payments/stats` - Payment statistics
- `GET /api/payments/metrics` - Gateway performance metrics

## Example Usage

### Auto Gateway Selection

```bash
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "NGN",
    "email": "customer@example.com"
  }'
# Automatically selects Paystack for NGN
```

### Specific Gateway

```bash
curl -X POST http://localhost:3000/api/payments/initiate/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "USD",
    "email": "customer@example.com"
  }'
# Forces Stripe usage
```

### Check Gateway Health

```bash
curl http://localhost:3000/api/payments/gateways/paystack/health
```

## Advanced Features

### Custom Gateway Selection

Implement custom selection logic:

```typescript
@Injectable()
export class CustomGatewayStrategy implements GatewaySelectionStrategy {
  selectGateway(currency: Currency, amount: number): string {
    // High-value transactions → Stripe
    if (amount > 1000000) return 'stripe';
    
    // Nigerian currency → Paystack
    if (currency === Currency.NGN) return 'paystack';
    
    // Default → Flutterwave
    return 'flutterwave';
  }
}
```

### Automatic Failover

When a gateway fails, automatically try the next:

```typescript
try {
  result = await primaryGateway.initiatePayment(request);
} catch (error) {
  logger.warn('Primary gateway failed, trying fallback');
  result = await fallbackGateway.initiatePayment(request);
}
```

### Performance Monitoring

Track gateway performance metrics:

```typescript
{
  "gateway": "paystack",
  "metrics": {
    "totalTransactions": 1543,
    "successRate": 98.5,
    "averageResponseTime": 180,
    "failureCount": 23
  }
}
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Best Practices

1. **Monitor gateway health** continuously
2. **Implement retry logic** with exponential backoff
3. **Log all transactions** for audit trail
4. **Set up alerts** for gateway failures
5. **Test failover scenarios** regularly
6. **Use webhooks** for real-time updates
7. **Implement circuit breakers** to prevent cascade failures
8. **Cache gateway health** to reduce check overhead

## Production Considerations

1. **Rate Limiting**: Implement per-gateway rate limits
2. **Circuit Breaker**: Temporarily disable failing gateways
3. **Caching**: Cache successful verifications
4. **Queue System**: Use message queues for async processing
5. **Database**: Store all transactions for reconciliation
6. **Monitoring**: Set up APM (Application Performance Monitoring)
7. **Alerts**: Configure alerts for high failure rates
8. **Backup**: Always have a backup payment method

## Troubleshooting

### Gateway Not Available
- Check environment variables
- Verify API keys are correct
- Check gateway health endpoint
- Review application logs

### Failover Not Working
- Ensure `ENABLE_FALLBACK=true`
- Verify fallback gateway is enabled
- Check gateway priorities
- Review failover logs

### High Latency
- Check network connectivity
- Review gateway response times
- Consider implementing caching
- Use connection pooling

## License

MIT
