import { PaystackGateway } from '@porkate/paystack';
import {
  Currency,
  createMoney,
  PaymentStatus,
  PaymentChannel,
  generateReference,
} from '@porkate/payment';

/**
 * Example: Initialize Paystack Gateway
 */
async function initializeGateway() {
  const gateway = new PaystackGateway({
    secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxxxxxxxxxxx',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    debug: true, // Enable debug mode for development
  });

  console.log('Gateway Name:', gateway.getGatewayName());
  console.log('Gateway Ready:', gateway.isReady());

  return gateway;
}

/**
 * Example: Initiate a Payment
 */
async function initiatePaymentExample() {
  const gateway = await initializeGateway();

  const payment = await gateway.initiatePayment({
    amount: createMoney(5000, Currency.NGN), // 5000 Naira
    customer: {
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348012345678',
    },
    reference: generateReference('ORD'), // Optional: generates automatically if not provided
    callbackUrl: 'https://yourapp.com/payment/callback',
    channels: [PaymentChannel.CARD, PaymentChannel.BANK_TRANSFER, PaymentChannel.USSD],
    metadata: {
      order_id: 'ORD123456',
      cart_id: 'CART789012',
      customer_id: 'CUST345',
    },
    description: 'Payment for Order #ORD123456',
  });

  if (payment.success) {
    console.log('✅ Payment initiated successfully');
    console.log('Reference:', payment.reference);
    console.log('Authorization URL:', payment.authorizationUrl);
    console.log('Access Code:', payment.accessCode);
    console.log('Status:', payment.status);

    // Redirect user to payment.authorizationUrl
    return payment.reference;
  } else {
    console.error('❌ Payment initiation failed');
    console.error('Error:', payment.error);
    return null;
  }
}

/**
 * Example: Verify a Payment
 */
async function verifyPaymentExample(reference: string) {
  const gateway = await initializeGateway();

  const verification = await gateway.verifyPayment({ reference });

  if (verification.success) {
    console.log('✅ Payment verification response received');
    console.log('Reference:', verification.reference);
    console.log('Status:', verification.status);
    console.log('Amount:', verification.amount);
    console.log('Channel:', verification.channel);
    console.log('Gateway Transaction ID:', verification.gatewayTransactionId);
    console.log('Customer:', verification.customer);
    console.log('Paid At:', verification.paidAt);

    if (verification.status === PaymentStatus.SUCCESS) {
      console.log('💰 Payment successful!');
      // Update your database, fulfill order, etc.
    } else {
      console.log('⚠️ Payment not successful. Status:', verification.status);
    }
  } else {
    console.error('❌ Payment verification failed');
    console.error('Error:', verification.error);
  }

  return verification;
}

/**
 * Example: Get Payment Details
 */
async function getPaymentExample(reference: string) {
  const gateway = await initializeGateway();

  const payment = await gateway.getPayment({ reference });

  if (payment.success) {
    console.log('✅ Payment details retrieved');
    console.log('Reference:', payment.reference);
    console.log('Gateway Transaction ID:', payment.gatewayTransactionId);
    console.log('Status:', payment.status);
    console.log('Amount:', payment.amount);
    console.log('Channel:', payment.channel);
    console.log('Created At:', payment.createdAt);
    console.log('Paid At:', payment.paidAt);
    console.log('Customer:', payment.customer);
    console.log('Metadata:', payment.metadata);

    if (payment.authorization) {
      console.log('Authorization Details:');
      console.log('  Card Type:', payment.authorization.cardType);
      console.log('  Last 4:', payment.authorization.last4);
      console.log('  Bank:', payment.authorization.bank);
      console.log('  Reusable:', payment.authorization.reusable);
    }
  } else {
    console.error('❌ Failed to get payment details');
    console.error('Error:', payment.error);
  }

  return payment;
}

/**
 * Example: Refund a Payment
 */
async function refundPaymentExample(reference: string) {
  const gateway = await initializeGateway();

  // Full refund
  const refund = await gateway.refundPayment({
    reference,
    reason: 'Customer requested refund',
  });

  // Partial refund (if supported)
  // const refund = await gateway.refundPayment({
  //   reference,
  //   amount: createMoney(2500, Currency.NGN), // Refund 2500 Naira
  //   reason: 'Partial refund for damaged item',
  // });

  if (refund.success) {
    console.log('✅ Refund processed successfully');
    console.log('Original Reference:', refund.reference);
    console.log('Refund Reference:', refund.refundReference);
    console.log('Amount Refunded:', refund.amount);
    console.log('Status:', refund.status);
    console.log('Refunded At:', refund.refundedAt);
  } else {
    console.error('❌ Refund failed');
    console.error('Error:', refund.error);
  }

  return refund;
}

/**
 * Example: Complete Payment Flow
 */
async function completePaymentFlow() {
  console.log('\n=== Starting Payment Flow ===\n');

  // Step 1: Initiate payment
  const reference = await initiatePaymentExample();

  if (!reference) {
    console.log('Payment flow stopped due to initialization failure');
    return;
  }

  console.log('\n--- User redirected to payment page ---');
  console.log('--- User completes payment ---\n');

  // Step 2: Verify payment (after user returns from payment page)
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
  const verification = await verifyPaymentExample(reference);

  if (verification.success && verification.status === PaymentStatus.SUCCESS) {
    // Step 3: Get full payment details
    console.log('\n--- Getting full payment details ---\n');
    await getPaymentExample(reference);

    // Optional: Demonstrate refund
    console.log('\n--- Processing refund (demo) ---\n');
    // Uncomment to test refund
    // await refundPaymentExample(reference);
  }

  console.log('\n=== Payment Flow Complete ===\n');
}

/**
 * Example: Error Handling
 */
async function errorHandlingExample() {
  const gateway = await initializeGateway();

  const payment = await gateway.initiatePayment({
    amount: createMoney(5000, Currency.NGN),
    customer: {
      email: 'invalid-email', // Invalid email to trigger error
    },
  });

  if (!payment.success) {
    // Handle different error types
    switch (payment.error?.code) {
      case 'PAYSTACK_API_ERROR':
        console.error('API Error:', payment.error.message);
        console.error('Status Code:', payment.error.details?.statusCode);
        break;
      case 'PAYSTACK_CONFIG_ERROR':
        console.error('Configuration Error:', payment.error.message);
        break;
      default:
        console.error('Unknown Error:', payment.error?.message);
    }
  }
}

// Run examples
if (require.main === module) {
  completePaymentFlow().catch(console.error);
}

export {
  initializeGateway,
  initiatePaymentExample,
  verifyPaymentExample,
  getPaymentExample,
  refundPaymentExample,
  completePaymentFlow,
  errorHandlingExample,
};
