import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../../entities/producto.entity';
import { PricingService } from './pricing.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    InventoryModule,
  ],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
