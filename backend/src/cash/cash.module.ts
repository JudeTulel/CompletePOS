import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cash } from './cash.entity';
import { CashService } from './cash.service';
import { CashController } from './cash.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cash])],
  providers: [CashService],
  controllers: [CashController],
  exports: [CashService],
})
export class CashModule {}
