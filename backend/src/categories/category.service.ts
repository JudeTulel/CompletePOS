import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(data: Partial<Category>): Promise<Category> {
    const category = this.categoryRepo.create(data);
    return this.categoryRepo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find();
  }

  async update(id: number, data: Partial<Category>): Promise<Category> {
    await this.categoryRepo.update(id, data);
    const updated = await this.categoryRepo.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Category with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepo.delete(id);
  }
}
