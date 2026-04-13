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
    private productosRepository: Repository<Product>,
    private inventoryService: InventoryService,
    private pricingService: PricingService,
  ) {}

  async findAll(filters?: { categoria?: string }) {
    const where: any = { active: true };
    if (filters?.categoria) {
      where.categoria = filters.categoria;
    }
    return this.productosRepository.find({ where });
  }

  async findOne(id: string) {
    const producto = await this.productosRepository.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`Product con ID ${id} no encontrado`);
    }
    return producto;
  }

  async findBySku(sku: string) {
    const producto = await this.productosRepository.findOneBy({ sku });
    if (!producto) {
      throw new NotFoundException(`Product con SKU ${sku} no encontrado`);
    }
    return producto;
  }

  async search(query: string) {
    return this.productosRepository.find({
      where: [
        { name: Like(`%${query}%`), active: true },
        { description: Like(`%${query}%`), active: true },
        { categoria: Like(`%${query}%`), active: true },
      ],
    });
  }

  async getStockRealTime(id: string) {
    await this.findOne(id); // Verificar que existe
    const stock = await this.inventoryService.checkAvailability(id);
    return { id, stock };
  }

  async getPrecioDinamico(id: string) {
    await this.findOne(id); // Verificar que existe
    const precio = await this.pricingService.calculateDynamicPrice(id);
    return { id, precio };
  }

  async reservarStock(id: string, cantidad: number) {
    await this.findOne(id); // Verificar que existe
    return this.inventoryService.reserveStock(id, cantidad);
  }

  async create(productoData: Partial<Product>) {
    if (productoData.stock && !productoData.stockInicial) {
      productoData.stockInicial = productoData.stock;
    }
    const producto = this.productosRepository.create(productoData);
    return this.productosRepository.save(producto);
  }

  async update(id: string, productoData: Partial<Product>) {
    const producto = await this.findOne(id);
    Object.assign(producto, productoData);
    return this.productosRepository.save(producto);
  }

  async remove(id: string) {
    const producto = await this.findOne(id);
    producto.active = false;
    return this.productosRepository.save(producto);
  }
}
