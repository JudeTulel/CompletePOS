import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cash } from './cash.entity';

@Injectable()
export class CashService {
  constructor(
    @InjectRepository(Cash)
    private readonly cashRepo: Repository<Cash>,
  ) {}

  async setOpening(opening: number): Promise<Cash> {
    const cash = this.cashRepo.create({ opening });
    return this.cashRepo.save(cash);
  }

  async setClosing(id: number, closing: number): Promise<Cash> {
    const cash = await this.cashRepo.findOne({ where: { id } });
    if (!cash) throw new Error('Cash record not found');
    cash.closing = closing;
    return this.cashRepo.save(cash);
  }

  async addCash(id: number, cashin:number , change:number): Promise<Cash> {
    const cash = await this.cashRepo.findOne({ where: { id } });
    if (!cash) throw new Error('Cash record not found');
    cash.cashin += cashin;
    cash.change -= change;
    return this.cashRepo.save(cash);
  }

  async findAll() {
    return this.cashRepo.find();
  }
}
