import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '../../entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.productsService.findAll({ category });
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.productsService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/stock')
  getStock(@Param('id') id: string) {
    return this.productsService.getStockRealTime(id);
  }

  @Get(':id/precio-dinamico')
  getPrecio(@Param('id') id: string) {
    return this.productsService.getPrecioDinamico(id);
  }

  @Post(':id/reservar')
  async reservar(@Param('id') id: string, @Body('cantidad') cantidad: number) {
    const success = await this.productsService.reservarStock(id, cantidad || 1);
    return { success };
  }

  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @Post()
  create(@Body() productData: Partial<Product>) {
    return this.productsService.create(productData);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() productData: Partial<Product>) {
    return this.productsService.update(id, productData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
