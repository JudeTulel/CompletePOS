// products.controller.ts
import { Controller, Get, Post, Put, Param, Body, Query, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() data: Partial<Product>): Promise<Product> {
    return this.productsService.create(data);
  }

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get('barcode/:barcode')
  async findByBarcode(@Param('barcode') barcode: string): Promise<Product> {
    return this.productsService.findOne(barcode);
  }

  @Get('search')
  async search(@Query('q') q: string): Promise<Product[]> {
    return this.productsService.search(q);
  }

  @Post(':productId/adjust-stock')
  async adjustStock(
    @Param('productId') productId: number,
    @Body() adjustment: { quantity: number; reason: string },
  ): Promise<Product> {
    return this.productsService.adjustStock(productId, adjustment);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: Partial<Product>): Promise<Product> {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.productsService.remove(id);
  }
}