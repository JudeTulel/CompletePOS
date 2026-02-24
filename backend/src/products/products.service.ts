// products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    public readonly productRepository: Repository<Product>,
  ) {}

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(barcode : string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ barcode });
    if (!product) {
      throw new NotFoundException(`Product with id ${barcode} not found`);
    }
    return product;
  }

  async update(id: number, data: Partial<Product>): Promise<Product> {
    await this.productRepository.update(id, data);
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async search(q: string): Promise<Product[]> {
    // Simple search by name or description
    return this.productRepository.find({
      where: [
        { name: q },
        { description: q },
      ],
    });
  }

  async adjustStock(productId: number, adjustment: { quantity: number; reason: string }, manager?: any): Promise<Product> {
    const repo = manager ? manager.getRepository(Product) : this.productRepository;
    const product = await repo.findOne({ where: { id: productId } });
    if (!product) throw new Error('Product not found');
    const newStock = (product.stock || 0) + adjustment.quantity;
    if (newStock < 0) {
      throw new Error('Insufficient stock for this operation');
    }
    product.stock = newStock;
    // Optionally log the reason somewhere
    return repo.save(product);
  }

  async remove(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }
}