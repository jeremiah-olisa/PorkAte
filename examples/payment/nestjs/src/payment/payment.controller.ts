/**
 * Payment Controller
 *
 * REST API endpoints for payment operations.
 * All endpoints are documented with Swagger decorators.
 */

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentStatus } from '@porkate/payment';

@ApiTags('payments')
@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Health check endpoint
   */
  @Get('health')
  @ApiOperation({ summary: 'Check payment gateway health' })
  @ApiResponse({ status: 200, description: 'Gateway is healthy' })
  getHealth() {
    return {
      status: 'ok',
      gateway: this.paymentService.getGatewayName(),
      ready: this.paymentService.isGatewayReady(),
    };
  }

  /**
   * Initialize a payment transaction
   */
  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initialize a payment transaction' })
  @ApiResponse({
    status: 201,
    description: 'Payment initiated successfully',
    schema: {
      example: {
        success: true,
        data: {
          reference: 'abc123xyz',
          authorizationUrl: 'https://checkout.paystack.com/abc123',
          accessCode: 'xyz789',
          status: 'pending',
        },
        message: 'Payment initiated successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    const result = await this.paymentService.initiatePayment(dto);

    if (!result.success) {
      throw new BadRequestException({
        success: false,
        error: result.error?.message || 'Failed to initiate payment',
        details: result.error,
      });
    }

    return {
      success: true,
      data: {
        reference: result.reference,
        authorizationUrl: result.authorizationUrl,
        accessCode: result.accessCode,
        status: result.status,
      },
      message:
        'Payment initiated successfully. Redirect user to authorizationUrl.',
    };
  }

  /**
   * Verify a payment transaction
   */
  @Get('verify/:reference')
  @ApiOperation({ summary: 'Verify a payment transaction' })
  @ApiResponse({
    status: 200,
    description: 'Payment verification result',
    schema: {
      example: {
        success: true,
        data: {
          reference: 'abc123xyz',
          status: 'success',
          amount: 50000,
          currency: 'NGN',
          paidAt: '2024-01-15T10:30:00Z',
          customer: {
            email: 'customer@example.com',
          },
        },
        message: 'Payment verified successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async verifyPayment(@Param() params: VerifyPaymentDto) {
    const result = await this.paymentService.verifyPayment(params.reference);

    if (!result.success) {
      throw new NotFoundException({
        success: false,
        error: result.error?.message || 'Payment not found',
        details: result.error,
      });
    }

    return {
      success: true,
      data: {
        ...result.amount,
        reference: result.reference,
        status: result.status,
        paidAt: result.paidAt,
        customer: result.customer,
        metadata: result.metadata,
      },
      message:
        result.status == PaymentStatus.SUCCESS
          ? 'Payment verified successfully'
          : `Payment status: ${result.status}`,
    };
  }

  /**
   * Get payment details
   */
  @Get(':reference')
  @ApiOperation({ summary: 'Get payment details' })
  @ApiResponse({
    status: 200,
    description: 'Payment details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param() params: VerifyPaymentDto) {
    const result = await this.paymentService.getPayment(params.reference);

    if (!result.success) {
      throw new NotFoundException({
        success: false,
        error: result.error?.message || 'Payment not found',
        details: result.error,
      });
    }

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Refund a payment transaction
   */
  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a payment transaction' })
  @ApiResponse({
    status: 200,
    description: 'Refund processed successfully',
    schema: {
      example: {
        success: true,
        data: {
          reference: 'abc123xyz',
          refundReference: 'ref_xyz789',
          status: 'success',
          refundedAmount: 50000,
        },
        message: 'Refund processed successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Refund failed' })
  async refundPayment(@Body() dto: RefundPaymentDto) {
    const result = await this.paymentService.refundPayment(dto);

    if (!result.success) {
      throw new BadRequestException({
        success: false,
        error: result.error?.message || 'Failed to process refund',
        details: result.error,
      });
    }

    return {
      success: true,
      data: {
        reference: result.reference,
        refundReference: result.refundReference,
        status: result.status,
        refundedAmount: result.amount,
      },
      message: 'Refund processed successfully',
    };
  }
}
