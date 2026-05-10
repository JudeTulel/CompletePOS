import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './sales.entity';
import { SalesDetailsService } from './sales-details/sales-details.service';
import { SalesDetail } from './sales-details/sales-details.entity';
import { CreateSaleDto } from './create-sale.dto';
import { CashService } from '../cash/cash.service';
import { MpesaService } from '../mpesa/mpesa.service';
import { PrinterService } from '../printer/printer.service';

@Injectable()
export class SalesService {
    private readonly logger = new Logger(SalesService.name);
    constructor(
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>,
        private readonly salesDetailsService: SalesDetailsService,
        private readonly dataSource: DataSource,
        private readonly cashService: CashService,
        private readonly mpesaService: MpesaService,
        private readonly printerService: PrinterService,
    ) {}

    async create(createSaleDto: CreateSaleDto) {
        return this.processAllSaleOperations(createSaleDto);
    }

    // sales.service.ts
async processAllSaleOperations(data: CreateSaleDto) {
  return this.dataSource.transaction(async manager => {
    this.logger.log('Starting sale transaction');
    const saleRepo = manager.getRepository(Sale);
    const detailRepo = manager.getRepository(SalesDetail);

    // 1. Save the sale
    const sale = saleRepo.create({
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      cashierId: data.cashierId,
      cashAmount: data.cashAmount,
      mpesaAmount: data.mpesaAmount,
      phone: data.phone,
      cashRegisterId: data.cashRegisterId,
      status: 'pending',
    });
    const savedSale = await saleRepo.save(sale);
    this.logger.log(`Sale created with ID ${savedSale.saleId}`);

    // 2. Save sale details (products)
    const details: SalesDetail[] = [];
    for (const d of data.details) {
      const product = await this.salesDetailsService.productsService.productRepository.findOne({
        where: { id: d.productId },
      });
      details.push(
        detailRepo.create({
          sale: savedSale,
          product: { id: d.productId },
          name: product?.name || '',
          quantity: d.quantity,
          price: d.price,
          total: d.total,
        }),
      );
    }

    // 3. Add miscellaneous items as sale details (without product reference)
    for (const misc of data.miscItems || []) {
      details.push(
        detailRepo.create({
          sale: savedSale,
          product:  { id: 1039 }, // or a special "misc" product if you have one
          name: misc.item,
          quantity: misc.qty,
          price: misc.price,
          total: misc.total,
        }),
      );
    }

    await detailRepo.save(details);
    this.logger.log('Sale details saved');

    // 4. Update stock (only for real products)
    for (const d of data.details) {
      await this.salesDetailsService.productsService.adjustStock(
        d.productId,
        { quantity: -d.quantity, reason: 'sale' },
        manager,
      );
    }
    this.logger.log('Product stock updated');

    // 5. Handle payments
    try {
      const regId = data.cashRegisterId || 1; // Default to ID 1 as requested
      if ((data.paymentMethod === 'cash' || data.paymentMethod === 'hybrid') && data.cashAmount) {
        // Calculate change: if it's a pure cash sale, change is (cashAmount - totalAmount)
        const change = data.paymentMethod === 'cash' 
          ? Math.max(0, Number(data.cashAmount) - Number(data.totalAmount))
          : 0;
        
        await this.cashService.addCash(regId, data.cashAmount, change, manager);
        this.logger.log(`Added cash to register ${regId}: in=${data.cashAmount}, change=${change}`);
      }
      if (data.mpesaAmount && data.phone) {
        await this.mpesaService.addBalance(data.mpesaAmount, data.phone);
      }
      savedSale.status = 'completed';
      await saleRepo.save(savedSale);
      this.logger.log('Sale completed');

      // 6. Print receipt (misc items are now part of details)
      await this.printerService.printReceipt({
        ...savedSale,
        details,
      });
      this.logger.log('Receipt printed successfully');
    } catch (err) {
      this.logger.error('Payment or print failed', err);
      savedSale.status = 'failed';
      await saleRepo.save(savedSale);
      throw err;
    }
    return savedSale;
  });
}

    async getSaleStatus(id: number) {
        const sale = await this.saleRepository.findOneBy({ saleId: id });
        if (!sale) return { status: 'not_found' };
        return { status: sale.status };
    }

