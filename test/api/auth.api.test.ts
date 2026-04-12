import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import request = require('supertest');
import { AuthModule } from '../../src/modules/auth/auth.module';
import { RedisModule } from '../../src/common/redis/redis.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Tecnico } from '../../src/entities/tecnico.entity';
import { Certificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { User } from '../../src/entities/user.entity';

describe('Auth API (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Tecnico, Certificacion, ReporteInconsistencia, User, Cuadrilla, Empresa],
          synchronize: true,
        }),
        EventEmitterModule.forRoot(),
        RedisModule,
        AuthModule,
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /auth/health - should return ok', async () => {
    const response = await request(app.getHttpServer()).get('/auth/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('POST /auth/login - should return token for valid credentials (mocked)', async () => {
    // Create a user first since we added real login logic
    const userRepository = app.get(getRepositoryToken(User));
    await userRepository.save({
      username: 'admin',
      password: 'password',
      role: 'admin'
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'password' });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');
  });
});
