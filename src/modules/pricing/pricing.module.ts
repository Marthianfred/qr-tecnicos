import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { PricingService } from './pricing.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    InventoryModule,
  ],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
