/**
 * Express API Example with Multiple Payment Gateways
 * 
 * This example demonstrates how to integrate multiple payment gateways
 * (Paystack, Flutterwave, Stripe) into an Express.js REST API with
 * automatic failover and smart routing.
 * 
 * Use Case:
 * - High availability payment system
 * - Multi-market support (Nigeria, Africa, Global)
 * - Automatic failover when primary gateway fails
 * - User preference-based gateway selection
 * - Currency-based routing
 * 
 * Features:
 * - Multiple payment gateways with priority
 * - Automatic failover on errors
 * - Gateway health checking
 * - Smart routing based on currency
 * - Specific gateway selection
 * - Gateway listing and status
 * 
 * To run:
 *   export PAYSTACK_SECRET_KEY=sk_test_xxxxx
 *   export PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
 *   export FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx
 *   export STRIPE_SECRET_KEY=sk_test_xxxxx
 *   pnpm tsx src/express-multiple-gateways.ts
 */

import express, { Request, Response, NextFunction } from 'express';
import { PaymentGatewayManager, Currency, PaymentStatus, IPaymentGateway } from '@porkate/payment';
import { PaystackConfig, PaystackGateway } from '@porkate/paystack';
import { FlutterwaveConfig, FlutterwaveGateway } from '@porkate/flutterwave';
import { StripeConfig, StripeGateway } from '@porkate/stripe';

const app = express();
app.use(express.json());

// ============================================================================
// Payment Gateway Setup
// ============================================================================

/**
 * Initialize the Payment Gateway Manager with multiple gateways
 */
const paymentManager = new PaymentGatewayManager({
  gateways: [
    {
      name: 'paystack',
      config: {
        secretKey: process.env.PAYSTACK_SECRET_KEY || '',
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
        debug: process.env.NODE_ENV === 'development',
        timeout: 30000,
      } as PaystackConfig,
      enabled: !!process.env.PAYSTACK_SECRET_KEY,
      priority: 100, // Highest priority (primary gateway)
    },
    {
      name: 'flutterwave',
      config: {
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
        publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
        debug: process.env.NODE_ENV === 'development',
        timeout: 30000,
      } as FlutterwaveConfig,
      enabled: !!process.env.FLUTTERWAVE_SECRET_KEY,
      priority: 90, // Fallback option
    },
    {
      name: 'stripe',
      config: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        publicKey: process.env.STRIPE_PUBLIC_KEY || '',
        debug: process.env.NODE_ENV === 'development',
        timeout: 30000,
      } as StripeConfig,
      enabled: !!process.env.STRIPE_SECRET_KEY,
      priority: 80, // Last resort
    },
  ],
  defaultGateway: 'paystack',
  enableFallback: true, // Enable automatic failover
});

// Register gateway factories
paymentManager.registerFactory<PaystackConfig>('paystack', (config) => {
  return new PaystackGateway(config);
});

paymentManager.registerFactory<FlutterwaveConfig>('flutterwave', (config) => {
  return new FlutterwaveGateway(config);
});

paymentManager.registerFactory<StripeConfig>('stripe', (config) => {
  return new StripeGateway(config);
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Smart gateway selection based on currency
 */
function selectGatewayByCurrency(currency: Currency): string {
  switch (currency) {
    case Currency.NGN:
      return 'paystack'; // Best for Nigerian Naira
    case Currency.USD:
    case Currency.EUR:
    case Currency.GBP:
      return 'stripe'; // Best for international currencies
    default:
      return 'flutterwave'; // Good for African markets
  }
}

/**
 * Check if a gateway is healthy and ready
 */
async function checkGatewayHealth(gatewayName: string): Promise<boolean> {
  try {
    const gateway = paymentManager.getGateway(gatewayName);
    return gateway.isReady();
  } catch (error) {
    return false;
  }
}

/**
 * Get the best available gateway with fallback
 */
function getBestGateway(preferredGateway?: string, currency?: Currency): IPaymentGateway {
  // Try preferred gateway first
  if (preferredGateway) {
    try {
      return paymentManager.getGateway(preferredGateway);
    } catch (error) {
      console.warn(`Preferred gateway '${preferredGateway}' not available, using fallback`);
    }
  }

  // Try currency-based selection
  if (currency) {
    const currencyGateway = selectGatewayByCurrency(currency);
    try {
      return paymentManager.getGateway(currencyGateway);
    } catch (error) {
      console.warn(`Currency-based gateway '${currencyGateway}' not available`);
    }
  }

  // Fall back to default gateway
  return paymentManager.getDefaultGateway();
}

// ============================================================================
// Request/Response Types
// ============================================================================

interface InitiatePaymentRequestBody {
  amount: number;
  currency: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  description?: string;
  preferredGateway?: string; // Allow user to specify gateway
}

// ============================================================================
// API Routes
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', async (req: Request, res: Response) => {
  const gateways = paymentManager.listGateways();
  const healthChecks = await Promise.all(
    gateways.map(async (name) => ({
      name,
      healthy: await checkGatewayHealth(name),
    }))
  );

  res.json({
    status: 'ok',
    gateways: healthChecks,
    defaultGateway: paymentManager.getDefaultGateway().getGatewayName(),
  });
});

