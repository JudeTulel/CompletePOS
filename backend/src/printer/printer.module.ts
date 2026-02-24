import { Module, forwardRef } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [forwardRef(() => ProductsModule)],
  providers: [PrinterService],
  exports: [PrinterService],
})
export class PrinterModule {}
