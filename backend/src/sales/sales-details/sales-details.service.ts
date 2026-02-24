import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesDetail } from './sales-details.entity';
import { ProductsService } from '../../products/products.service';

@Injectable()
export class SalesDetailsService {
    constructor(
        @InjectRepository(SalesDetail)
        private readonly salesDetailRepository: Repository<SalesDetail>,
        @Inject(forwardRef(() => ProductsService))
        public readonly productsService: ProductsService,
    ) {}

    async create(salesDetailData: Partial<SalesDetail>): Promise<SalesDetail> {
        const salesDetail = this.salesDetailRepository.create(salesDetailData);
        const savedDetail = await this.salesDetailRepository.save(salesDetail);
        // Decrement product stock after sale detail is created
        if (savedDetail.product && savedDetail.quantity) {
            await this.productsService.adjustStock(savedDetail.product.id, { quantity: -savedDetail.quantity, reason: 'sale' });
        }
        return savedDetail;
    }

    async findAll(): Promise<SalesDetail[]> {
        return this.salesDetailRepository.find();
    }

    async findOne(id: number): Promise<SalesDetail | null> {
        return this.salesDetailRepository.findOne({ where: { id } });
    }

    async update(id: number, updateData: Partial<SalesDetail>): Promise<SalesDetail | null> {
        await this.salesDetailRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.salesDetailRepository.delete(id);
    }

    async adjustProductStock(productId: number, quantity: number, reason: string) {
        // Decrement or increment product stock using ProductsService
        await this.productsService.adjustStock(productId, { quantity, reason });
    }

    async findBySaleId(saleId: number): Promise<SalesDetail[]> {
        return this.salesDetailRepository.find({
            where: { sale: { saleId } },
            relations: ['product', 'sale'],
        });
    }
}