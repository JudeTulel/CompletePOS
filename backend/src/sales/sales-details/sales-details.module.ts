import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesDetail } from './sales-details.entity';
import { SalesDetailsService } from './sales-details.service';
import { SalesDetailsController } from './sales-details.controller';
import { ProductsModule } from '../../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([SalesDetail]), forwardRef(() => ProductsModule)],
  controllers: [SalesDetailsController],
  providers: [SalesDetailsService],
})
export class SalesDetailsModule {}