import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Producto } from '../../entities/producto.entity';
import { InventoryService } from '../inventory/inventory.service';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    private inventoryService: InventoryService,
    private pricingService: PricingService,
  ) {}

  async findAll(filters?: { categoria?: string }) {
    const where: any = { activo: true };
    if (filters?.categoria) {
      where.categoria = filters.categoria;
    }
    return this.productosRepository.find({ where });
  }

  async findOne(id: string) {
    const producto = await this.productosRepository.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async findBySku(sku: string) {
    const producto = await this.productosRepository.findOneBy({ sku });
    if (!producto) {
      throw new NotFoundException(`Producto con SKU ${sku} no encontrado`);
    }
    return producto;
  }

  async search(query: string) {
    return this.productosRepository.find({
      where: [
        { nombre: Like(`%${query}%`), activo: true },
        { descripcion: Like(`%${query}%`), activo: true },
        { categoria: Like(`%${query}%`), activo: true },
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

  async create(productoData: Partial<Producto>) {
    if (productoData.stock && !productoData.stockInicial) {
      productoData.stockInicial = productoData.stock;
    }
    const producto = this.productosRepository.create(productoData);
    return this.productosRepository.save(producto);
  }

  async update(id: string, productoData: Partial<Producto>) {
    const producto = await this.findOne(id);
    Object.assign(producto, productoData);
    return this.productosRepository.save(producto);
  }

  async remove(id: string) {
    const producto = await this.findOne(id);
    producto.activo = false;
    return this.productosRepository.save(producto);
  }
}