    async createDetail(data: any) {
        // Create the sales detail
        const createdDetail = await this.salesDetailsService.create(data);
        // Decrement stock after creating the detail
        if (data.product && data.quantity) {
            await this.salesDetailsService.productsService.adjustStock(data.product.id, { quantity: -data.quantity, reason: 'sale' });
        }
        return createdDetail;
    }
    async getTopGrossingProducts(topN: number = 10): Promise<Array<{ productId: number; productName: string; totalQuantity: number }>> {
        const detailRepo = this.dataSource.getRepository(SalesDetail);
        const results = await detailRepo
            .createQueryBuilder('detail')
            .select('detail.product', 'productId')
            .addSelect('product.name', 'productName')
            .addSelect('SUM(detail.quantity)', 'totalQuantity')
            .innerJoin('detail.product', 'product')
            .groupBy('detail.product')
            .orderBy('totalQuantity', 'DESC')
            .limit(topN)
            .getRawMany();

        return results.map(r => ({
            productId: r.productId,
            productName: r.productName,
            totalQuantity: parseInt(r.totalQuantity, 10),
        }));
    }

    async findAll(): Promise<Sale[]> {
        return this.saleRepository.find({ relations: ['details'] });
    }

    async findOne(saleId: number): Promise<Sale | null> {
        return this.saleRepository.findOne({ where: { saleId }, relations: ['details'] });
    }

    // ==================== REPORTING METHODS ====================

    async getSalesReport(startDate: Date, endDate: Date, granularity: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily') {
        const detailRepo = this.dataSource.getRepository(SalesDetail);
        
        let dateFormat: string;
        switch (granularity) {
            case 'hourly':
                dateFormat = '%Y-%m-%d %H:00';
                break;
            case 'weekly':
                dateFormat = '%Y-%W';
                break;
            case 'monthly':
                dateFormat = '%Y-%m';
                break;
            case 'daily':
            default:
                dateFormat = '%Y-%m-%d';
        }

        const results = await detailRepo
            .createQueryBuilder('detail')
            .select(`DATE_FORMAT(sale.saleDate, '${dateFormat}')`, 'period')
            .addSelect('COUNT(DISTINCT sale.saleId)', 'transactions')
            .addSelect('SUM(detail.total)', 'sales')
            .addSelect('SUM(detail.quantity * (detail.price - COALESCE(product.cost, 0)))', 'profit')
            .innerJoin('detail.sale', 'sale')
            .leftJoin('detail.product', 'product')
            .where('sale.saleDate >= :startDate', { startDate })
            .andWhere('sale.saleDate <= :endDate', { endDate })
            .andWhere('sale.status = :status', { status: 'completed' })
            .groupBy(`DATE_FORMAT(sale.saleDate, '${dateFormat}')`)
            .orderBy('period', 'ASC')
            .getRawMany();

        return results.map(r => ({
            period: r.period,
            sales: parseFloat(r.sales) || 0,
            transactions: parseInt(r.transactions, 10) || 0,
            profit: parseFloat(r.profit) || 0,
            margin: r.sales ? ((parseFloat(r.profit) / parseFloat(r.sales)) * 100).toFixed(2) : '0.00',
        }));
    }

    async getProductPerformanceReport(startDate: Date, endDate: Date, topN: number = 10) {
        const detailRepo = this.dataSource.getRepository(SalesDetail);

        const results = await detailRepo
            .createQueryBuilder('detail')
            .select('detail.product', 'productId')
            .addSelect('product.name', 'productName')
            .addSelect('SUM(detail.quantity)', 'totalQuantitySold')
            .addSelect('SUM(detail.total)', 'totalRevenue')
            .addSelect('SUM(detail.quantity * (detail.price - COALESCE(product.cost, 0)))', 'totalProfit')
            .addSelect('product.price', 'unitPrice')
            .addSelect('product.cost', 'unitCost')
            .innerJoin('detail.sale', 'sale')
            .leftJoin('detail.product', 'product')
            .where('sale.saleDate >= :startDate', { startDate })
            .andWhere('sale.saleDate <= :endDate', { endDate })
            .andWhere('sale.status = :status', { status: 'completed' })
            .groupBy('detail.product')
            .orderBy('totalRevenue', 'DESC')
            .limit(topN)
            .getRawMany();

        return results.map(r => ({
            productId: r.productId,
            productName: r.productName,
            sold: parseInt(r.totalQuantitySold, 10) || 0,
            revenue: parseFloat(r.totalRevenue) || 0,
            profit: parseFloat(r.totalProfit) || 0,
            unitPrice: parseFloat(r.unitPrice) || 0,
            unitCost: parseFloat(r.unitCost) || 0,
            margin: r.totalRevenue ? ((parseFloat(r.totalProfit) / parseFloat(r.totalRevenue)) * 100).toFixed(2) : '0.00',
        }));
    }

