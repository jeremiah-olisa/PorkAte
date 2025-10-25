import Stripe from 'stripe';
import {
  IPaymentGateway,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
  CancelPaymentRequest,
  CancelPaymentResponse,
  PaymentResponse,
  PaymentStatus,
  Currency,
  generateReference,
  PaymentConfigurationException,
  PaymentInvalidResponseError,
} from '@porkate/payment';

import { StripeConfig } from '../types';
import {
  mapToStripeCurrency,
  mapStripeStatus,
  sanitizeMetadata,
  mapToStripeAmount,
  stripeAmountToMoney,
  mapChannelsToPaymentMethodTypes,
  mapStripeChannel,
} from '../utils';
import { CreatePaymentIntentPayload } from '../interfaces/stripe-request';

/**
 * Stripe payment gateway implementation
 */
export class StripeGateway implements IPaymentGateway {
  private readonly client: Stripe;
  private readonly config: StripeConfig;

  constructor(config: StripeConfig) {
    if (!config.secretKey) {
      throw new PaymentConfigurationException('Secret key is required for Stripe', {
        gateway: 'Stripe',
      });
    }

    this.config = config;

    // Initialize Stripe client
    this.client = new Stripe(config.secretKey, {
      apiVersion: (config.apiVersion as Stripe.LatestApiVersion) || '2024-12-18.acacia',
      timeout: config.timeout || 30000,
      typescript: true,
    });

    // Log debugging info if enabled
    if (config.debug) {
      console.log('[Stripe] Gateway initialized');
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    try {
      const reference = request.reference || generateReference('STRIPE');
      const currency = mapToStripeCurrency(request.amount.currency);
      const amount = mapToStripeAmount(request.amount);
      const paymentMethodTypes = mapChannelsToPaymentMethodTypes(request.channels);

      const payload: CreatePaymentIntentPayload = {
        amount,
        currency,
        payment_method_types: paymentMethodTypes,
        receipt_email: request.customer.email,
        metadata: sanitizeMetadata({
          ...request.metadata,
          reference,
          customer_first_name: request.customer.firstName,
          customer_last_name: request.customer.lastName,
          customer_phone: request.customer.phone,
        }),
      };

      if (request.callbackUrl) {
        payload.return_url = request.callbackUrl;
      }

      if (this.config.debug) {
        console.log('[Stripe] Creating payment intent:', payload);
      }

      const paymentIntent = await this.client.paymentIntents.create(payload);

      if (this.config.debug) {
        console.log('[Stripe] Payment intent created:', paymentIntent.id);
      }

      return {
        success: true,
        reference,
        // Note: For Stripe, the client_secret should be used on the frontend with Stripe Elements
        // The authorizationUrl is set to undefined as Stripe doesn't provide a hosted checkout URL
        // from PaymentIntent. Use Checkout Sessions for hosted checkout.
        authorizationUrl: undefined,
        accessCode: paymentIntent.client_secret || undefined,
        amount: request.amount,
        status: mapStripeStatus(paymentIntent.status) as PaymentStatus,
        metadata: { ...request.metadata, payment_intent_id: paymentIntent.id },
        raw: paymentIntent,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to initiate payment') as InitiatePaymentResponse;
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      // Stripe uses payment intent ID, not a reference
      // We need to search for the payment intent by metadata
      const paymentIntents = await this.client.paymentIntents.search({
        query: `metadata['reference']:'${request.reference}'`,
        limit: 1,
      });

      if (!paymentIntents.data || paymentIntents.data.length === 0) {
        throw new PaymentInvalidResponseError(
          'Payment not found',
          404,
          { reference: request.reference },
        );
      }

      const paymentIntent = paymentIntents.data[0];

      if (this.config.debug) {
        console.log('[Stripe] Payment intent verified:', paymentIntent.id, paymentIntent.status);
      }

      const money = stripeAmountToMoney(paymentIntent.amount, paymentIntent.currency.toUpperCase() as Currency);

      return {
        success: true,
        reference: request.reference,
        status: mapStripeStatus(paymentIntent.status) as PaymentStatus,
        amount: money,
        channel: paymentIntent.payment_method
          ? mapStripeChannel('card') // Default to card for now
          : mapStripeChannel('card'),
        gatewayTransactionId: paymentIntent.id,
        paidAt:
          paymentIntent.status === 'succeeded' && paymentIntent.created
            ? new Date(paymentIntent.created * 1000)
            : undefined,
        customer: {
          email: paymentIntent.receipt_email || '',
        },
        metadata: paymentIntent.metadata || {},
        raw: paymentIntent,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to verify payment') as VerifyPaymentResponse;
    }
  }

  /**
   * Get payment details by reference
   */
  async getPayment(request: GetPaymentRequest): Promise<GetPaymentResponse> {
    try {
      // Search for the payment intent by metadata
      const paymentIntents = await this.client.paymentIntents.search({
        query: `metadata['reference']:'${request.reference}'`,
        limit: 1,
      });

      if (!paymentIntents.data || paymentIntents.data.length === 0) {
        throw new PaymentInvalidResponseError(
          'Payment not found',
          404,
          { reference: request.reference },
        );
      }

      const paymentIntent = paymentIntents.data[0];

      if (this.config.debug) {
        console.log('[Stripe] Payment intent retrieved:', paymentIntent.id);
      }

      const money = stripeAmountToMoney(paymentIntent.amount, paymentIntent.currency.toUpperCase() as Currency);

      return {
        success: true,
        reference: request.reference,
        gatewayTransactionId: paymentIntent.id,
        status: mapStripeStatus(paymentIntent.status) as PaymentStatus,
        amount: money,
        channel: mapStripeChannel('card'),
        createdAt: new Date(paymentIntent.created * 1000),
        paidAt:
          paymentIntent.status === 'succeeded' && paymentIntent.created
            ? new Date(paymentIntent.created * 1000)
            : undefined,
        customer: {
          email: paymentIntent.receipt_email || '',
        },
        metadata: paymentIntent.metadata || {},
        raw: paymentIntent,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get payment') as GetPaymentResponse;
    }
  }

  /**
   * Refund a payment transaction
   */
  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    try {
      // First, get the payment intent
      const getResponse = await this.getPayment({ reference: request.reference });
      if (!getResponse.success || !getResponse.gatewayTransactionId) {
        return this.handleError(
          new Error('Payment not found for refund'),
          'Payment not found for refund',
        ) as RefundPaymentResponse;
      }

      const payload: Stripe.RefundCreateParams = {
        payment_intent: getResponse.gatewayTransactionId,
      };

      if (request.amount) {
        payload.amount = mapToStripeAmount(request.amount);
      }

      if (request.reason) {
        const validReasons: Array<'duplicate' | 'fraudulent' | 'requested_by_customer'> = [
          'duplicate',
          'fraudulent',
          'requested_by_customer',
        ];
        type StripeRefundReason = 'duplicate' | 'fraudulent' | 'requested_by_customer';
        const reason = validReasons.includes(request.reason as StripeRefundReason)
          ? (request.reason as StripeRefundReason)
          : 'requested_by_customer';
        payload.reason = reason;
      }

      if (request.metadata) {
        payload.metadata = sanitizeMetadata(request.metadata);
      }

      if (this.config.debug) {
        console.log('[Stripe] Creating refund:', payload);
      }

      const refund = await this.client.refunds.create(payload);

      if (this.config.debug) {
        console.log('[Stripe] Refund created:', refund.id, refund.status);
      }

      const refundAmount = stripeAmountToMoney(
        refund.amount,
        refund.currency.toUpperCase() as Currency,
      );

      return {
        success: true,
        reference: request.reference,
        refundReference: refund.id,
        amount: refundAmount,
        status: mapStripeStatus(refund.status || 'succeeded') as PaymentStatus,
        refundedAt: refund.created ? new Date(refund.created * 1000) : undefined,
        metadata: request.metadata,
        raw: refund,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to refund payment') as RefundPaymentResponse;
    }
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(request: CancelPaymentRequest): Promise<CancelPaymentResponse> {
    try {
      // Get the payment intent
      const getResponse = await this.getPayment({ reference: request.reference });
      if (!getResponse.success || !getResponse.gatewayTransactionId) {
        return this.handleError(
          new Error('Payment not found for cancellation'),
          'Payment not found for cancellation',
        ) as CancelPaymentResponse;
      }

      // Cancel the payment intent
      const paymentIntent = await this.client.paymentIntents.cancel(
        getResponse.gatewayTransactionId,
        {
          cancellation_reason: request.reason as 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'abandoned',
        },
      );

      if (this.config.debug) {
        console.log('[Stripe] Payment intent cancelled:', paymentIntent.id);
      }

      return {
        success: true,
        reference: request.reference,
        status: mapStripeStatus(paymentIntent.status) as PaymentStatus,
        metadata: { reason: request.reason },
        raw: paymentIntent,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to cancel payment') as CancelPaymentResponse;
    }
  }

  /**
   * Get the gateway name
   */
  getGatewayName(): string {
    return 'Stripe';
  }

  /**
   * Check if the gateway is ready
   */
  isReady(): boolean {
    return !!this.config.secretKey;
  }

  /**
   * Handle errors and convert to standard payment response
   */
  private handleError(error: unknown, defaultMessage: string): PaymentResponse {
    if (error instanceof Stripe.errors.StripeError) {
      const message = error.message || defaultMessage;
      const code = error.code || 'STRIPE_ERROR';
      const statusCode = error.statusCode;

      if (this.config.debug) {
        console.error('[Stripe Error]', { code, message, statusCode });
      }

      return {
        success: false,
        error: {
          code: code.toUpperCase(),
          message,
          details: {
            statusCode,
            type: error.type,
            decline_code: error.decline_code,
          },
        },
      };
    }

    // Handle payment exceptions from core
    if (error instanceof Error && error.name && error.name.includes('Exception')) {
      const paymentError = error as Error & { code?: string; details?: unknown };
      return {
        success: false,
        error: {
          code: paymentError.code || 'PAYMENT_ERROR',
          message: error.message || defaultMessage,
          details: paymentError.details,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : defaultMessage,
        details: error,
      },
    };
  }
}
