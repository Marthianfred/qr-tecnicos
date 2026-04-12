import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Producto } from '../../src/entities/producto.entity';
import { Tecnico, TecnicoStatus } from '../../src/entities/tecnico.entity';
import { Certificacion, NivelCertificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { User, UserRole } from '../../src/entities/user.entity';
import { ProductosModule } from '../../src/modules/productos/productos.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { TecnicosModule } from '../../src/modules/tecnicos/tecnicos.module';
import { RedisModule } from '../../src/common/redis/redis.module';
import { JwtService } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('Ecommerce & TrustLayer (Business Flow E2E)', () => {
  let app: INestApplication;
  let adminToken: string;
  let jwtService: JwtService;

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
        RedisModule,
        AuthModule,
        ProductosModule,
        TecnicosModule,
      ],
    })
      .overrideProvider('REDIS_CLIENT')
      .useValue({
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        exists: jest.fn().mockResolvedValue(0),
        decrby: jest.fn().mockResolvedValue(0),
        incrby: jest.fn().mockResolvedValue(0),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jwtService = app.get(JwtService);
    const userRepository = app.get(getRepositoryToken(User));
    const admin = await userRepository.save({
      username: 'admin',
      password: 'password',
      role: UserRole.ADMIN,
    });
    adminToken = jwtService.sign({ username: admin.username, sub: admin.id, role: admin.role });
  });

  afterAll(async () => {
    await app.close();
  });

  it('Full Business Scenario: Catalog Setup -> Technician Purchase -> Trust Validation', async () => {
    // 1. Core Catalog (FIB-54): Admin creates a new specialized product
    const prodRes = await request(app.getHttpServer())
      .post('/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Kit Empalme Fibra Pro',
        descripcion: 'Kit profesional para técnicos GDA',
        precio: 120.50,
        sku: 'KIT-FIB-PRO',
        categoria: 'Herramientas',
        stock: 10
      })
      .expect(201);
    
    const productId = prodRes.body.id;
    expect(productId).toBeDefined();

    // 2. Triple Play Validation (FIB-58): Setup a qualified technician
    const tecnicoRes = await request(app.getHttpServer())
      .post('/tecnicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Carlos Gomez',
        documento: '20202020',
        pais: 'PE',
        status: TecnicoStatus.ACTIVO,
      })
      .expect(201);
    
    const tecnicoId = tecnicoRes.body.id;

    await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/certificaciones`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nivel: NivelCertificacion.PREMIUM,
        fechaEmision: new Date(),
      })
      .expect(201);

    // 3. E-commerce Interface (FIB-55): Search and reserve (Simulated flow)
    const searchRes = await request(app.getHttpServer())
      .get('/productos/search?q=Empalme')
      .expect(200);
    
    expect(searchRes.body.length).toBeGreaterThan(0);
    expect(searchRes.body[0].sku).toBe('KIT-FIB-PRO');

    // Simulate "Add to Cart" and "Reserve"
    // El QR Token se genera para el técnico
    const qrRes = await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/qr`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
    
    const token = qrRes.body.qr_token;
    expect(token).toBeDefined();

    // 4. Final Trust Validation: Delivery person validates QR
    const validateRes = await request(app.getHttpServer())
      .get(`/tecnicos/validate/${token}`)
      .expect(200);
    
    expect(validateRes.body.nombre).toBe('Carlos Gomez');
    expect(validateRes.body.nivel).toBe(NivelCertificacion.PREMIUM);
  });

  it('Failure Scenario: Inactive Technician (Triple Play Factor 2)', async () => {
    const tecnicoRes = await request(app.getHttpServer())
      .post('/tecnicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Inactive Tech',
        documento: '20202021',
        pais: 'PE',
        status: TecnicoStatus.INACTIVO,
      })
      .expect(201);
    
    const tecnicoId = tecnicoRes.body.id;

    await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/qr`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(401);
  });
});
