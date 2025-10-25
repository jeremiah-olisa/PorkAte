/**
 * Payment Gateway Manager Usage Examples
 * 
 * This file demonstrates how to use the PaymentGatewayManager to:
 * 1. Register multiple payment gateways
 * 2. Set a default gateway
 * 3. Get a specific gateway
 * 4. Use fallback gateways
 */

import {
  PaymentGatewayManager,
  GatewayConfig,
  PaymentGatewayManagerConfig,
} from '@porkate/payment';

// Example gateway configurations would come from your app's config
const gatewayConfigs: GatewayConfig[] = [
  {
    name: 'paystack',
    config: {
      secretKey: process.env.PAYSTACK_SECRET_KEY!,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    },
    enabled: true,
    priority: 100, // Highest priority
  },
  {
    name: 'flutterwave',
    config: {
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
    },
    enabled: true,
    priority: 90,
  },
  {
    name: 'stripe',
    config: {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
    enabled: false, // Disabled for now
    priority: 80,
  },
];

// =============================================================================
// Example 1: Initialize with configuration
// =============================================================================

const managerConfig: PaymentGatewayManagerConfig = {
  gateways: gatewayConfigs,
  defaultGateway: 'paystack',
  enableFallback: true,
};

const paymentManager = new PaymentGatewayManager(managerConfig);

// =============================================================================
// Example 2: Register factories after initialization
// =============================================================================

// Import gateway implementations (these would be your actual gateway classes)
import { PaystackGateway } from '@porkate/paystack';
import { FlutterwaveGateway } from '@porkate/flutterwave';
import { StripeGateway } from '@porkate/stripe';

// Register factories for each gateway
paymentManager
  .registerFactory('paystack', (config) => new PaystackGateway(config as any))
  .registerFactory('flutterwave', (config) => new FlutterwaveGateway(config as any))
  .registerFactory('stripe', (config) => new StripeGateway(config as any));

// =============================================================================
// Example 3: Manual gateway registration (without factories)
// =============================================================================

const manualManager = new PaymentGatewayManager();

// Create gateway instances manually
const paystackGateway = new PaystackGateway({
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
});

const flutterwaveGateway = new FlutterwaveGateway({
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
});

// Register them
manualManager
  .registerGateway('paystack', paystackGateway)
  .registerGateway('flutterwave', flutterwaveGateway)
  .setDefaultGateway('paystack')
  .setFallbackEnabled(true);

// =============================================================================
// Example 4: Using the manager to process payments
// =============================================================================

async function processPayment() {
  try {
    // Get the default gateway
    const gateway = paymentManager.getDefaultGateway();
    console.log(`Using gateway: ${gateway.getGatewayName()}`);

    // Initiate payment
    const result = await gateway.initiatePayment({
      amount: {
        amount: 10000, // 100.00 in kobo
        currency: 'NGN' as any,
      },
      customer: {
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
      reference: 'PAY-123456',
    });

    return result;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

// =============================================================================
// Example 5: Get a specific gateway
// =============================================================================

async function processWithPaystack() {
  try {
    // Get Paystack gateway specifically
    const gateway = paymentManager.getGateway('paystack');

    const result = await gateway.initiatePayment({
      amount: {
        amount: 10000,
        currency: 'NGN' as any,
      },
      customer: {
        email: 'customer@example.com',
      },
    });

    return result;
  } catch (error) {
    console.error('Paystack payment failed:', error);
    throw error;
  }
}

// =============================================================================
// Example 6: Using fallback gateways
// =============================================================================

async function processWithFallback() {
  try {
    // Try to use Stripe, but fall back to other gateways if not available
    const gateway = paymentManager.getGatewayWithFallback('stripe');

    if (!gateway) {
      throw new Error('No payment gateway available');
    }

    console.log(`Using gateway: ${gateway.getGatewayName()}`);

    const result = await gateway.initiatePayment({
      amount: {
        amount: 10000,
        currency: 'NGN' as any,
      },
      customer: {
        email: 'customer@example.com',
      },
    });

    return result;
  } catch (error) {
    console.error('Payment with fallback failed:', error);
    throw error;
  }
}

// =============================================================================
// Example 7: Check gateway availability
// =============================================================================

function checkGatewayStatus() {
  // Get all available gateways
  const available = paymentManager.getAvailableGateways();
  console.log('Available gateways:', available);

  // Get only ready gateways
  const ready = paymentManager.getReadyGateways();
  console.log('Ready gateways:', ready);

  // Check if a specific gateway is available
  if (paymentManager.hasGateway('paystack')) {
    console.log('Paystack is registered');
  }

  // Check if a gateway is ready
  if (paymentManager.isGatewayReady('paystack')) {
    console.log('Paystack is ready to use');
  }
}

// =============================================================================
// Example 8: Dynamic gateway management
// =============================================================================

function manageGateways() {
  // Add a new gateway at runtime
  const newGateway = new PaystackGateway({
    secretKey: 'new-secret-key',
  });
  paymentManager.registerGateway('paystack-backup', newGateway);

  // Change default gateway
  paymentManager.setDefaultGateway('flutterwave');

  // Enable/disable fallback
  paymentManager.setFallbackEnabled(false);

  // Remove a gateway
  paymentManager.removeGateway('stripe');
}

// =============================================================================
// Example 9: Use in Express.js middleware
// =============================================================================

import express from 'express';

const app = express();

// Store manager in app locals
app.locals.paymentManager = paymentManager;

// Middleware to get payment gateway
function getPaymentGateway(preferredGateway?: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const manager = req.app.locals.paymentManager as PaymentGatewayManager;
      const gateway = preferredGateway
        ? manager.getGateway(preferredGateway)
        : manager.getDefaultGateway();

      req.app.locals.gateway = gateway;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Payment gateway not available' });
    }
  };
}

// Route using the middleware
app.post('/api/payments/initiate', getPaymentGateway('paystack'), async (req, res) => {
  try {
    const gateway = req.app.locals.gateway;
    const result = await gateway.initiatePayment(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// =============================================================================
// Example 10: Use in NestJS
// =============================================================================

import { Injectable, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
class PaymentService {
  private readonly manager: PaymentGatewayManager;

  constructor(private configService: ConfigService) {
    // Initialize manager from config
    const gatewayConfigs: GatewayConfig[] = [
      {
        name: 'paystack',
        config: {
          secretKey: this.configService.get('PAYSTACK_SECRET_KEY'),
        },
        enabled: true,
        priority: 100,
      },
    ];

    this.manager = new PaymentGatewayManager({
      gateways: gatewayConfigs,
      defaultGateway: 'paystack',
      enableFallback: true,
    });

    // Register factories
    this.manager.registerFactory('paystack', (config) => new PaystackGateway(config as any));
  }

  async initiatePayment(gatewayName?: string, data?: any) {
    const gateway = gatewayName
      ? this.manager.getGateway(gatewayName)
      : this.manager.getDefaultGateway();

    return gateway.initiatePayment(data);
  }

  getManager(): PaymentGatewayManager {
    return this.manager;
  }
}

@Module({
  providers: [PaymentService],
  exports: [PaymentService],
})
class PaymentModule {}

// Export examples
export {
  processPayment,
  processWithPaystack,
  processWithFallback,
  checkGatewayStatus,
  manageGateways,
  PaymentService,
  PaymentModule,
};
