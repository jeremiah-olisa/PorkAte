/**
 * Payment Module
 * 
 * Encapsulates all payment-related functionality:
 * - Payment gateway initialization
 * - Payment service
 * - Payment controller
 * - Exception filters
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaystackGateway } from '@porkate/paystack';
import { IPaymentGateway } from '@porkate/payment';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [
    // Payment Gateway Provider
    {
      provide: 'PAYMENT_GATEWAY',
      useFactory: (configService: ConfigService): IPaymentGateway => {
        const secretKey = configService.get<string>('PAYSTACK_SECRET_KEY');
        const publicKey = configService.get<string>('PAYSTACK_PUBLIC_KEY');

        if (!secretKey) {
          throw new Error('PAYSTACK_SECRET_KEY is required');
        }

        return new PaystackGateway({
          secretKey,
          publicKey: publicKey || '',
          debug: configService.get('NODE_ENV') === 'development',
          timeout: 30000,
        });
      },
      inject: [ConfigService],
    },
    PaymentService,
  ],
  exports: [PaymentService], // Export service for use in other modules if needed
})
export class PaymentModule {}
