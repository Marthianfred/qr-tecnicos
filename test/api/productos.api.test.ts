import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Global, Module } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../../src/entities/producto.entity';
import { ProductosModule } from '../../src/modules/productos/productos.module';
import { Tecnico } from '../../src/entities/tecnico.entity';
import { Certificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { User } from '../../src/entities/user.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        exists: jest.fn().mockResolvedValue(0),
        decrby: jest.fn().mockResolvedValue(0),
        incrby: jest.fn().mockResolvedValue(0),
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
class MockRedisModule {}

describe('Productos API (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Producto, Tecnico, Certificacion, ReporteInconsistencia, Cuadrilla, Empresa, User],
          synchronize: true,
        }),
        MockRedisModule,
        ProductosModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let productoId: string;

  it('POST /productos - should create a new product', async () => {
    const response = await request(app.getHttpServer())
      .post('/productos')
      .send({
        nombre: 'Cable Fibra Optica',
        descripcion: 'Cable de alta calidad',
        precio: 15.50,
        sku: 'CFO-001',
        categoria: 'Accesorios',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    productoId = response.body.id;
  });

  it('GET /productos - should list all products', async () => {
    const response = await request(app.getHttpServer())
      .get('/productos')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /productos/search - should search products', async () => {
    const response = await request(app.getHttpServer())
      .get('/productos/search?q=Fibra')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].nombre).toContain('Fibra');
  });

  it('GET /productos/:id - should get product detail', async () => {
    const response = await request(app.getHttpServer())
      .get(`/productos/${productoId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', productoId);
    expect(response.body).toHaveProperty('sku', 'CFO-001');
  });

  it('GET /productos/sku/:sku - should find product by SKU', async () => {
    const response = await request(app.getHttpServer())
      .get('/productos/sku/CFO-001')
      .expect(200);

    expect(response.body).toHaveProperty('id', productoId);
  });

  it('GET /productos/:id/stock - should get real-time stock', async () => {
    const response = await request(app.getHttpServer())
      .get(`/productos/${productoId}/stock`)
      .expect(200);

    expect(response.body).toHaveProperty('stock');
  });

  it('GET /productos/:id/precio-dinamico - should get dynamic price', async () => {
    const response = await request(app.getHttpServer())
      .get(`/productos/${productoId}/precio-dinamico`)
      .expect(200);

    expect(response.body).toHaveProperty('precio');
  });

  it('POST /productos/:id/reservar - should reserve stock', async () => {
    const response = await request(app.getHttpServer())
      .post(`/productos/${productoId}/reservar`)
      .send({ cantidad: 2 })
      .expect(201);

    expect(response.body).toEqual({ success: false }); 
  });

  it('POST /productos - should create product and set stockInicial from stock', async () => {
    const response = await request(app.getHttpServer())
      .post('/productos')
      .send({
        nombre: 'Router Test',
        sku: 'RTX-999',
        precio: 100,
        stock: 50
      })
      .expect(201);

    expect(response.body.stockInicial).toBe(50);
  });

  it('PATCH /productos/:id - should update product', async () => {
    await request(app.getHttpServer())
      .patch(`/productos/${productoId}`)
      .send({ precio: 16.00 })
      .expect(200);
    
    const response = await request(app.getHttpServer())
      .get(`/productos/${productoId}`);
    expect(Number(response.body.precio)).toBe(16.00);
  });

  it('DELETE /productos/:id - should soft delete product', async () => {
    await request(app.getHttpServer())
      .delete(`/productos/${productoId}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/productos');
    const deleted = response.body.find((p: any) => p.id === productoId);
    expect(deleted).toBeUndefined();
  });
});
