import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './create-sale.dto';

@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) {}
    
    @Get()
    async getSales() {
        return this.salesService.findAll();
    }
    
    @Get('sale:id')
    async getSale(id: number) {
        return this.salesService.findOne(id);
    }
    
    @Post()
    async create(@Body() data: CreateSaleDto) {
        return this.salesService.create(data);
    }

    @Post('details')
    async createDetail(@Body() data: any) {
        return this.salesService.createDetail(data);
    }

    @Get('top-products')
    async getTopGrossingProducts(@Query('topN') topN?: string) {
        const n = topN ? parseInt(topN, 10) : 10;
        return this.salesService.getTopGrossingProducts(n);
    }

    @Get(':id/status')
    async getSaleStatus(@Param('id') id: string) {
        return this.salesService.getSaleStatus(Number(id));
    }
}
