import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Product)
    private readonly productosRepository: Repository<Product>,
    private readonly inventoryService: InventoryService,
  ) {}

  async calculateDynamicPrice(productId: string): Promise<number> {
    const producto = await this.productosRepository.findOneBy({ id: productId });
    if (!producto) {
      throw new Error('Product no encontrado');
    }

    const currentStock = await this.inventoryService.checkAvailability(productId);
    const basePrice = Number(producto.price);

    // Lógica de precio dinámico: 
    // Si el stock es bajo (< 20% del inicial), el precio sube un 15%
    // Si el stock es muy bajo (< 5% del inicial), el precio sube un 30%
    const lowStockThreshold = producto.stockInicial * 0.2;
    const veryLowStockThreshold = producto.stockInicial * 0.05;
    
    if (currentStock <= veryLowStockThreshold && currentStock > 0) {
      return Math.round(basePrice * 1.3 * 100) / 100;
    }

    if (currentStock <= lowStockThreshold && currentStock > 0) {
      return Math.round(basePrice * 1.15 * 100) / 100;
    }

    return basePrice;
  }
}
