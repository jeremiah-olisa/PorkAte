import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make config available everywhere
      envFilePath: './../.env',
    }),
    PaymentModule,
  ],
})
export class AppModule {}
