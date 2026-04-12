import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import request = require('supertest');
import { UserRole } from '../../src/entities/user.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/entities/user.entity';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { Tecnico } from '../../src/entities/tecnico.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Certificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Producto } from '../../src/entities/producto.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { CuadrillasModule } from '../../src/modules/cuadrillas/cuadrillas.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { TecnicosModule } from '../../src/modules/tecnicos/tecnicos.module';
import { RedisModule } from '../../src/common/redis/redis.module';

describe('RBAC Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminToken: string;
  let coordToken: string;
  let techToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Tecnico, Cuadrilla, Certificacion, ReporteInconsistencia, Producto, User, Empresa],
          synchronize: true,
        }),
        EventEmitterModule.forRoot(),
        RedisModule,
        AuthModule,
        CuadrillasModule,
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
    await app.init();

    jwtService = app.get(JwtService);
    const userRepository = app.get(getRepositoryToken(User));

    // Create users for testing
    const admin = await userRepository.save({
      username: 'admin_test',
      password: 'password',
      role: UserRole.ADMIN,
    });
    const coord = await userRepository.save({
      username: 'coord_test',
      password: 'password',
      role: UserRole.COORDINATOR,
    });
    const tech = await userRepository.save({
      username: 'tech_test',
      password: 'password',
      role: UserRole.TECHNICIAN,
    });

    adminToken = jwtService.sign({ username: admin.username, sub: admin.id, role: admin.role });
    coordToken = jwtService.sign({ username: coord.username, sub: coord.id, role: coord.role });
    techToken = jwtService.sign({ username: tech.username, sub: tech.id, role: tech.role });
  }, 10000); // Increase timeout for setup

  afterAll(async () => {
    await app.close();
  });

  describe('Cuadrillas Access', () => {
    it('ADMIN should access GET /api/cuadrillas', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cuadrillas')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    });

    it('COORDINATOR should access GET /api/cuadrillas', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cuadrillas')
        .set('Authorization', `Bearer ${coordToken}`);
      expect(response.status).toBe(200);
    });

    it('TECHNICIAN should NOT access GET /api/cuadrillas (403 Forbidden)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cuadrillas')
        .set('Authorization', `Bearer ${techToken}`);
      expect(response.status).toBe(403);
    });
  });

  describe('Tecnicos Access', () => {
    it('ADMIN should access GET /tecnicos', async () => {
      const response = await request(app.getHttpServer())
        .get('/tecnicos')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    });

    it('TECHNICIAN should NOT access GET /tecnicos (403 Forbidden)', async () => {
      const response = await request(app.getHttpServer())
        .get('/tecnicos')
        .set('Authorization', `Bearer ${techToken}`);
      expect(response.status).toBe(403);
    });
  });
});
