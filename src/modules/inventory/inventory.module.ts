import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../../entities/producto.entity';
import { InventoryService } from './inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
