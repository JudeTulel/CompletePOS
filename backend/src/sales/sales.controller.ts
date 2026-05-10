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
    
    @Get('sale/:id')
    async getSale(@Param('id') id: string) {
        return this.salesService.findOne(Number(id));
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

    // ==================== REPORTING ENDPOINTS ====================

    @Get('reports/sales')
    async getSalesReport(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('granularity') granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly',
    ) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return this.salesService.getSalesReport(start, end, granularity || 'daily');
    }

    @Get('reports/products')
    async getProductPerformanceReport(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('topN') topN?: string,
    ) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const n = topN ? parseInt(topN, 10) : 10;
        return this.salesService.getProductPerformanceReport(start, end, n);
    }

    @Get('reports/financial')
    async getFinancialSummary(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return this.salesService.getFinancialSummary(start, end);
    }

    @Get('reports/payment-methods')
    async getPaymentMethodBreakdown(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return this.salesService.getPaymentMethodBreakdown(start, end);
    }

    @Get('reports/trend')
    async getSalesTrend(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return this.salesService.getSalesTrend(start, end);
    }
}
