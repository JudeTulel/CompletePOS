import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() data: { name: string; description?: string }) {
    return this.service.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: { name: string; description?: string }) {
    return this.service.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.service.remove(Number(id));
  }
}