/**
 * GET /api/payments/gateways
 * List all available payment gateways
 */
app.get('/api/payments/gateways', async (req: Request, res: Response) => {
  try {
    const gateways = paymentManager.listGateways();
    const gatewayDetails = await Promise.all(
      gateways.map(async (name) => {
        const healthy = await checkGatewayHealth(name);
        return {
          name,
          ready: healthy,
          isDefault: name === paymentManager.getDefaultGateway().getGatewayName(),
        };
      })
    );

    res.json({
      success: true,
      data: gatewayDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve gateway information',
    });
  }
});

/**
 * GET /api/payments/gateways/:gateway/health
 * Check health of a specific gateway
 */
app.get('/api/payments/gateways/:gateway/health', async (req: Request, res: Response) => {
  try {
    const { gateway } = req.params;
    const healthy = await checkGatewayHealth(gateway);

    res.json({
      success: true,
      gateway,
      healthy,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Gateway not found',
    });
  }
});

/**
 * POST /api/payments/initiate
 * Initialize a payment with automatic gateway selection
 */
app.post('/api/payments/initiate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: InitiatePaymentRequestBody = req.body;

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be greater than 0',
      });
    }

    if (!body.email) {
      return res.status(400).json({
        success: false,
        error: 'Customer email is required',
      });
    }

    const currency = (body.currency as Currency) || Currency.NGN;

    // Get best available gateway
    const gateway = getBestGateway(body.preferredGateway, currency);
    const gatewayName = gateway.getGatewayName();

    console.log(`Using gateway: ${gatewayName} for currency: ${currency}`);

    // Initiate payment
    const result = await gateway.initiatePayment({
      amount: {
        amount: body.amount,
        currency,
      },
      customer: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
      },
      callbackUrl: body.callbackUrl || `${req.protocol}://${req.get('host')}/api/payments/callback`,
      metadata: {
        ...body.metadata,
        gateway: gatewayName, // Track which gateway was used
      },
      description: body.description,
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          reference: result.reference,
          authorizationUrl: result.authorizationUrl,
          accessCode: result.accessCode,
          status: result.status,
          gateway: gatewayName,
        },
        message: 'Payment initiated successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error?.message || 'Failed to initiate payment',
        gateway: gatewayName,
        details: result.error,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/initiate/:gateway
 * Initialize a payment with a specific gateway
 */
app.post('/api/payments/initiate/:gateway', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gateway: gatewayName } = req.params;
    const body: InitiatePaymentRequestBody = req.body;

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be greater than 0',
      });
    }

    if (!body.email) {
      return res.status(400).json({
        success: false,
        error: 'Customer email is required',
      });
    }

    // Get specific gateway
    const gateway = paymentManager.getGateway(gatewayName);
    const currency = (body.currency as Currency) || Currency.NGN;

    console.log(`Using specified gateway: ${gatewayName}`);

    // Initiate payment
    const result = await gateway.initiatePayment({
      amount: {
        amount: body.amount,
        currency,
      },
      customer: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
      },
      callbackUrl: body.callbackUrl || `${req.protocol}://${req.get('host')}/api/payments/callback`,
      metadata: {
        ...body.metadata,
        gateway: gatewayName,
      },
      description: body.description,
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          reference: result.reference,
          authorizationUrl: result.authorizationUrl,
          accessCode: result.accessCode,
          status: result.status,
          gateway: gatewayName,
        },
        message: `Payment initiated successfully with ${gatewayName}`,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error?.message || 'Failed to initiate payment',
        gateway: gatewayName,
        details: result.error,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments/verify/:reference
 * Verify a payment transaction
 */
