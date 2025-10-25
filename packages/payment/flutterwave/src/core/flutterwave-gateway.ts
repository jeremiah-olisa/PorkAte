import axios, { AxiosInstance, AxiosError } from 'axios';
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

import {
  FlutterwaveConfig,
  FlutterwaveApiResponse,
  FlutterwaveInitializeData,
  FlutterwaveRefundData,
} from '../types';
import {
  mapToFlutterwaveCurrency,
  mapFlutterwaveStatus,
  sanitizeMetadata,
  mapToFlutterwaveAmount,
  mapChannelsToPaymentOptions,
  mapFlutterwaveChannel,
} from '../utils';
import { InitiatePaymentPayload, RefundPaymentPayload } from '../interfaces/flutterwave-request';
import { FlutterwaveTransactionData } from '../interfaces/flutterwave-transaction';

/**
 * Flutterwave payment gateway implementation
 */
export class FlutterwaveGateway implements IPaymentGateway {
  private readonly client: AxiosInstance;
  private readonly config: FlutterwaveConfig;
  private readonly baseUrl: string;

  constructor(config: FlutterwaveConfig) {
    if (!config.secretKey) {
      throw new PaymentConfigurationException('Secret key is required for Flutterwave', {
        gateway: 'Flutterwave',
      });
    }

    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.flutterwave.com/v3';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Add request/response interceptors for debugging
    if (config.debug) {
      this.client.interceptors.request.use((request) => {
        console.log('[Flutterwave Request]', {
          url: request.url,
          method: request.method,
          data: request.data,
        });
        return request;
      });

      this.client.interceptors.response.use(
        (response) => {
          console.log('[Flutterwave Response]', {
            status: response.status,
            data: response.data,
          });
          return response;
        },
        (error) => {
          console.error('[Flutterwave Error]', {
            message: error.message,
            response: error.response?.data,
          });
          return Promise.reject(error);
        },
      );
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    try {
      const reference = request.reference || generateReference('FLW');
      const currency = mapToFlutterwaveCurrency(request.amount.currency);
      const amount = mapToFlutterwaveAmount(request.amount);
      const paymentOptions = mapChannelsToPaymentOptions(request.channels);

      const payload: InitiatePaymentPayload = {
        tx_ref: reference,
        amount,
        currency,
        redirect_url: request.callbackUrl,
        payment_options: paymentOptions,
        customer: {
          email: request.customer.email,
          phonenumber: request.customer.phone,
          name: `${request.customer.firstName || ''} ${request.customer.lastName || ''}`.trim(),
        },
        meta: sanitizeMetadata({
          ...request.metadata,
          customer_first_name: request.customer.firstName,
          customer_last_name: request.customer.lastName,
        }),
      };

      const response = await this.client.post<FlutterwaveApiResponse<FlutterwaveInitializeData>>(
        '/payments',
        payload,
      );

      if (response.data.status !== 'success' || !response.data.data) {
        throw new PaymentInvalidResponseError(
          response.data.message || 'Failed to initialize payment',
          response.status,
          response.data,
        );
      }

      const data = response.data.data;

      return {
        success: true,
        reference,
        authorizationUrl: data.link,
        amount: request.amount,
        status: PaymentStatus.PENDING,
        metadata: request.metadata,
        raw: response.data,
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
      const response = await this.client.get<FlutterwaveApiResponse<FlutterwaveTransactionData>>(
        `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(request.reference)}`,
      );

      if (response.data.status !== 'success' || !response.data.data) {
        throw new PaymentInvalidResponseError(
          response.data.message || 'Failed to verify payment',
          response.status,
          response.data,
        );
      }

      const data = response.data.data;

      return {
        success: true,
        reference: data.tx_ref,
        status: mapFlutterwaveStatus(data.status) as PaymentStatus,
        amount: {
          amount: data.amount,
          currency: data.currency as Currency,
        },
        channel: mapFlutterwaveChannel(data.payment_type),
        gatewayTransactionId: data.id.toString(),
        paidAt: data.created_at ? new Date(data.created_at) : undefined,
        customer: {
          email: data.customer.email,
          firstName: data.customer.name?.split(' ')[0] || undefined,
          lastName: data.customer.name?.split(' ').slice(1).join(' ') || undefined,
        },
        metadata: data.meta || {},
        raw: response.data,
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
      const response = await this.client.get<FlutterwaveApiResponse<FlutterwaveTransactionData>>(
        `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(request.reference)}`,
      );

      if (response.data.status !== 'success' || !response.data.data) {
        throw new PaymentInvalidResponseError(
          response.data.message || 'Failed to get payment',
          response.status,
          response.data,
        );
      }

      const data = response.data.data;

      return {
        success: true,
        reference: data.tx_ref,
        gatewayTransactionId: data.id.toString(),
        status: mapFlutterwaveStatus(data.status) as PaymentStatus,
        amount: {
          amount: data.amount,
          currency: data.currency as Currency,
        },
        channel: mapFlutterwaveChannel(data.payment_type),
        createdAt: new Date(data.created_at),
        paidAt: data.created_at ? new Date(data.created_at) : undefined,
        customer: {
          email: data.customer.email,
          firstName: data.customer.name?.split(' ')[0] || undefined,
          lastName: data.customer.name?.split(' ').slice(1).join(' ') || undefined,
        },
        authorization: data.card
          ? {
              last4: data.card.last_4digits,
              cardType: data.card.type,
              bin: data.card.first_6digits,
              bank: data.card.issuer,
              channel: data.payment_type,
            }
          : undefined,
        metadata: data.meta || {},
        raw: response.data,
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
      // First, get the transaction ID from the reference
      const getResponse = await this.getPayment({ reference: request.reference });
      if (!getResponse.success || !getResponse.gatewayTransactionId) {
        return this.handleError(
          new Error('Transaction not found for refund'),
          'Transaction not found for refund',
        ) as RefundPaymentResponse;
      }

      const payload: RefundPaymentPayload = {
        id: getResponse.gatewayTransactionId,
      };

      if (request.amount) {
        payload.amount = request.amount.amount;
      }

      const response = await this.client.post<FlutterwaveApiResponse<FlutterwaveRefundData>>(
        '/refunds',
        payload,
      );

      if (response.data.status !== 'success' || !response.data.data) {
        throw new PaymentInvalidResponseError(
          response.data.message || 'Failed to refund payment',
          response.status,
          response.data,
        );
      }

      const data = response.data.data;

      return {
        success: true,
        reference: request.reference,
        refundReference: data.id.toString(),
        amount: {
          amount: data.amount_refunded,
          currency: request.amount?.currency || Currency.NGN,
        },
        status: mapFlutterwaveStatus(data.status) as PaymentStatus,
        refundedAt: data.created_at ? new Date(data.created_at) : undefined,
        metadata: request.metadata,
        raw: response.data,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to refund payment') as RefundPaymentResponse;
    }
  }

  /**
   * Cancel a pending payment (not directly supported by Flutterwave)
   * This is a placeholder implementation
   */
  async cancelPayment(request: CancelPaymentRequest): Promise<CancelPaymentResponse> {
    // Flutterwave doesn't have a direct cancel endpoint
    // We can verify the transaction status and if it's still pending,
    // return it as abandoned
    try {
      const verifyResponse = await this.verifyPayment({ reference: request.reference });

      return {
        success: true,
        reference: request.reference,
        status: verifyResponse.status,
        metadata: { reason: request.reason },
        raw: verifyResponse.raw,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to cancel payment') as CancelPaymentResponse;
    }
  }

  /**
   * Get the gateway name
   */
  getGatewayName(): string {
    return 'Flutterwave';
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
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<FlutterwaveApiResponse>;
      const message = axiosError.response?.data?.message || axiosError.message || defaultMessage;
      const statusCode = axiosError.response?.status;

      // Check for timeout
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        return {
          success: false,
          error: {
            code: 'PAYMENT_GATEWAY_TIMEOUT',
            message: 'Payment gateway request timed out',
            details: {
              statusCode,
              response: axiosError.response?.data,
            },
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'PAYMENT_GATEWAY_ERROR',
          message,
          details: {
            statusCode,
            response: axiosError.response?.data,
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
