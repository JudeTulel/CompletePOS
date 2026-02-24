// products.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { RecommendedProduct } from './recommended-product.entity';
import { RecommendedProductService } from './recommended-product.service';
import { RecommendedProductController } from './recommended-product.controller';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, RecommendedProduct]),
    forwardRef(() => SalesModule),
  ],
  controllers: [ProductsController, RecommendedProductController],
  providers: [ProductsService, RecommendedProductService],
  exports: [ProductsService],
})
export class ProductsModule {}