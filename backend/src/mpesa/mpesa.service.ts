import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MpesaBalance } from './mpesa-balance.entity';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);

  constructor(
    @InjectRepository(MpesaBalance)
    private mpesaBalanceRepo: Repository<MpesaBalance>,
  ) {}

  async getBalance(): Promise<number> {
    // Find the latest record, or create one if table is empty
    let latest = await this.mpesaBalanceRepo.findOne({
      where: {},
      order: { id: 'DESC' },
    });
    if (!latest) {
      this.logger.warn('MpesaBalance table is empty, initializing with 0 balance');
      latest = await this.mpesaBalanceRepo.save(this.mpesaBalanceRepo.create({ balance: 0, lastTransaction: 0, transactionType: 'init' }));
    }
    return Number(latest.balance) || 0;
  }

  async addBalance(amount: number, phoneNumber?: string): Promise<{ balance: number; transaction: MpesaBalance }> {
    if (typeof amount !== 'number' || isNaN(amount)) {
      this.logger.error('Amount must be a number');
      throw new BadRequestException('Amount must be a number');
    }
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    const currentBalance = await this.getBalance();
    const mpesaBalance = this.mpesaBalanceRepo.create({
      balance: currentBalance + amount,
      lastTransaction: amount,
      transactionType: 'credit',
      phoneNumber,
    });
    const saved = await this.mpesaBalanceRepo.save(mpesaBalance);
    this.logger.log(`Deposited ${amount}. New balance: ${saved.balance}`);
    return { balance: Number(saved.balance), transaction: saved };
  }

  async deductBalance(amount: number, phoneNumber?: string): Promise<{ balance: number; transaction: MpesaBalance }> {
    if (typeof amount !== 'number' || isNaN(amount)) {
      this.logger.error('Amount must be a number');
      throw new BadRequestException('Amount must be a number');
    }
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    const currentBalance = await this.getBalance();
    if (currentBalance < amount) {
      this.logger.warn(`Attempted to withdraw ${amount} with only ${currentBalance} available.`);
      throw new BadRequestException('Insufficient Mpesa float balance');
    }
    const mpesaBalance = this.mpesaBalanceRepo.create({
      balance: currentBalance - amount,
      lastTransaction: -amount,
      transactionType: 'debit',
      phoneNumber,
    });
    const saved = await this.mpesaBalanceRepo.save(mpesaBalance);
    this.logger.log(`Withdrew ${amount}. New balance: ${saved.balance}`);
    return { balance: Number(saved.balance), transaction: saved };
  }

  async getTransactionHistory(): Promise<MpesaBalance[]> {
    return this.mpesaBalanceRepo.find({
      order: { createdAt: 'DESC' },
      take: 50, // Last 50 transactions
    });
  }
}
