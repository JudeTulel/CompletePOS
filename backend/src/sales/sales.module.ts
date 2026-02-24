import { Module, forwardRef } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SalesDetailsService } from './sales-details/sales-details.service';
import { SalesDetailsController } from './sales-details/sales-details.controller';
import { SalesDetailsModule } from './sales-details/sales-details.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './sales.entity';
import { SalesDetail } from './sales-details/sales-details.entity';
import { ProductsModule } from '../products/products.module';
import { CashModule } from '../cash/cash.module';
import { MpesaModule } from '../mpesa/mpesa.module';
import { PrinterModule } from '../printer/printer.module';

@Module({
  controllers: [SalesController, SalesDetailsController],
  providers: [SalesService, SalesDetailsService],
  imports: [
    SalesDetailsModule,
    TypeOrmModule.forFeature([Sale, SalesDetail]),
    forwardRef(() => ProductsModule),
    CashModule,
    MpesaModule,
    PrinterModule,
  ],
})
export class SalesModule {}
