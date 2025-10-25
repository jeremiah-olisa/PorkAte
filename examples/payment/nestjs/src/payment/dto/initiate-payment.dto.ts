/**
 * DTO for initiating a payment
 */

import { IsEmail, IsNumber, IsString, IsOptional, Min, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '@porkate/payment';

export class InitiatePaymentDto {
  @ApiProperty({
    description: 'Payment amount in the smallest currency unit (e.g., kobo for NGN)',
    example: 50000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Payment currency',
    enum: Currency,
    example: Currency.NGN,
    default: Currency.NGN,
  })
  @IsEnum(Currency)
  @IsOptional()
  currency: Currency = Currency.NGN;

  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Customer first name',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Customer last name',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+2348012345678',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Callback URL after payment',
    example: 'https://yourapp.com/payment/callback',
  })
  @IsString()
  @IsOptional()
  callbackUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the payment',
    example: { orderId: 'ORDER-12345', items: ['Product A'] },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Payment description',
    example: 'Payment for Order #12345',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
