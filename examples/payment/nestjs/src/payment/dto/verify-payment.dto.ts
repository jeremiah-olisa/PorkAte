/**
 * DTO for verifying a payment (path parameter)
 */

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Payment reference to verify',
    example: 'abc123xyz',
  })
  @IsString()
  reference: string;
}
