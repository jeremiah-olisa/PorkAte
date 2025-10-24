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
  PaymentStatus,
  PaymentChannel,
  generateReference,
  PaymentConfigurationException,
  PaymentGatewayException,
  PaymentGatewayTimeoutException,
  UnsupportedCurrencyException,
} from '@porkate/payment';

import {
  PaystackConfig,
  PaystackApiResponse,
  PaystackInitializeData,
  PaystackTransactionData,
  PaystackRefundData,
} from '../types';
import { mapToPaystackCurrency, mapPaystackStatus, buildUrl, sanitizeMetadata } from '../utils';

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

      const payload: any = {
        email: request.customer.email,
        amount: request.amount.amount, // Amount should already be in kobo
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
        payload.channels = request.channels.map(this.mapChannel);
      }

      const response = await this.client.post<PaystackApiResponse<PaystackInitializeData>>(
        '/transaction/initialize',
        payload,
      );

      if (!response.data.status || !response.data.data) {
        throw new PaystackApiError(
          response.data.message || 'Failed to initialize payment',
          response.status,
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
      return this.handleError(error, 'Failed to initiate payment');
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
        throw new PaystackApiError(
          response.data.message || 'Failed to verify payment',
          response.status,
        );
      }

      const data = response.data.data;

      return {
        success: true,
        reference: data.reference,
        status: mapPaystackStatus(data.status) as PaymentStatus,
        amount: {
          amount: data.amount,
          currency: data.currency as any,
        },
        channel: this.mapPaystackChannel(data.channel),
        gatewayTransactionId: data.id.toString(),
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
        customer: {
          email: data.customer.email,
          firstName: data.customer.first_name || undefined,
          lastName: data.customer.last_name || undefined,
        },
        metadata: data.metadata,
        raw: response.data,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to verify payment');
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
        throw new PaystackApiError(
          response.data.message || 'Failed to get payment',
          response.status,
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
          currency: data.currency as any,
        },
        channel: this.mapPaystackChannel(data.channel),
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
        metadata: data.metadata,
        raw: response.data,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get payment');
    }
  }

  /**
   * Refund a payment transaction
   */
  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    try {
      const payload: any = {
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
        throw new PaystackApiError(
          response.data.message || 'Failed to refund payment',
          response.status,
        );
      }

      const data = response.data.data;

      return {
        success: true,
        reference: request.reference,
        refundReference: data.id.toString(),
        amount: {
          amount: data.amount,
          currency: data.currency as any,
        },
        status: mapPaystackStatus(data.status) as PaymentStatus,
        refundedAt: data.refunded_at ? new Date(data.refunded_at) : undefined,
        metadata: request.metadata,
        raw: response.data,
      };
    } catch (error) {
      return this.handleError(error, 'Failed to refund payment');
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
      return this.handleError(error, 'Failed to cancel payment');
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
   * Map standard payment channel to Paystack channel
   */
  private mapChannel(channel: PaymentChannel): string {
    const channelMap: Record<PaymentChannel, string> = {
      [PaymentChannel.CARD]: 'card',
      [PaymentChannel.BANK]: 'bank',
      [PaymentChannel.BANK_TRANSFER]: 'bank_transfer',
      [PaymentChannel.USSD]: 'ussd',
      [PaymentChannel.QR]: 'qr',
      [PaymentChannel.MOBILE_MONEY]: 'mobile_money',
      [PaymentChannel.EFT]: 'eft',
    };

    return channelMap[channel] || 'card';
  }

  /**
   * Map Paystack channel to standard payment channel
   */
  private mapPaystackChannel(channel: string): PaymentChannel {
    const channelMap: Record<string, PaymentChannel> = {
      card: PaymentChannel.CARD,
      bank: PaymentChannel.BANK,
      bank_transfer: PaymentChannel.BANK_TRANSFER,
      ussd: PaymentChannel.USSD,
      qr: PaymentChannel.QR,
      mobile_money: PaymentChannel.MOBILE_MONEY,
      eft: PaymentChannel.EFT,
    };

    return channelMap[channel.toLowerCase()] || PaymentChannel.CARD;
  }

  /**
   * Handle errors and convert to standard payment response
   */
  private handleError(error: any, defaultMessage: string): any {
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
    if (error.name && error.name.includes('Exception')) {
      return {
        success: false,
        error: {
          code: error.code || 'PAYMENT_ERROR',
          message: error.message || defaultMessage,
          details: error.details,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || defaultMessage,
        details: error,
      },
    };
  }
}
