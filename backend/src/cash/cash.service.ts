import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Cash } from './cash.entity';

@Injectable()
export class CashService {
  constructor(
    @InjectRepository(Cash)
    private readonly cashRepo: Repository<Cash>,
  ) { }

  async setOpening(opening: number): Promise<Cash> {
    let cash = await this.cashRepo.findOne({ where: { id: 1 } });
    if (cash) {
      cash.opening = opening;
      cash.closing = 0;
      cash.cashin = 0;
      cash._change = 0;
    } else {
      cash = this.cashRepo.create({ id: 1, opening, closing: 0, cashin: 0, _change: 0 });
    }
    return this.cashRepo.save(cash);
  }


  async setClosing(id: number, closing: number): Promise<Cash> {
    const cash = await this.cashRepo.findOne({ where: { id } });
    if (!cash) throw new Error('Cash record not found');
    cash.closing = closing;
    return this.cashRepo.save(cash);
  }

  async addCash(id: number, cashin: number, change: number, manager?: EntityManager): Promise<Cash> {
    const repo = manager ? manager.getRepository(Cash) : this.cashRepo;
    const cash = await repo.findOne({ where: { id } });
    if (!cash) throw new Error('Cash record not found');
    
    // Convert to numbers to ensure correct arithmetic (decimal columns can return strings)
    cash.cashin = Number(cash.cashin) + Number(cashin);
    cash._change = Number(cash._change) - Number(change);
    
    return repo.save(cash);
  }

  async findAll() {
    return this.cashRepo.find();
  }
}
