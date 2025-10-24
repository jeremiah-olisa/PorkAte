/**
 * Simple example of using PaymentGatewayManager
 */

import { PaymentGatewayManager, Currency, PaymentStatus } from '@porkate/payment';
import { PaystackConfig, PaystackGateway } from '@porkate/paystack';

// Initialize the manager
const paymentManager = new PaymentGatewayManager({
  gateways: [
    {
      name: 'paystack',
      config: {
        secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxx',
        debug: true,
        baseUrl: '',
        publicKey: '',
        timeout: 30000,
      },
      enabled: true,
      priority: 100,
    },
  ],
  defaultGateway: 'paystack',
  enableFallback: false,
});

// Register the Paystack factory
paymentManager.registerFactory<PaystackConfig>('paystack', (config) => {
  return new PaystackGateway(config);
});

// Example: Process a payment
async function processPayment() {
  try {
    // Get the default gateway
    const gateway = paymentManager.getDefaultGateway();
    console.log(`Using gateway: ${gateway.getGatewayName()}`);

    // Initiate payment
    const result = await gateway.initiatePayment({
      amount: {
        amount: 50000, // 500 NGN in kobo
        currency: Currency.NGN,
      },
      customer: {
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+2348012345678',
      },
      callbackUrl: 'https://yourapp.com/payment/callback',
      metadata: {
        orderId: 'ORDER-12345',
        items: ['Product A', 'Product B'],
      },
    });

    if (result.success) {
      console.log('Payment initiated successfully!');
      console.log('Reference:', result.reference);
      console.log('Authorization URL:', result.authorizationUrl);
      console.log('Status:', result.status);

      // Redirect user to authorization URL
      // return result.authorizationUrl;
    } else {
      console.error('Payment initiation failed:', result.error);
    }

    return result;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

// Example: Verify a payment
async function verifyPayment(reference: string) {
  try {
    const gateway = paymentManager.getDefaultGateway();

    const result = await gateway.verifyPayment({ reference });

    if (result.success) {
      console.log('Payment verified!');
      console.log('Status:', result.status);
      console.log('Amount:', result.amount);
      console.log('Paid at:', result.paidAt);

      if (result.status === PaymentStatus.SUCCESS) {
        // Payment successful - update order, send confirmation, etc.
        console.log('Payment successful - process order');
      }
    } else {
      console.error('Payment verification failed:', result.error);
    }

    return result;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

// Example: Get payment details
async function getPaymentDetails(reference: string) {
  try {
    const gateway = paymentManager.getDefaultGateway();

    const result = await gateway.getPayment({ reference });

    if (result.success) {
      console.log('Payment details retrieved!');
      console.log('Reference:', result.reference);
      console.log('Status:', result.status);
      console.log('Amount:', result.amount);
      console.log('Customer:', result.customer);
      console.log('Metadata:', result.metadata);
    }

    return result;
  } catch (error) {
    console.error('Error getting payment details:', error);
    throw error;
  }
}

// Example: Check available gateways
function checkGateways() {
  console.log('Available gateways:', paymentManager.getAvailableGateways());
  console.log('Ready gateways:', paymentManager.getReadyGateways());

  if (paymentManager.hasGateway('paystack')) {
    console.log('Paystack is registered');
    console.log('Paystack is ready:', paymentManager.isGatewayReady('paystack'));
  }
}

// Run examples
async function main() {
  checkGateways();

  // Initiate a payment
  const payment = await processPayment();

  // If you have a reference from a real payment, verify it
  // const reference = 'PAY-12345678';
  // await verifyPayment(reference);
  // await getPaymentDetails(reference);
}

// Uncomment to run
// main().catch(console.error);

export { paymentManager, processPayment, verifyPayment, getPaymentDetails, checkGateways };
