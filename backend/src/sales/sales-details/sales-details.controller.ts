import { Controller } from '@nestjs/common';
import { Body, Get, Post, Param, Put, Delete } from '@nestjs/common';
import { SalesDetailsService } from './sales-details.service';
import { SalesDetail } from './sales-details.entity';


@Controller('sales-details')
export class SalesDetailsController {
    constructor(private readonly salesDetailsService: SalesDetailsService) {}

    @Post()
    async create(@Body() salesDetailData: Partial<SalesDetail>): Promise<SalesDetail> {
        return this.salesDetailsService.create(salesDetailData);
    }

    @Get()
    async findAll(): Promise<SalesDetail[]> {
        return this.salesDetailsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<SalesDetail | null> {
        return this.salesDetailsService.findOne(Number(id));
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() updateData: Partial<SalesDetail>,
    ): Promise<SalesDetail | null> {
        return this.salesDetailsService.update(Number(id), updateData);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        return this.salesDetailsService.remove(Number(id));
    }
}