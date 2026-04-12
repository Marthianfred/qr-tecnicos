import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Tecnico, TecnicoStatus } from '../../src/entities/tecnico.entity';
import { Certificacion, NivelCertificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { User, UserRole } from '../../src/entities/user.entity';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { TecnicosModule } from '../../src/modules/tecnicos/tecnicos.module';
import { RedisModule } from '../../src/common/redis/redis.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('Fibex Qr Tecnicos (Security Scenarios E2E)', () => {
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
          entities: [Tecnico, Certificacion, ReporteInconsistencia, Cuadrilla, Empresa, User],
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

    jwtService = app.get(JwtService);
    const userRepository = app.get(getRepositoryToken(User));
    const admin = await userRepository.save({
      username: 'admin_security',
      password: 'password',
      role: UserRole.ADMIN,
    });
    adminToken = jwtService.sign({ username: admin.username, sub: admin.id, role: admin.role });
  }, 15000);

  afterAll(async () => {
    await app.close();
  });

  it('Scenario: QR generation fails for non-existent tecnico', async () => {
    const response = await request(app.getHttpServer())
      .post('/tecnicos/999-999-999/qr')
      .set('Authorization', `Bearer ${adminToken}`)
      .send();
    
    // El motor TrustLayer lanza 401 si el técnico no existe por diseño de seguridad (HU-2)
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Técnico no encontrado');
  });

  it('Scenario: QR generation fails for tecnico without certifications', async () => {
    const tecnicoRes = await request(app.getHttpServer())
      .post('/tecnicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Tech No Certs',
        documento: 'V10101010',
        pais: 'VE',
        status: TecnicoStatus.ACTIVO,
      })
      .expect(201);
    
    const tecnicoId = tecnicoRes.body.id;

    const response = await request(app.getHttpServer())
      .post(`/tecnicos/${tecnicoId}/qr`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();
    
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Certificación');
  });

  it('Scenario: QR validation fails for invalid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/tecnicos/validate/this.is.not.a.token')
      .expect(401);
    
    expect(response.body.message).toContain('Token inválido');
  });

  it('Scenario: QR validation fails for expired token', async () => {
    const expiredToken = jwtService.sign(
      { sub: '123', nombre: 'Test' },
      { expiresIn: '-1s' }
    );

    const response = await request(app.getHttpServer())
      .get(`/tecnicos/validate/${expiredToken}`)
      .expect(401);
    
    expect(response.body.message).toContain('expirado');
  });
});
