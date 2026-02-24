import { Controller, Post, Body } from '@nestjs/common';
import { PrinterService } from './printer.service';

@Controller('printer')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}

 // @Post('misc')
 // async addMisc(@Body() payload: { saleId: number; misc: Array<{ item: string; qty: number; price: number; total: number }> }) {
  //  this.printerService.setMiscForSale(payload.saleId, payload.misc);
  //  return { status: 'ok' };
  //}
}
