import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../../entities/producto.entity';
import Redis from 'ioredis';

@Injectable()
export class InventoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async onModuleInit() {
    // Inicializar Redis con el stock de la DB si es necesario
    const productos = await this.productosRepository.find();
    for (const producto of productos) {
      const exists = await this.redis.exists(`stock:${producto.id}`);
      if (!exists) {
        await this.redis.set(`stock:${producto.id}`, producto.stock);
      }
    }
  }

  async checkAvailability(productId: string): Promise<number> {
    const stock = await this.redis.get(`stock:${productId}`);
    return stock ? parseInt(stock) : 0;
  }

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    const currentStock = await this.checkAvailability(productId);
    if (currentStock < quantity) {
      return false;
    }
    
    // Decrementamos atómicamente
    const newStock = await this.redis.decrby(`stock:${productId}`, quantity);
    
    // Si bajó de 0, revertimos
    if (newStock < 0) {
      await this.redis.incrby(`stock:${productId}`, quantity);
      return false;
    }
    
    return true;
  }

  async releaseStock(productId: string, quantity: number): Promise<void> {
    await this.redis.incrby(`stock:${productId}`, quantity);
  }
}