    async getFinancialSummary(startDate: Date, endDate: Date) {
        const detailRepo = this.dataSource.getRepository(SalesDetail);

        const results = await detailRepo
            .createQueryBuilder('detail')
            .select('SUM(detail.total)', 'totalRevenue')
            .addSelect('SUM(detail.quantity * COALESCE(product.cost, 0))', 'totalCost')
            .addSelect('SUM(detail.quantity * (detail.price - COALESCE(product.cost, 0)))', 'totalProfit')
            .addSelect('COUNT(DISTINCT sale.saleId)', 'totalTransactions')
            .addSelect('SUM(detail.quantity)', 'totalItemsSold')
            .innerJoin('detail.sale', 'sale')
            .leftJoin('detail.product', 'product')
            .where('sale.saleDate >= :startDate', { startDate })
            .andWhere('sale.saleDate <= :endDate', { endDate })
            .andWhere('sale.status = :status', { status: 'completed' })
            .getRawOne();

        const revenue = parseFloat(results.totalRevenue) || 0;
        const cost = parseFloat(results.totalCost) || 0;
        const profit = parseFloat(results.totalProfit) || 0;
        const transactions = parseInt(results.totalTransactions, 10) || 0;
        const itemsSold = parseInt(results.totalItemsSold, 10) || 0;

        return {
            revenue,
            cost,
            profit,
            margin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : '0.00',
            transactions,
            itemsSold,
            averageTransactionValue: transactions > 0 ? (revenue / transactions).toFixed(2) : '0.00',
            averageItemPrice: itemsSold > 0 ? (revenue / itemsSold).toFixed(2) : '0.00',
        };
    }

    async getPaymentMethodBreakdown(startDate: Date, endDate: Date) {
        const saleRepo = this.saleRepository;

        const results = await saleRepo
            .createQueryBuilder('sale')
            .select('sale.paymentMethod', 'method')
            .addSelect('COUNT(sale.saleId)', 'count')
            .addSelect('SUM(sale.totalAmount)', 'amount')
            .where('sale.saleDate >= :startDate', { startDate })
            .andWhere('sale.saleDate <= :endDate', { endDate })
            .andWhere('sale.status = :status', { status: 'completed' })
            .groupBy('sale.paymentMethod')
            .getRawMany();

        return results.map(r => ({
            method: r.method,
            count: parseInt(r.count, 10) || 0,
            amount: parseFloat(r.amount) || 0,
        }));
    }

    async getSalesTrend(startDate: Date, endDate: Date) {
        const detailRepo = this.dataSource.getRepository(SalesDetail);

        const results = await detailRepo
            .createQueryBuilder('detail')
            .select('DATE(sale.saleDate)', 'date')
            .addSelect('SUM(detail.total)', 'daily_revenue')
            .addSelect('COUNT(DISTINCT sale.saleId)', 'daily_transactions')
            .addSelect('SUM(detail.quantity * (detail.price - COALESCE(product.cost, 0)))', 'daily_profit')
            .innerJoin('detail.sale', 'sale')
            .leftJoin('detail.product', 'product')
            .where('sale.saleDate >= :startDate', { startDate })
            .andWhere('sale.saleDate <= :endDate', { endDate })
            .andWhere('sale.status = :status', { status: 'completed' })
            .groupBy('DATE(sale.saleDate)')
            .orderBy('date', 'ASC')
            .getRawMany();

        return results.map(r => ({
            date: r.date,
            revenue: parseFloat(r.daily_revenue) || 0,
            transactions: parseInt(r.daily_transactions, 10) || 0,
            profit: parseFloat(r.daily_profit) || 0,
        }));
    }
}
