import { Controller, Post, Get, Body, BadRequestException } from '@nestjs/common';
import { MpesaService } from './mpesa.service';

@Controller('mpesa')
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  /**
   * GET /mpesa/balance
   * Returns the current local Mpesa float balance.
   */
  @Get('balance')
  async getBalance() {
    const balance = await this.mpesaService.getBalance();
    return { balance };
  }

  /**
   * POST /mpesa/deposit
   * Add to the local Mpesa float balance.
   */
  @Post('deposit')
  async addBalance(@Body() payload: { amount: number; phoneNumber?: string }) {
    if (payload.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    return this.mpesaService.addBalance(payload.amount, payload.phoneNumber);
  }

  /**
   * POST /mpesa/withdraw
   * Deduct from the local Mpesa float balance.
   */
  @Post('withdraw')
  async deductBalance(@Body() payload: { amount: number; phoneNumber?: string }) {
    if (payload.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    return this.mpesaService.deductBalance(payload.amount, payload.phoneNumber);
  }

  /**
   * GET /mpesa/transactions
   * Returns the last 50 Mpesa float transactions.
   */
  @Get('transactions')
  async getTransactions() {
    return this.mpesaService.getTransactionHistory();
  }
}
