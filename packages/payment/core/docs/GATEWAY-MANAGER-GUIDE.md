# Payment Gateway Manager

The `PaymentGatewayManager` is a factory/registry pattern implementation that manages multiple payment gateway adapters, provides fallback support, and simplifies gateway selection.

## Features

- ✅ **Multiple Gateway Registration**: Register and manage multiple payment gateways
- ✅ **Factory Pattern**: Register gateway factories for lazy initialization
- ✅ **Default Gateway**: Set and use a default payment gateway
- ✅ **Fallback Support**: Automatically fall back to alternative gateways
- ✅ **Priority-based Selection**: Configure gateway priority for fallback order
- ✅ **Dynamic Management**: Add, remove, and configure gateways at runtime
- ✅ **Type Safety**: Full TypeScript support with proper typing

## Basic Usage

### 1. Initialize with Configuration

```typescript
import { PaymentGatewayManager } from '@porkate/payment';

const manager = new PaymentGatewayManager({
  gateways: [
    {
      name: 'paystack',
      config: {
        secretKey: process.env.PAYSTACK_SECRET_KEY,
      },
      enabled: true,
      priority: 100, // Highest priority
    },
    {
      name: 'flutterwave',
      config: {
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
      },
      enabled: true,
      priority: 90,
    },
  ],
  defaultGateway: 'paystack',
  enableFallback: true,
});
```

### 2. Register Gateway Factories

```typescript
import { PaystackGateway } from '@porkate/paystack';
import { FlutterwaveGateway } from '@porkate/flutterwave';

manager
  .registerFactory('paystack', (config) => new PaystackGateway(config))
  .registerFactory('flutterwave', (config) => new FlutterwaveGateway(config));
```

### 3. Use Gateways

```typescript
// Get default gateway
const gateway = manager.getDefaultGateway();

// Get specific gateway
const paystack = manager.getGateway('paystack');

// Get with fallback
const gateway = manager.getGatewayWithFallback('stripe'); // Falls back if stripe unavailable
```

## API Reference

### Constructor

```typescript
constructor(config?: PaymentGatewayManagerConfig)
```

### Methods

#### `registerFactory(name: string, factory: GatewayFactory): this`
Register a factory function for creating gateway instances.

```typescript
manager.registerFactory('paystack', (config) => new PaystackGateway(config));
```

#### `registerGateway(name: string, gateway: IPaymentGateway): this`
Register a gateway instance directly.

```typescript
const gateway = new PaystackGateway({ secretKey: 'sk_test_xxx' });
manager.registerGateway('paystack', gateway);
```

#### `getGateway(name: string): IPaymentGateway`
Get a specific gateway by name. Throws if gateway not found or not ready.

```typescript
const gateway = manager.getGateway('paystack');
```

#### `getDefaultGateway(): IPaymentGateway`
Get the configured default gateway.

```typescript
const gateway = manager.getDefaultGateway();
```

#### `getGatewayWithFallback(preferredGateway?: string): IPaymentGateway | null`
Get a gateway with automatic fallback support. Returns null if no gateway available.

```typescript
const gateway = manager.getGatewayWithFallback('stripe');
if (gateway) {
  // Use gateway
}
```

#### `getAvailableGateways(): string[]`
Get names of all registered gateways.

```typescript
const gateways = manager.getAvailableGateways();
// ['paystack', 'flutterwave', 'stripe']
```

#### `getReadyGateways(): string[]`
Get names of all ready (properly configured) gateways.

```typescript
const ready = manager.getReadyGateways();
```

#### `hasGateway(name: string): boolean`
Check if a gateway is registered.

```typescript
if (manager.hasGateway('paystack')) {
  // Gateway is registered
}
```

#### `isGatewayReady(name: string): boolean`
Check if a gateway is ready to use.

```typescript
if (manager.isGatewayReady('paystack')) {
  // Gateway is configured and ready
}
```

#### `setDefaultGateway(name: string): this`
Set the default gateway.

```typescript
manager.setDefaultGateway('flutterwave');
```

#### `setFallbackEnabled(enabled: boolean): this`
Enable or disable fallback support.

```typescript
manager.setFallbackEnabled(true);
```

#### `removeGateway(name: string): this`
Remove a gateway from the manager.

```typescript
manager.removeGateway('stripe');
```

#### `clear(): this`
Remove all gateways.

```typescript
manager.clear();
```

## Advanced Usage

### Priority-based Fallback

Gateways are selected based on priority when using fallback:

```typescript
const manager = new PaymentGatewayManager({
  gateways: [
    { name: 'paystack', config: {...}, priority: 100 },
    { name: 'flutterwave', config: {...}, priority: 90 },
    { name: 'stripe', config: {...}, priority: 80 },
  ],
  enableFallback: true,
});

// Will try: stripe -> paystack (default) -> flutterwave -> any other
const gateway = manager.getGatewayWithFallback('stripe');
```

### Dynamic Gateway Management

```typescript
// Add gateway at runtime
manager.registerGateway('new-gateway', newGatewayInstance);

// Change default
manager.setDefaultGateway('new-gateway');

// Remove gateway
manager.removeGateway('old-gateway');
```

### Integration with Express

```typescript
import express from 'express';

const app = express();
app.locals.paymentManager = manager;

app.post('/payments', async (req, res) => {
  const gateway = req.app.locals.paymentManager.getDefaultGateway();
  const result = await gateway.initiatePayment(req.body);
  res.json(result);
});
```

### Integration with NestJS

```typescript
@Injectable()
class PaymentService {
  private readonly manager: PaymentGatewayManager;

  constructor(configService: ConfigService) {
    this.manager = new PaymentGatewayManager({...});
    this.manager.registerFactory('paystack', (cfg) => new PaystackGateway(cfg));
  }

  async pay(gatewayName?: string) {
    const gateway = gatewayName
      ? this.manager.getGateway(gatewayName)
      : this.manager.getDefaultGateway();
    
    return gateway.initiatePayment({...});
  }
}
```

## Configuration Types

### GatewayConfig

```typescript
interface GatewayConfig {
  name: string;                    // Gateway name
  config: Record<string, unknown>; // Gateway-specific config
  enabled?: boolean;               // Whether gateway is enabled
  priority?: number;               // Priority for fallback (higher = higher priority)
}
```

### PaymentGatewayManagerConfig

```typescript
interface PaymentGatewayManagerConfig {
  gateways: GatewayConfig[];     // Gateway configurations
  defaultGateway?: string;        // Default gateway name
  enableFallback?: boolean;       // Enable automatic fallback
}
```

### GatewayFactory

```typescript
type GatewayFactory = (config: Record<string, unknown>) => IPaymentGateway;
```

## Best Practices

1. **Always check gateway readiness** before critical operations
2. **Use fallback for production** to handle gateway failures gracefully
3. **Set priorities** based on cost, reliability, and features
4. **Monitor gateway health** and disable problematic gateways
5. **Use environment variables** for sensitive gateway configuration
6. **Test fallback scenarios** to ensure smooth transitions

## Error Handling

```typescript
try {
  const gateway = manager.getGateway('paystack');
  const result = await gateway.initiatePayment({...});
} catch (error) {
  if (error.code === 'PAYMENT_CONFIGURATION_ERROR') {
    // Gateway not found or not ready
    // Try fallback
    const fallback = manager.getGatewayWithFallback();
    if (fallback) {
      const result = await fallback.initiatePayment({...});
    }
  }
}
```
