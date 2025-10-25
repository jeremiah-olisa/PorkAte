/**
 * Express API Example with Single Payment Gateway (Paystack)
 * 
 * This example demonstrates how to integrate Paystack payment gateway
 * into an Express.js REST API application.
 * 
 * Use Case:
 * - Simple payment integration with one provider
 * - Nigerian market focused (NGN currency)
 * - Minimal configuration and setup
 * 
 * Features:
 * - Payment initialization
 * - Payment verification
 * - Payment details retrieval
 * - Refund processing
 * - Error handling middleware
 * 
 * To run:
 *   export PAYSTACK_SECRET_KEY=sk_test_xxxxx
 *   export PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
 *   pnpm tsx src/express-single-gateway.ts
 */

import express, { Request, Response, NextFunction } from 'express';
import { PaymentGatewayManager, Currency, PaymentStatus } from '@porkate/payment';
import { PaystackConfig, PaystackGateway } from '@porkate/paystack';

const app = express();
app.use(express.json());

// ============================================================================
// Payment Gateway Setup
// ============================================================================

/**
 * Initialize the Payment Gateway Manager with Paystack
 */
const paymentManager = new PaymentGatewayManager<PaystackConfig>({
  gateways: [
    {
      name: 'paystack',
      config: {
        secretKey: process.env.PAYSTACK_SECRET_KEY || '',
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
        debug: process.env.NODE_ENV === 'development',
        timeout: 30000,
      },
      enabled: true,
    },
  ],
  defaultGateway: 'paystack',
  enableFallback: false,
});

// Register the Paystack gateway factory
paymentManager.registerFactory<PaystackConfig>('paystack', (config) => {
  return new PaystackGateway(config);
});

// ============================================================================
// Request/Response Types
// ============================================================================

interface InitiatePaymentRequestBody {
  amount: number; // Amount in kobo (e.g., 50000 = 500 NGN)
  currency: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  description?: string;
}

interface RefundPaymentRequestBody {
  reference: string;
  amount?: number; // Optional: for partial refunds
  reason?: string;
}

// ============================================================================
// API Routes
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  const gateway = paymentManager.getDefaultGateway();
  res.json({
    status: 'ok',
    gateway: gateway.getGatewayName(),
    ready: gateway.isReady(),
  });
});

/**
 * POST /api/payments/initiate
 * Initialize a new payment transaction
 * 
 * Request body:
 * {
 *   "amount": 50000,
 *   "currency": "NGN",
 *   "email": "customer@example.com",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "callbackUrl": "https://yourapp.com/callback",
 *   "metadata": { "orderId": "ORDER-123" }
 * }
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

    const gateway = paymentManager.getDefaultGateway();

    // Initiate payment
    const result = await gateway.initiatePayment({
      amount: {
        amount: body.amount,
        currency: (body.currency as Currency) || Currency.NGN,
      },
      customer: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
      },
      callbackUrl: body.callbackUrl || `${req.protocol}://${req.get('host')}/api/payments/callback`,
      metadata: body.metadata,
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
        },
        message: 'Payment initiated successfully. Redirect user to authorizationUrl to complete payment.',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error?.message || 'Failed to initiate payment',
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
 * 
 * This should be called after the user completes payment
 * and is redirected back to your application
 */
app.get('/api/payments/verify/:reference', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    const gateway = paymentManager.getDefaultGateway();

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

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    const gateway = paymentManager.getDefaultGateway();

    // Get payment details
    const result = await gateway.getPayment({ reference });

    if (result.success) {
      res.json({
        success: true,
        data: result,
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
 * 
 * Request body:
 * {
 *   "reference": "abc123",
 *   "amount": 25000,  // Optional: for partial refunds
 *   "reason": "Customer requested refund"
 * }
 */
app.post('/api/payments/refund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: RefundPaymentRequestBody = req.body;

    if (!body.reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    const gateway = paymentManager.getDefaultGateway();

    // Process refund
    const result = await gateway.refundPayment({
      reference: body.reference,
      amount: body.amount ? {
        amount: body.amount,
        currency: Currency.NGN, // You might want to get this from the original transaction
      } : undefined,
      reason: body.reason,
    });

    if (result.success) {
      res.json({
        success: true,
        data: {
          reference: result.reference,
          refundReference: result.refundReference,
          status: result.status,
          refundedAmount: result.refundedAmount,
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
 * 
 * This endpoint receives notifications from Paystack when payment status changes
 * In production, you should verify the webhook signature
 */
app.post('/api/payments/callback', async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;

    console.log('Payment callback received:', { event, reference: data?.reference });

    // In production, verify the webhook signature here
    // const signature = req.headers['x-paystack-signature'];
    // if (!verifySignature(signature, req.body)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    // Handle different event types
    switch (event) {
      case 'charge.success':
        // Payment successful - update your database, fulfill order, etc.
        console.log('Payment successful:', data.reference);
        break;

      case 'charge.failed':
        // Payment failed - update status, notify user
        console.log('Payment failed:', data.reference);
        break;

      default:
        console.log('Unhandled event type:', event);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Error Handling Middleware
// ============================================================================

/**
 * Global error handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

/**
 * 404 handler
 */
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
  console.log('='.repeat(60));
  console.log('🚀 Express Single Gateway Example');
  console.log('='.repeat(60));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Gateway: ${paymentManager.getDefaultGateway().getGatewayName()}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  POST   http://localhost:${PORT}/api/payments/initiate`);
  console.log(`  GET    http://localhost:${PORT}/api/payments/verify/:reference`);
  console.log(`  GET    http://localhost:${PORT}/api/payments/:reference`);
  console.log(`  POST   http://localhost:${PORT}/api/payments/refund`);
  console.log(`  POST   http://localhost:${PORT}/api/payments/callback`);
  console.log('='.repeat(60));
});

export default app;
