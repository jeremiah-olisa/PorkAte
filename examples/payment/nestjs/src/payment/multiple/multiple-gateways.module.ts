/**
 * Multiple Gateways Module
 *
 * This module demonstrates how to set up and configure multiple payment gateways
 * in a NestJS application. It provides a complete example of gateway management,
 * automatic failover, and smart routing.
 */

import { Module } from '@nestjs/common';
import { PaymentGatewayManager } from '@porkate/payment';
import { PaystackGateway } from '@porkate/paystack';
import { FlutterwaveGateway } from '@porkate/flutterwave';
import { StripeGateway } from '@porkate/stripe';
import { MultipleGatewaysService } from './multiple-gateways.service';
import { MultipleGatewaysController } from './multiple-gateways.controller';

@Module({
  providers: [
    MultipleGatewaysService,
    {
      provide: 'PAYMENT_GATEWAY_MANAGER',
      useFactory: () => {
        // Initialize the Payment Gateway Manager with multiple gateways
        const paymentManager = new PaymentGatewayManager({
          gateways: [
            {
              name: 'paystack',
              config: {
                secretKey: process.env.PAYSTACK_SECRET_KEY || '',
                publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
                debug: process.env.NODE_ENV === 'development',
                timeout: 30000,
              },
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
              },
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
              },
              enabled: !!process.env.STRIPE_SECRET_KEY,
              priority: 80, // Last resort
            },
          ],
          defaultGateway: 'paystack',
          enableFallback: true, // Enable automatic failover
        });

        // Register gateway factories
        paymentManager.registerFactory('paystack', (config) => {
          return new PaystackGateway(config);
        });

        paymentManager.registerFactory('flutterwave', (config) => {
          return new FlutterwaveGateway(config);
        });

        paymentManager.registerFactory('stripe', (config) => {
          return new StripeGateway(config);
        });

        return paymentManager;
      },
    },
  ],
  controllers: [MultipleGatewaysController],
  exports: [MultipleGatewaysService],
})
export class MultipleGatewaysModule {}
