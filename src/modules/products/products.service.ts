import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { InventoryService } from '../inventory/inventory.service';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private inventoryService: InventoryService,
    private pricingService: PricingService,
  ) {}

  async findAll(filters?: { category?: string }) {
    const where: any = { active: true };
    if (filters?.category) {
      where.category = filters.category;
    }
    return this.productRepository.find({ where });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findBySku(sku: string) {
    const product = await this.productRepository.findOneBy({ sku });
    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }
    return product;
  }

  async search(query: string) {
    return this.productRepository.find({
      where: [
        { name: Like(`%${query}%`), active: true },
        { description: Like(`%${query}%`), active: true },
        { category: Like(`%${query}%`), active: true },
      ],
    });
  }

  async getStockRealTime(id: string) {
    await this.findOne(id);
    const stock = await this.inventoryService.checkAvailability(id);
    return { id, stock };
  }

  async getPriceDynamic(id: string) {
    await this.findOne(id);
    const price = await this.pricingService.calculateDynamicPrice(id);
    return { id, price };
  }

  async reserveStock(id: string, quantity: number) {
    await this.findOne(id);
    return this.inventoryService.reserveStock(id, quantity);
  }

  async create(productData: Partial<Product>) {
    if (productData.stock && !productData.initialStock) {
      productData.initialStock = productData.stock;
    }
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async update(id: string, productData: Partial<Product>) {
    const product = await this.findOne(id);
    Object.assign(product, productData);
    return this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    product.active = false;
    return this.productRepository.save(product);
  }
}