app.get('/api/payments/verify/:reference', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reference } = req.params;
    const { gateway: preferredGateway } = req.query;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    // Try to get gateway from query param, otherwise use default
    const gateway = preferredGateway 
      ? paymentManager.getGateway(preferredGateway as string)
      : paymentManager.getDefaultGateway();

    // Verify payment
    const result = await gateway.verifyPayment({ reference });

    if (result.success) {
      res.json({
        success: true,
        data: {
          reference: result.reference,
          status: result.status,
          amount: result.amount,
          currency: result.currency,
          paidAt: result.paidAt,
          customer: result.customer,
          metadata: result.metadata,
          gateway: gateway.getGatewayName(),
        },
        message: result.status === PaymentStatus.SUCCESS
          ? 'Payment verified successfully'
          : `Payment status: ${result.status}`,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error?.message || 'Failed to verify payment',
        details: result.error,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments/:reference
 * Get payment details
 */
app.get('/api/payments/:reference', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reference } = req.params;
    const { gateway: preferredGateway } = req.query;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    const gateway = preferredGateway 
      ? paymentManager.getGateway(preferredGateway as string)
      : paymentManager.getDefaultGateway();

    const result = await gateway.getPayment({ reference });

    if (result.success) {
      res.json({
        success: true,
        data: {
          ...result,
          gateway: gateway.getGatewayName(),
        },
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error?.message || 'Payment not found',
        details: result.error,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/refund
 * Refund a payment transaction
 */
app.post('/api/payments/refund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reference, amount, reason, gateway: preferredGateway } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    const gateway = preferredGateway 
      ? paymentManager.getGateway(preferredGateway)
      : paymentManager.getDefaultGateway();

    const result = await gateway.refundPayment({
      reference,
      amount: amount ? {
        amount,
        currency: Currency.NGN, // You should get this from the original transaction
      } : undefined,
      reason,
    });

    if (result.success) {
      res.json({
        success: true,
        data: {
          reference: result.reference,
          refundReference: result.refundReference,
          status: result.status,
          refundedAmount: result.refundedAmount,
          gateway: gateway.getGatewayName(),
        },
        message: 'Refund processed successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error?.message || 'Failed to process refund',
        details: result.error,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/callback
 * Payment callback endpoint (webhook)
 */
app.post('/api/payments/callback', async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;

    console.log('Payment callback received:', { 
      event, 
      reference: data?.reference,
      gateway: data?.metadata?.gateway 
    });

    // In production:
    // 1. Verify webhook signature
    // 2. Check which gateway sent the webhook
    // 3. Process accordingly

    switch (event) {
      case 'charge.success':
        console.log('Payment successful:', data.reference);
        // Update database, fulfill order, etc.
        break;

      case 'charge.failed':
        console.log('Payment failed:', data.reference);
        // Update status, notify user
        break;

      default:
        console.log('Unhandled event type:', event);
    }

    res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Error Handling Middleware
// ============================================================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// ============================================================================
// Start Server
// ============================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  const gateways = paymentManager.listGateways();
  
  console.log('='.repeat(60));
  console.log('🚀 Express Multiple Gateways Example');
  console.log('='.repeat(60));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Available gateways: ${gateways.join(', ')}`);
  console.log(`Default gateway: ${paymentManager.getDefaultGateway().getGatewayName()}`);
  console.log(`Fallback enabled: ${true}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  POST   http://localhost:${PORT}/api/payments/initiate`);
  console.log(`  POST   http://localhost:${PORT}/api/payments/initiate/:gateway`);
  console.log(`  GET    http://localhost:${PORT}/api/payments/verify/:reference`);
  console.log(`  GET    http://localhost:${PORT}/api/payments/:reference`);
  console.log(`  POST   http://localhost:${PORT}/api/payments/refund`);
  console.log(`  GET    http://localhost:${PORT}/api/payments/gateways`);
  console.log(`  GET    http://localhost:${PORT}/api/payments/gateways/:gateway/health`);
  console.log('='.repeat(60));
});

export default app;
