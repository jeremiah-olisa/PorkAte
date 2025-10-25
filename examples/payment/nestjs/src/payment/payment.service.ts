/**
 * Payment Service
 *
 * Handles all payment business logic and gateway interactions.
 * This service is injected with the payment gateway and provides
 * high-level methods for payment operations.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  type IPaymentGateway,
  Currency,
  InitiatePaymentResponse,
  VerifyPaymentResponse,
  GetPaymentResponse,
  RefundPaymentResponse,
} from '@porkate/payment';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject('PAYMENT_GATEWAY')
    private readonly paymentGateway: IPaymentGateway,
  ) {
    this.logger.log(
      `Payment service initialized with ${paymentGateway.getGatewayName()}`,
    );
  }

  /**
   * Initialize a payment transaction
   */
  async initiatePayment(
    dto: InitiatePaymentDto,
  ): Promise<InitiatePaymentResponse> {
    this.logger.debug(`Initiating payment for ${dto.email}`);

    try {
      const result = await this.paymentGateway.initiatePayment({
        amount: {
          amount: dto.amount,
          currency: dto.currency as Currency,
        },
        customer: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
        },
        callbackUrl: dto.callbackUrl,
        metadata: dto.metadata,
        description: dto.description,
      });

      if (result.success) {
        this.logger.log(`Payment initiated successfully: ${result.reference}`);
      } else {
        this.logger.warn(`Payment initiation failed: ${result.error?.message}`);
      }

      return result;
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error initiating payment: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    this.logger.debug(`Verifying payment: ${reference}`);

    try {
      const result = await this.paymentGateway.verifyPayment({ reference });

      if (result.success) {
        this.logger.log(
          `Payment verified: ${reference} - Status: ${result.status}`,
        );
      } else {
        this.logger.warn(`Payment verification failed: ${reference}`);
      }

      return result;
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error verifying payment: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  /**
   * Get payment details
   */
  async getPayment(reference: string): Promise<GetPaymentResponse> {
    this.logger.debug(`Getting payment details: ${reference}`);

    try {
      const result = await this.paymentGateway.getPayment({ reference });

      if (result.success) {
        this.logger.log(`Payment details retrieved: ${reference}`);
      } else {
        this.logger.warn(`Payment not found: ${reference}`);
      }

      return result;
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error getting payment: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  /**
   * Refund a payment transaction
   */
  async refundPayment(dto: RefundPaymentDto): Promise<RefundPaymentResponse> {
    this.logger.debug(`Processing refund for: ${dto.reference}`);

    try {
      const result = await this.paymentGateway.refundPayment({
        reference: dto.reference,
        amount: dto.amount
          ? {
              amount: dto.amount,
              currency: Currency.NGN, // TODO: Get from original transaction
            }
          : undefined,
        reason: dto.reason,
      });

      if (result.success) {
        this.logger.log(`Refund processed: ${dto.reference}`);
      } else {
        this.logger.warn(`Refund failed: ${dto.reference}`);
      }

      return result;
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error processing refund: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  /**
   * Check if gateway is ready
   */
  isGatewayReady(): boolean {
    return this.paymentGateway.isReady();
  }

  /**
   * Get gateway name
   */
  getGatewayName(): string {
    return this.paymentGateway.getGatewayName();
  }
}
