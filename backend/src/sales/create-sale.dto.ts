// create-sale.dto.ts
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MiscItemDto {
  item: string;
  qty: number;
  price: number;
  total: number;
}

export class SaleDetailDto {
  productId: number;
  quantity: number;
  price: number;
  total: number;
}

export class CreateSaleDto {
  totalAmount: number;
  paymentMethod: 'cash' | 'mpesa' | 'hybrid';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleDetailDto)
  details: SaleDetailDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MiscItemDto)
  miscItems?: MiscItemDto[];

  // ... other fields (cashierId, cashAmount, mpesaAmount, etc.)
  cashierId: number;
  cashRegisterId?: number;
  cashAmount?: number;
  mpesaAmount?: number;
  phone?: string;
}