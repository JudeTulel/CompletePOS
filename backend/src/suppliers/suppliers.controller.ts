import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './suppliers.entity'; // Adjust the path if needed
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async findAll() {
    return this.suppliersService.findAll();
  }

  @Post()
  async create(@Body() data: Partial<Supplier>) {
    return this.suppliersService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Supplier>) {
    return this.suppliersService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.suppliersService.remove(Number(id));
    return { message: `Supplier with id ${id} deleted successfully` };
  }
}
