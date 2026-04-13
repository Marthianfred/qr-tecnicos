import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { ProductsService } from './productos.service';
import { Product } from '../../entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productosService: ProductsService) {}

  @Get()
  findAll(@Query('categoria') categoria?: string) {
    return this.productosService.findAll({ categoria });
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.productosService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Get(':id/stock')
  getStock(@Param('id') id: string) {
    return this.productosService.getStockRealTime(id);
  }

  @Get(':id/precio-dinamico')
  getPrecio(@Param('id') id: string) {
    return this.productosService.getPrecioDinamico(id);
  }

  @Post(':id/reservar')
  async reservar(@Param('id') id: string, @Body('cantidad') cantidad: number) {
    const success = await this.productosService.reservarStock(id, cantidad || 1);
    return { success };
  }

  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string) {
    return this.productosService.findBySku(sku);
  }

  @Post()
  create(@Body() productoData: Partial<Product>) {
    return this.productosService.create(productoData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() productoData: Partial<Product>) {
    return this.productosService.update(id, productoData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
