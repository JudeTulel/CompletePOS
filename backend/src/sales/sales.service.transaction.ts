import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './sales.entity';
import { SalesDetailsService } from './sales-details/sales-details.service';
import { SalesDetail } from './sales-details/sales-details.entity';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>,
        private readonly salesDetailsService: SalesDetailsService,
        private readonly dataSource: DataSource,
    ) {}

    async create(data: { totalAmount: number; paymentMethod: string; cashierId?: number; details: Array<{ productId: number; quantity: number; price: number; total: number; }> }) {
        // Only create sale and sale details, no stock decrement
        return this.dataSource.transaction(async manager => {
            const saleRepo = manager.getRepository(Sale);
            const detailRepo = manager.getRepository(SalesDetail);

            const sale = saleRepo.create({
                totalAmount: data.totalAmount,
                paymentMethod: data.paymentMethod,
                cashierId: data.cashierId,
            });
            const savedSale = await saleRepo.save(sale);

            const details = data.details.map(d =>
                detailRepo.create({
                    sale: savedSale,
                    product: { id: d.productId },
                    quantity: d.quantity,
                    price: d.price,
                    total: d.total,
                })
            );
            await detailRepo.save(details);
            return savedSale;
        });
    }

    /**
     * Returns the top N most grossing products by total quantity sold.
     * @param topN Number of top products to return (default 10)
     * @returns Array of { productId, productName, totalQuantity }
     */
    async getTopGrossingProducts(topN: number = 10): Promise<Array<{ productId: number; productName: string; totalQuantity: number }>> {
        const detailRepo = this.dataSource.getRepository(SalesDetail);
        const results = await detailRepo
            .createQueryBuilder('detail')
            .select('detail.product', 'productId')
            .addSelect('product.name', 'productName')
            .addSelect('SUM(detail.quantity)', 'totalQuantity')
            .innerJoin('detail.product', 'product')
            .groupBy('detail.product')
            .addGroupBy('product.name')
            .orderBy('totalQuantity', 'DESC')
            .limit(topN)
            .getRawMany();
        return results.map(r => ({
            productId: Number(r.productId),
            productName: r.productName,
            totalQuantity: Number(r.totalQuantity),
        }));
    }
}
