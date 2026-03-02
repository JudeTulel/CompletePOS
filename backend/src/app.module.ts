import { Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { UsersModule } from './users/users.module';
import { SalesModule } from './sales/sales.module';
import { MpesaModule } from './mpesa/mpesa.module';
import { UploadsModule } from './uploads/uploads.module';
import { CashModule } from './cash/cash.module';
import { CategoryModule } from './categories/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: 'pos.sqlite',
        autoLoadEntities: true,
        synchronize: true, // Always sync for desktop app
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    SuppliersModule,
    UsersModule,
    SalesModule,
    MpesaModule,
    UploadsModule,
    CashModule,
    CategoryModule,
  ],
  providers: [],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name);

  onApplicationBootstrap() {
    this.logger.log('Database connection established successfully.');
  }
}