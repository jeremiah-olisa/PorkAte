/**
 * Multiple Payment Gateways Service Example
 *
 * This example demonstrates how to integrate and manage multiple payment gateways
 * in a NestJS application using the PorkAte Payment Gateway Manager.
 *
 * Features demonstrated:
 * - Setting up multiple gateways (Paystack, Flutterwave, Stripe)
 * - Automatic failover and smart routing
 * - Currency-based gateway selection
 * - Manual gateway selection
 * - Health checking and status monitoring
 * - Graceful error handling
 *
 * Use Case:
 * - E-commerce platform supporting multiple markets
 * - High availability payment processing
 * - User preference-based gateway selection
 * - Automatic failover when primary gateway fails
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  PaymentGatewayManager,
  Currency,
  PaymentStatus,
  type IPaymentGateway,
  type InitiatePaymentResponse,
  type VerifyPaymentResponse,
} from '@porkate/payment';

export interface MultipleGatewayPaymentDto {
  amount: number;
  currency: Currency;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  description?: string;
  preferredGateway?: string; // Allow user to specify gateway
}

@Injectable()
export class MultipleGatewaysService {
  private readonly logger = new Logger(MultipleGatewaysService.name);

  constructor(
    @Inject('PAYMENT_GATEWAY_MANAGER')
    private readonly paymentManager: PaymentGatewayManager,
  ) {
    this.logger.log('Multiple Gateways Service initialized');
  }

  /**
   * Smart gateway selection based on currency
   * - Paystack: Best for Nigerian Naira (NGN)
   * - Stripe: Best for international currencies (USD, EUR, GBP)
   * - Flutterwave: Good for other African markets
   */
  private selectGatewayByCurrency(currency: Currency): string {
    switch (currency) {
      case Currency.NGN:
        return 'paystack';
      case Currency.USD:
      case Currency.EUR:
      case Currency.GBP:
        return 'stripe';
      default:
        return 'flutterwave';
    }
  }

  /**
   * Get the best available gateway with intelligent routing
   * Priority: Preferred > Currency-based > Default > Fallback
   */
  private getBestGateway(
    preferredGateway?: string,
    currency?: Currency,
  ): IPaymentGateway {
    // 1. Try preferred gateway first
    if (preferredGateway) {
      try {
        const gateway = this.paymentManager.getGateway(preferredGateway);
        if (gateway.isReady()) {
          this.logger.log(`Using preferred gateway: ${preferredGateway}`);
          return gateway;
        }
      } catch (err) {
        const error = err as Error;
        this.logger.warn(
          `Preferred gateway '${preferredGateway}' not available: ${error?.message}`,
        );
      }
    }

    // 2. Try currency-based selection
    if (currency) {
      const currencyGateway = this.selectGatewayByCurrency(currency);
      try {
        const gateway = this.paymentManager.getGateway(currencyGateway);
        if (gateway.isReady()) {
          this.logger.log(
            `Using currency-based gateway: ${currencyGateway} for ${currency}`,
          );
          return gateway;
        }
      } catch (err) {
        const error = err as Error;
        this.logger.warn(
          `Currency-based gateway '${currencyGateway}' not available: ${error?.message}`,
        );
      }
    }

    // 3. Fall back to default gateway
    try {
      const gateway = this.paymentManager.getDefaultGateway();
      this.logger.log(`Using default gateway: ${gateway.getGatewayName()}`);
      return gateway;
    } catch (err) {
      const error = err as Error;
      this.logger.error(`No default gateway available: ${error?.message}`);
      throw error;
    }
  }

  /**
   * Check if a gateway is healthy and ready
   */
  async checkGatewayHealth(gatewayName: string): Promise<boolean> {
    try {
      const gateway = this.paymentManager.getGateway(gatewayName);
      return Promise.resolve(gateway.isReady());
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Health check failed for ${gatewayName}: ${error?.message}`,
      );
      return false;
    }
  }

  /**
   * Get health status of all gateways
   */
  async getGatewayHealthStatus() {
    const availableGateways = this.paymentManager.getAvailableGateways();
    const healthChecks = await Promise.all(
      availableGateways.map(async (name) => ({
        name,
        healthy: await this.checkGatewayHealth(name),
        isDefault:
          name === this.paymentManager.getDefaultGateway().getGatewayName(),
      })),
    );

    return {
      totalGateways: availableGateways.length,
      healthyGateways: healthChecks.filter((g) => g.healthy).length,
      gateways: healthChecks,
    };
  }

  /**
   * Initiate a payment with automatic gateway selection
   * This is the main method you'll use for processing payments
   */
  async initiatePayment(
    dto: MultipleGatewayPaymentDto,
  ): Promise<InitiatePaymentResponse> {
    this.logger.debug(
      `Initiating payment for ${dto.email} - Amount: ${dto.amount} ${dto.currency}`,
    );

    // Validate input
    if (!dto.amount || dto.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!dto.email) {
      throw new Error('Customer email is required');
    }

    // Get the best available gateway
    const gateway = this.getBestGateway(dto.preferredGateway, dto.currency);
    const gatewayName = gateway.getGatewayName();

    this.logger.log(`Processing payment with gateway: ${gatewayName}`);

    try {
      // Initiate the payment
      const result = await gateway.initiatePayment({
        amount: {
          amount: dto.amount,
          currency: dto.currency,
        },
        customer: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
        },
        callbackUrl: dto.callbackUrl,
        metadata: {
          ...dto.metadata,
          gateway: gatewayName, // Track which gateway was used
          initiatedAt: new Date().toISOString(),
        },
        description: dto.description,
      });

      this.logger.log(
        `Payment initiated successfully with ${gatewayName}: ${result.reference}`,
      );

      return result;
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Payment initiation failed with ${gatewayName}: ${error?.message}`,
      );

      // If this was not the preferred gateway and fallback is enabled, try another gateway
      if (dto.preferredGateway && dto.preferredGateway !== gatewayName) {
        this.logger.log('Attempting fallback to another gateway...');

        try {
          const fallbackGateway = this.getBestGateway(undefined, dto.currency);
          if (fallbackGateway.getGatewayName() !== gatewayName) {
            this.logger.log(
              `Trying fallback gateway: ${fallbackGateway.getGatewayName()}`,
            );

            const fallbackResult = await fallbackGateway.initiatePayment({
              amount: {
                amount: dto.amount,
                currency: dto.currency,
              },
              customer: {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
              },
              callbackUrl: dto.callbackUrl,
              metadata: {
                ...dto.metadata,
                gateway: fallbackGateway.getGatewayName(),
                fallback: true,
                originalGateway: gatewayName,
                initiatedAt: new Date().toISOString(),
              },
              description: dto.description,
            });

            this.logger.log(
              `Payment initiated successfully with fallback gateway: ${fallbackResult.reference}`,
            );
            return fallbackResult;
          }
        } catch (fallbackError) {
          const error = fallbackError as Error;
          this.logger.error(`Fallback payment also failed: ${error?.message}`);
        }
      }

      // If we reach here, all attempts failed
      throw new Error(`Payment initiation failed: ${error?.message}`);
    }
  }

  /**
   * Verify a payment transaction
   * Works with any gateway that processed the payment
   */
  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    this.logger.debug(`Verifying payment: ${reference}`);

    // Try to verify with all available gateways
    const availableGateways = this.paymentManager.getReadyGateways();

    for (const gatewayName of availableGateways) {
      try {
        const gateway = this.paymentManager.getGateway(gatewayName);
        const result = await gateway.verifyPayment({ reference });

        if (result.status === PaymentStatus.SUCCESS) {
          this.logger.log(
            `Payment verified successfully with ${gatewayName}: ${reference}`,
          );
          return result;
        }
      } catch (err) {
        const error = err as Error;
        this.logger.warn(
          `Verification failed with ${gatewayName}: ${error?.message}`,
        );
        // Continue to next gateway
      }
    }

    throw new Error(`Payment verification failed for reference: ${reference}`);
  }

  /**
   * Get payment details
   */
  async getPayment(reference: string) {
    this.logger.debug(`Getting payment details: ${reference}`);

    // Try all gateways to find the payment
    const availableGateways = this.paymentManager.getReadyGateways();

    for (const gatewayName of availableGateways) {
      try {
        const gateway = this.paymentManager.getGateway(gatewayName);
        const result = await gateway.getPayment({ reference });
        this.logger.log(`Payment found with ${gatewayName}: ${reference}`);
        return result;
      } catch (err) {
        const error = err as Error;
        this.logger.debug(
          `Payment not found with ${gatewayName}: ${error?.message}`,
        );
        // Continue to next gateway
      }
    }

    throw new Error(`Payment not found: ${reference}`);
  }

  /**
   * List all available gateways
   */
  getAvailableGateways(): string[] {
    return this.paymentManager.getAvailableGateways();
  }

  /**
   * Get gateway manager instance (for advanced usage)
   */
  getPaymentManager(): PaymentGatewayManager {
    return this.paymentManager;
  }
}
