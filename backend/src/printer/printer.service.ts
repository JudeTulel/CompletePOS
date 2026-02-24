import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

interface MiscItem {
  item: string;
  qty: number;
  price: number;
  total: number;
}

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);
  private miscMap: Map<number, MiscItem[]> = new Map();

  constructor(
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  setMiscForSale(saleId: number, misc: MiscItem[]) {
    this.miscMap.set(saleId, misc);
  }

  async printReceipt(sale: any): Promise<void> {
    return new Promise(async (resolve) => {
      try {
        const device = new escpos.USB();
        const printer = new escpos.Printer(device);
        device.open(async (err: any) => {
          if (err) {
            this.logger.error('Printer connection failed:', err);
            return resolve();
          }
          
          // Header with smaller font (3x smaller = size 0,0)
          printer
            .font('a')
            .align('ct')
            .style('normal')
            .size(0, 0) // Much smaller font
            .text('KAPEVIEW SALES RECEIPT')
            .text('========================================')
            .align('lt')
            .text(`Sale ID: ${sale.saleId}`)
            .text(`Date: ${sale.saleDate}`)
            .text('========================================');

          // Column headers with proper spacing for small font
          const headerLine = 'Item Name       Qty  Price    Total';
          printer.text(headerLine);
          printer.text('----------------------------------------');

          // Product details with improved alignment and product name lookup
          for (const detail of sale.details) {
            let productName = detail.product?.name || detail.name || '';
            if (!productName && detail.product?.id) {
              try {
                const product = await this.productsService.update(detail.product.id, {});
                productName = product?.name || '';
              } catch (e) {
                productName = '';
              }
            }
            productName = productName.substring(0, 15);
            const paddedName = productName.padEnd(15);
            const qty = String(detail.quantity || 0).padStart(4);
            const price = Number(detail.price || 0).toFixed(2).padStart(8);
            const total = Number(detail.total || 0).toFixed(2).padStart(9);
            
            printer.text(`${paddedName} ${qty} ${price} ${total}`);
          }

          printer.text('----------------------------------------');
          
          // Miscellaneous items section
          const misc = this.miscMap.get(sale.saleId);
          printer.text('Miscellaneous Items:');
          
          if (misc && misc.length > 0) {
            for (const m of misc) {
              const itemName = (m.item || '').substring(0, 15);
              const paddedName = itemName.padEnd(15);
              const qty = String(m.qty || 0).padStart(4);
              const price = Number(m.price || 0).toFixed(2).padStart(8);
              const total = Number(m.total || 0).toFixed(2).padStart(9);
              
              printer.text(`${paddedName} ${qty} ${price} ${total}`);
            }
          } else {
            printer.text('None');
          }

          // Footer with totals
          printer
            .text('========================================')
            .align('rt')
            .text(`TOTAL: ${Number(sale.totalAmount || 0).toFixed(2)}`)
            .text(`Payment: ${sale.paymentMethod || 'N/A'}`)
            .text('========================================')
            .align('ct')
            .text('Thank you for your business!')
            .text('All goods are inclusive of VAT')
            .text('Visit us again!')
            .feed(3)
            .cut()
            .close();
            
          this.miscMap.delete(sale.saleId);
          resolve();
        });
      } catch (err) {
        this.logger.error('Failed to initialize printer', err);
        resolve();
      }
    });
  }
}