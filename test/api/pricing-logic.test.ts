import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from '../../src/modules/pricing/pricing.service';
import { Producto } from '../../src/entities/producto.entity';
import { InventoryService } from '../../src/modules/inventory/inventory.service';
import { Tecnico } from '../../src/entities/tecnico.entity';
import { Certificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { User } from '../../src/entities/user.entity';
import { Global, Module } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: {
        get: jest.fn(),
        set: jest.fn(),
        exists: jest.fn(),
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
class MockRedisModule {}

describe('Pricing Logic (Integration)', () => {
  let pricingService: PricingService;
  let inventoryService: InventoryService;
  let productRepository: Repository<Producto>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Producto, Tecnico, Certificacion, ReporteInconsistencia, Cuadrilla, Empresa, User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Producto]),
        MockRedisModule,
      ],
      providers: [
        PricingService,
        {
          provide: InventoryService,
          useValue: {
            checkAvailability: jest.fn(),
          },
        },
      ],
    }).compile();

    pricingService = module.get<PricingService>(PricingService);
    inventoryService = module.get<InventoryService>(InventoryService);
    productRepository = module.get<Repository<Producto>>('ProductoRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should return base price when stock is normal (> 20%)', async () => {
    const product = await productRepository.save({
      nombre: 'Test Router',
      precio: 100,
      stock: 50,
      stockInicial: 100,
      sku: 'TEST-001',
      descripcion: 'Test',
      categoria: 'Hardware'
    });

    (inventoryService.checkAvailability as jest.Mock).mockResolvedValue(50);

    const price = await pricingService.calculateDynamicPrice(product.id);
    expect(price).toBe(100);
  });

  it('should increase price by 15% when stock is low (<= 20%)', async () => {
    const product = await productRepository.save({
      nombre: 'Low Stock Router',
      precio: 100,
      stock: 20,
      stockInicial: 100,
      sku: 'TEST-002',
      descripcion: 'Test',
      categoria: 'Hardware'
    });

    (inventoryService.checkAvailability as jest.Mock).mockResolvedValue(20);

    const price = await pricingService.calculateDynamicPrice(product.id);
    expect(price).toBe(115);
  });

  it('should increase price by 30% when stock is very low (<= 5%)', async () => {
    const product = await productRepository.save({
      nombre: 'Very Low Stock Router',
      precio: 100,
      stock: 5,
      stockInicial: 100,
      sku: 'TEST-003',
      descripcion: 'Test',
      categoria: 'Hardware'
    });

    (inventoryService.checkAvailability as jest.Mock).mockResolvedValue(5);

    const price = await pricingService.calculateDynamicPrice(product.id);
    expect(price).toBe(130);
  });
});
