import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Tecnico, TecnicoStatus } from '../../src/entities/tecnico.entity';
import { Certificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { User, UserRole } from '../../src/entities/user.entity';
import { Producto } from '../../src/entities/producto.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { TecnicosModule } from '../../src/modules/tecnicos/tecnicos.module';
import { RedisModule } from '../../src/common/redis/redis.module';
import { JwtService } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('Fibex Qr Tecnicos (E2E Flow)', () => {
  let app: INestApplication;
  let adminToken: string;
  let techToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Tecnico, Certificacion, ReporteInconsistencia, Cuadrilla, User, Producto, Empresa],
          synchronize: true,
        }),
        RedisModule,
        AuthModule,
        TecnicosModule,
      ],
    })
      .overrideProvider('REDIS_CLIENT')
      .useValue({
        get: jest.fn(),
        set: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const jwtService = app.get(JwtService);
    const userRepository = app.get(getRepositoryToken(User));

    const admin = await userRepository.save({ username: 'admin_qr', password: 'password', role: UserRole.ADMIN });
    adminToken = jwtService.sign({ username: admin.username, sub: admin.id, role: admin.role });
  }, 15000);

  afterAll(async () => {
    await app.close();
  });

  it('Full Business Flow: Setup -> Generate QR -> Validate -> Report', async () => {
    // 1. Setup: Create Technician (Admin)
    const tecnicoRes = await request(app.getHttpServer())
      .post('/tecnicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Carlos GDA',
        documento: 'V11223344',
        pais: 'VE',
        status: TecnicoStatus.ACTIVO,
      })
      .expect(201);
    const tecnicoId = tecnicoRes.body.id;

    // Login as Technician for QR generation
    const jwtService = app.get(JwtService);
    techToken = jwtService.sign({ username: 'tech', sub: tecnicoId, role: UserRole.TECHNICIAN });

    // 2. Setup: Add Certification (Admin)
    await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/certificaciones`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nivel: 'Premium',
        fechaEmision: new Date(),
      })
      .expect(201);

    // 3. Technician Flow: Generate QR
    const qrRes = await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/qr`)
      .set('Authorization', `Bearer ${techToken}`)
      .expect(201);
    const token = qrRes.body.qr_token;
    expect(token).toBeDefined();

    // 4. Client Flow: Validate QR (Public)
    const validateRes = await request(app.getHttpServer())
      .get(`/tecnicos/validate/${token}`)
      .expect(200);
    expect(validateRes.body.nombre).toBe('Carlos GDA');

    // 5. Client Flow: Report Inconsistency (Public)
    await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/report`)
      .send({
        descripcion: 'Sospecha de suplantación: la foto no coincide.',
      })
      .expect(201);

    // 6. Coordinator Flow: Monitor Reports
    const reportsRes = await request(app.getHttpServer())
      .get('/tecnicos/reports')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(reportsRes.body.length).toBeGreaterThan(0);

    // 7. Coordinator Flow: Suspend Technician
    await request(app.getHttpServer())
      .patch(`/tecnicos/${tecnicoId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: TecnicoStatus.INACTIVO })
      .expect(200);

    // 8. Technician Flow: Try to generate QR again (Should fail due to TrustLayer rules)
    await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/qr`)
      .set('Authorization', `Bearer ${techToken}`)
      .expect(401);
  });
});
