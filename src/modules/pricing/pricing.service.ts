import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly inventoryService: InventoryService,
  ) {}

  async calculateDynamicPrice(productId: string): Promise<number> {
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new Error('Product not found');
    }

    const currentStock = await this.inventoryService.checkAvailability(productId);
    const basePrice = Number(product.price);

    
    
    
    const lowStockThreshold = product.initialStock * 0.2;
    const veryLowStockThreshold = product.initialStock * 0.05;
    
    if (currentStock <= veryLowStockThreshold && currentStock > 0) {
      return Math.round(basePrice * 1.3 * 100) / 100;
    }

    if (currentStock <= lowStockThreshold && currentStock > 0) {
      return Math.round(basePrice * 1.15 * 100) / 100;
    }

    return basePrice;
  }
}
