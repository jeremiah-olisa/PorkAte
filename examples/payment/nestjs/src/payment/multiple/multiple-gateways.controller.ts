/**
 * Multiple Gateways Controller
 *
 * REST API endpoints demonstrating how to use multiple payment gateways.
 * This controller provides examples of:
 * - Initiating payments with automatic gateway selection
 * - Verifying payments across gateways
 * - Checking gateway health and status
 * - Manual gateway selection
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  MultipleGatewaysService,
  type MultipleGatewayPaymentDto,
} from './multiple-gateways.service';

@Controller('api/payments/multiple')
export class MultipleGatewaysController {
  private readonly logger = new Logger(MultipleGatewaysController.name);

  constructor(
    private readonly multipleGatewaysService: MultipleGatewaysService,
  ) {}

  /**
   * GET /api/payments/multiple/health
   * Check the health status of all payment gateways
   */
  @Get('health')
  async getGatewayHealth() {
    try {
      const healthStatus =
        await this.multipleGatewaysService.getGatewayHealthStatus();
      return {
        success: true,
        data: healthStatus,
      };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Health check failed: ${error?.message}`);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to check gateway health',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/payments/multiple/gateways
   * List all available payment gateways
   */
  @Get('gateways')
  async getAvailableGateways() {
    try {
      const gateways = this.multipleGatewaysService.getAvailableGateways();
      const healthStatus =
        await this.multipleGatewaysService.getGatewayHealthStatus();

      return {
        success: true,
        data: {
          gateways,
          health: healthStatus,
        },
      };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to list gateways: ${error?.message}`);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to retrieve gateway information',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/payments/multiple/initiate
   * Initiate a payment with automatic gateway selection
   *
   * Example request body:
   * {
   *   "amount": 5000,
   *   "currency": "NGN",
   *   "email": "customer@example.com",
   *   "firstName": "John",
   *   "lastName": "Doe",
   *   "phone": "+2348012345678",
   *   "description": "Payment for order #123",
   *   "preferredGateway": "paystack", // optional
   *   "metadata": {
   *     "orderId": "123",
   *     "userId": "456"
   *   }
   * }
   */
  @Post('initiate')
  async initiatePayment(@Body() dto: MultipleGatewayPaymentDto) {
    try {
      this.logger.log(
        `Initiating payment for ${dto.email} - Amount: ${dto.amount} ${dto.currency}`,
      );

      const result = await this.multipleGatewaysService.initiatePayment(dto);

      return {
        success: true,
        data: result,
        message: 'Payment initiated successfully',
      };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Payment initiation failed: ${error?.message}`);
      throw new HttpException(
        {
          success: false,
          error: error?.message || 'Payment initiation failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * GET /api/payments/multiple/verify/:reference
   * Verify a payment transaction
   * This endpoint tries all available gateways to find and verify the payment
   */
  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    try {
      this.logger.log(`Verifying payment: ${reference}`);

      const result =
        await this.multipleGatewaysService.verifyPayment(reference);

      return {
        success: true,
        data: result,
      };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Payment verification failed: ${error?.message}`);
      throw new HttpException(
        {
          success: false,
          error: error?.message || 'Payment verification failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * GET /api/payments/multiple/:reference
   * Get payment details by reference
   */
  @Get(':reference')
  async getPayment(@Param('reference') reference: string) {
    try {
      this.logger.log(`Getting payment details: ${reference}`);

      const result = await this.multipleGatewaysService.getPayment(reference);

      return {
        success: true,
        data: result,
      };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to get payment details: ${error?.message}`);
      throw new HttpException(
        {
          success: false,
          error: error?.message || 'Payment not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * POST /api/payments/multiple/initiate-with-gateway
   * Initiate payment with specific gateway (for testing purposes)
   * Query parameter: gateway=paystack|flutterwave|stripe
   */
  @Post('initiate-with-gateway')
  async initiateWithSpecificGateway(
    @Body() dto: MultipleGatewayPaymentDto,
    @Query('gateway') gateway: string,
  ) {
    try {
      this.logger.log(`Initiating payment with specific gateway: ${gateway}`);

      // Override the preferred gateway
      const paymentDto = { ...dto, preferredGateway: gateway };

      const result =
        await this.multipleGatewaysService.initiatePayment(paymentDto);

      return {
        success: true,
        data: result,
        message: `Payment initiated with ${gateway}`,
      };
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Payment initiation with ${gateway} failed: ${error?.message}`,
      );
      throw new HttpException(
        {
          success: false,
          error: error?.message || `Payment initiation with ${gateway} failed`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
