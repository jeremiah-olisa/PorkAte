/**
 * DTO for refunding a payment
 */

import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiProperty({
    description: 'Payment reference to refund',
    example: 'abc123xyz',
  })
  @IsString()
  reference: string;

  @ApiPropertyOptional({
    description:
      'Refund amount (optional for partial refunds). Leave empty for full refund.',
    example: 25000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Reason for refund',
    example: 'Customer requested refund',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
