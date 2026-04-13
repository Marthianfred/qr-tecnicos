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
import { CuadrillasModule } from '../../src/modules/cuadrillas/cuadrillas.module';
import { SeedModule } from '../../src/modules/seed/seed.module';
import { RedisModule } from '../../src/common/redis/redis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';

describe('Admin Business Flow (E2E)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Tecnico, Cuadrilla, Certificacion, ReporteInconsistencia, User, Producto, Empresa],
          synchronize: true,
        }),
        RedisModule,
        AuthModule,
        TecnicosModule,
        CuadrillasModule,
        SeedModule,
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

    // Create Admin User
    const userRepository = app.get(getRepositoryToken(User));
    const admin = await userRepository.save({
      username: 'admin_e2e',
      password: 'password',
      role: UserRole.ADMIN,
    });

    const jwtService = app.get(JwtService);
    // Login to get token
    adminToken = jwtService.sign({ username: admin.username, sub: admin.id, role: admin.role });
  }, 20000);

  afterAll(async () => {
    await app.close();
  });

  it('Should handle full Cuadrilla lifecycle with RBAC', async () => {
    // 1. Create a Technician (Admin only)
    const tecnicoRes = await request(app.getHttpServer())
      .post('/tecnicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Pedro E2E',
        documento: 'V12345678',
        cargo: 'Supervisor de Cuadrilla',
        pais: 'VE',
        zona: 'CCS-01',
        status: TecnicoStatus.ACTIVO,
      })
      .expect(201);
    const tecnicoId = tecnicoRes.body.id;

    // 2. Create a Cuadrilla
    const cuadrillaRes = await request(app.getHttpServer())
      .post('/api/cuadrillas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Cuadrilla E2E Central',
        zona: 'CCS-01',
      })
      .expect(201);
    const cuadrillaId = cuadrillaRes.body.id;

    // 3. Assign Technician to Cuadrilla
    await request(app.getHttpServer())
      .post(`/api/cuadrillas/${cuadrillaId}/tecnicos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tecnicoIds: [tecnicoId] })
      .expect(201);

    // 4. Verify Assignment
    const verifyRes = await request(app.getHttpServer())
      .get(`/api/cuadrillas/${cuadrillaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(verifyRes.body.tecnicos).toContainEqual(expect.objectContaining({ id: tecnicoId }));
  });
});
