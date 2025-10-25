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
  PaystackConfig,
  PaystackApiResponse,
  PaystackInitializeData,
  PaystackRefundData,
} from '../types';
import {
  mapToPaystackCurrency,
  mapPaystackStatus,
  sanitizeMetadata,
  mapToPaystackAmount,
  mapChannel,
  mapPaystackChannel,
} from '../utils';
import { InitiatePaymentPayload, RefundPaymentPayload } from '../interfaces/paystack-request';
import { PaystackTransactionData } from '../interfaces/paystack-transaction';
import { MetadataParser } from '../utils/meta-data-parser';

/**
 * Paystack payment gateway implementation
 */
export class PaystackGateway implements IPaymentGateway {
  private readonly client: AxiosInstance;
  private readonly config: PaystackConfig;
  private readonly baseUrl: string;

  constructor(config: PaystackConfig) {
    if (!config.secretKey) {
      throw new PaymentConfigurationException('Secret key is required for Paystack', {
        gateway: 'Paystack',
      });
    }

    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.paystack.co';

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
        console.log('[Paystack Request]', {
          url: request.url,
          method: request.method,
          data: request.data,
        });
        return request;
      });

      this.client.interceptors.response.use(
        (response) => {
          console.log('[Paystack Response]', {
            status: response.status,
            data: response.data,
          });
          return response;
        },
        (error) => {
          console.error('[Paystack Error]', {
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
      const reference = request.reference || generateReference('PAY');
      const currency = mapToPaystackCurrency(request.amount.currency);
      const amount = mapToPaystackAmount(request.amount);
      const channels = request.channels ? request.channels.map(mapChannel) : undefined;

      const payload: InitiatePaymentPayload = {
        amount,
        email: request.customer.email,
        channels,
        currency,
        reference,
        callback_url: request.callbackUrl,
        metadata: sanitizeMetadata({
          ...request.metadata,
          customer_first_name: request.customer.firstName,
          customer_last_name: request.customer.lastName,
          customer_phone: request.customer.phone,
        }),
      };

      if (request.channels && request.channels.length > 0) {
        payload.channels = request.channels.map(mapChannel);
      }

      const response = await this.client.post<PaystackApiResponse<PaystackInitializeData>>(
        '/transaction/initialize',
        payload,
      );

      if (!response.data.status || !response.data.data) {
        throw new PaymentInvalidResponseError(
          response.data.message || 'Failed to initialize payment',
          response.status,
          response.data,
        );
      }

      const data = response.data.data;

      return {
        success: true,
        reference: data.reference,
        authorizationUrl: data.authorization_url,
        accessCode: data.access_code,
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
      const response = await this.client.get<PaystackApiResponse<PaystackTransactionData>>(
        `/transaction/verify/${encodeURIComponent(request.reference)}`,
      );

      if (!response.data.status || !response.data.data) {
        throw new PaymentInvalidResponseError(
          response.data.message || 'Failed to verify payment',
          response.status,
          response.data,
        );
      }

      const data = response.data.data;

      return {
        success: true,
        reference: data.reference,
        status: mapPaystackStatus(data.status) as PaymentStatus,
        amount: {
          amount: data.amount,
          currency: data.currency as Currency,
        },
        channel: mapPaystackChannel(data.channel),
        gatewayTransactionId: data.id.toString(),
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
        customer: {
          email: data.customer.email,
          firstName: data.customer.first_name || undefined,
          lastName: data.customer.last_name || undefined,
        },
        metadata: MetadataParser.parseToObject(data.metadata),
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
      const response = await this.client.get<PaystackApiResponse<PaystackTransactionData>>(
        `/transaction/${encodeURIComponent(request.reference)}`,
      );

      if (!response.data.status || !response.data.data) {
        throw new PaymentInvalidResponseError(
          response.data.message || 'Failed to get payment',
          response.status,
          response.data,
        );
      }

      const data = response.data.data;

      return {
        success: true,
        reference: data.reference,
        gatewayTransactionId: data.id.toString(),
        status: mapPaystackStatus(data.status) as PaymentStatus,
        amount: {
          amount: data.amount,
          currency: data.currency as Currency,
        },
        channel: mapPaystackChannel(data.channel),
        createdAt: new Date(data.created_at),
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
        customer: {
          email: data.customer.email,
          firstName: data.customer.first_name || undefined,
          lastName: data.customer.last_name || undefined,
        },
        authorization: data.authorization
          ? {
              authorizationCode: data.authorization.authorization_code,
              cardType: data.authorization.card_type,
              last4: data.authorization.last4,
              expMonth: data.authorization.exp_month,
              expYear: data.authorization.exp_year,
              bin: data.authorization.bin,
              bank: data.authorization.bank,
              channel: data.authorization.channel,
              reusable: data.authorization.reusable,
            }
          : undefined,
        metadata: MetadataParser.parseToObject(data.metadata),
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
      const payload: RefundPaymentPayload = {
        transaction: request.reference,
      };

      if (request.amount) {
        payload.amount = request.amount.amount;
      }

      if (request.reason) {
        payload.merchant_note = request.reason;
      }

      const response = await this.client.post<PaystackApiResponse<PaystackRefundData>>(
        '/refund',
        payload,
      );

      if (!response.data.status || !response.data.data) {
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
          amount: data.amount,
          currency: data.currency as Currency,
        },
        status: mapPaystackStatus(data.status) as PaymentStatus,
        refundedAt: data.refunded_at ? new Date(data.refunded_at) : undefined,
        metadata: request.metadata,
        raw: response.data,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to refund payment') as RefundPaymentResponse;
    }
  }

  /**
   * Cancel a pending payment (not directly supported by Paystack)
   * This is a placeholder implementation
   */
  async cancelPayment(request: CancelPaymentRequest): Promise<CancelPaymentResponse> {
    // Paystack doesn't have a direct cancel endpoint
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
    return 'Paystack';
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
      const axiosError = error as AxiosError<PaystackApiResponse>;
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
