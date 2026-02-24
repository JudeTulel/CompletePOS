import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';5
import { Supplier } from './suppliers.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.find();
  }

  async create(data: Partial<Supplier>): Promise<Supplier> {
    const supplier = this.suppliersRepository.create(data);
    return this.suppliersRepository.save(supplier);
  }

  async update(id: number, data: Partial<Supplier>): Promise<Supplier> {
    await this.suppliersRepository.update(id, data);
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new Error(`Supplier with id ${id} not found`);
    }
    return supplier;
  }

  async remove(id: number): Promise<void> {
    await this.suppliersRepository.delete(id);
  }
}
