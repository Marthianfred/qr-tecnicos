import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import request from 'supertest';
import { TecnicosModule } from '../../src/modules/tecnicos/tecnicos.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { RedisModule } from '../../src/common/redis/redis.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Tecnico, TecnicoStatus } from '../../src/entities/tecnico.entity';
import { Certificacion, NivelCertificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { User, UserRole } from '../../src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { KeycloakIAMService } from '../../src/services/iam.service';

describe('Tecnicos API (Integration)', () => {
  let app: INestApplication;
  let adminToken: string;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Tecnico, Certificacion, ReporteInconsistencia, Cuadrilla, Empresa, User],
          synchronize: true,
        }),
        EventEmitterModule.forRoot(),
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
      .overrideProvider(KeycloakIAMService)
      .useValue({
        validateToken: jest.fn().mockImplementation(async (token) => {
          // Simply verify the token using JwtService and return the payload
          // This allows using local tokens in tests while the guard uses KeycloakIAMService
          const payload = jwtService.verify(token);
          return {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
          };
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
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

  let tecnicoId: string;

  it('POST /tecnicos - should create a new tecnico', async () => {
    const response = await request(app.getHttpServer())
      .post('/tecnicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Juan Perez',
        documento: 'V12345678',
        pais: 'VE',
      });
    
    expect(response.status).toBe(201);
    expect(response.body.nombre).toBe('Juan Perez');
    tecnicoId = response.body.id;
  });

  it('GET /tecnicos - should list all tecnicos', async () => {
    const response = await request(app.getHttpServer())
      .get('/tecnicos')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /tecnicos/:id - should get a single tecnico', async () => {
    const response = await request(app.getHttpServer())
      .get(`/tecnicos/${tecnicoId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(tecnicoId);
  });

  it('POST /tecnicos/:id/certificaciones - should add certification', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/certificaciones`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nivel: NivelCertificacion.INTEGRAL,
        fechaEmision: new Date(),
      });
    
    expect(response.status).toBe(201);
    expect(response.body.nivel).toBe(NivelCertificacion.INTEGRAL);
  });

  it('POST /tecnicos/:id/qr - should generate QR token', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/qr`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('qr_token');
  });

  it('GET /tecnicos/validate/:token - should validate token', async () => {
    // First generate a token
    const genResponse = await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/qr`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();
    
    const token = genResponse.body.qr_token;

    const response = await request(app.getHttpServer())
      .get(`/tecnicos/validate/${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe('Juan Perez');
  });

  it('PATCH /tecnicos/:id/status - should deactivate tecnico', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/tecnicos/${tecnicoId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: TecnicoStatus.INACTIVO });
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(TecnicoStatus.INACTIVO);
  });

  it('POST /tecnicos/:id/qr - should fail if tecnico is inactive', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/qr`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();
    
    expect(response.status).toBe(401);
  });

  it('POST /tecnicos/:id/report - should report inconsistency', async () => {
    const response = await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/report`)
      .send({
        descripcion: 'Comportamiento inadecuado',
        fechaReporte: new Date(),
      });
    
    expect(response.status).toBe(201);
    expect(response.body.descripcion).toBe('Comportamiento inadecuado');
  });

  it('GET /tecnicos/reports - should list reports', async () => {
    const response = await request(app.getHttpServer())
      .get('/tecnicos/reports')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
