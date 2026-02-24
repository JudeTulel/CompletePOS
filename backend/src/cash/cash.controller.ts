import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { CashService } from './cash.service';

@Controller('cash')
export class CashController {
  constructor(private readonly service: CashService) {}

  @Post('opening')
  async setOpening(@Body('opening') opening: number) {
    return this.service.setOpening(opening);
  }

  @Post('closing/:id')
  async setClosing(@Param('id') id: number, @Body('closing') closing: number) {
    return this.service.setClosing(Number(id), closing);
  }

  @Post('add/:id')
  async addCash(
    @Param('id') id: number,
    @Body('cashin') cashin: number,
    @Body('change') change: number,
  ) {
    return this.service.addCash(Number(id), cashin, change);
  }

  @Get()
  async getAll() {
    return this.service.findAll();
  }
}
