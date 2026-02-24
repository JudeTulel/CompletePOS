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
      if (data.cashAmount && data.cashRegisterId) {
        await this.cashService.addCash(data.cashRegisterId, data.cashAmount, 0);
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
}
