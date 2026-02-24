import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendedProduct } from './recommended-product.entity';

@Injectable()
export class RecommendedProductService {
  constructor(
    @InjectRepository(RecommendedProduct)
    private readonly recommendedRepo: Repository<RecommendedProduct>,
  ) {}

  async create(text: string): Promise<RecommendedProduct> {
    const rec = this.recommendedRepo.create({ text });
    return this.recommendedRepo.save(rec);
  }

  async findAll(): Promise<RecommendedProduct[]> {
    return this.recommendedRepo.find({ order: { createdAt: 'DESC' } });
  }
}
