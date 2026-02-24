import { Controller, Post, Body, Get } from '@nestjs/common';
import { RecommendedProductService } from './recommended-product.service';

@Controller('recommended-products')
export class RecommendedProductController {
  constructor(private readonly service: RecommendedProductService) {}

  @Post()
  async create(@Body('text') text: string) {
    return this.service.create(text);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }
}
