/**
 * @jest-environment node
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Verifier } from '@pact-foundation/pact';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { AuthService } from '../../src/modules/auth/auth.service';
import { TecnicosModule } from '../../src/modules/tecnicos/tecnicos.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tecnico, TecnicoStatus } from '../../src/entities/tecnico.entity';
import { Certificacion, NivelCertificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { User } from '../../src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import path from 'path';
import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: {
        get: jest.fn(),
        set: jest.fn(),
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
class MockRedisModule {}

describe('Pact Provider Verification', () => {
  let app: INestApplication;
  let tecnicoRepository: Repository<Tecnico>;
  let certificacionRepository: Repository<Certificacion>;

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
        MockRedisModule,
        AuthModule,
        TecnicosModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    await app.listen(8080); // Open server for Pact to hit

    tecnicoRepository = moduleFixture.get<Repository<Tecnico>>(getRepositoryToken(Tecnico));
    certificacionRepository = moduleFixture.get<Repository<Certificacion>>(getRepositoryToken(Certificacion));
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should verify the contracts', async () => {
    // Seed data for the expected states
    const tecnico = tecnicoRepository.create({
      id: '1',
      nombre: 'John Doe',
      documento: 'V12345678',
      pais: 'VE',
      status: TecnicoStatus.ACTIVO,
    });
    await tecnicoRepository.save(tecnico);

    // Add a valid certification so QR generation doesn't fail with 401
    await certificacionRepository.save({
      nivel: NivelCertificacion.INTEGRAL,
      fechaEmision: new Date(),
      fechaExpiracion: new Date(2027, 1, 1),
      tecnico: tecnico
    });

    // Generate a valid token for the verifier to use
    const jwtService = app.get(JwtService);
    const adminToken = jwtService.sign({ username: 'pact-test', sub: 'pact', role: 'admin' });

    const opts = {
      provider: 'Backend',
      providerBaseUrl: 'http://localhost:8080',
      pactUrls: [path.resolve(process.cwd(), 'pacts', 'Frontend-Backend.json')],
      stateHandlers: {
        'a technician exists with ID 1': async () => {
          // Ensure technician exists
          const exists = await tecnicoRepository.findOneBy({ id: '1' });
          if (!exists) {
            const tecnico = tecnicoRepository.create({
              id: '1',
              nombre: 'John Doe',
              documento: 'V12345678',
              pais: 'VE',
              status: TecnicoStatus.ACTIVO,
            });
            await tecnicoRepository.save(tecnico);
            await certificacionRepository.save({
              nivel: NivelCertificacion.INTEGRAL,
              fechaEmision: new Date(),
              fechaExpiracion: new Date(2027, 1, 1),
              tecnico: tecnico
            });
          }
          return 'Technician 1 ready';
        },
      },
      customProviderHeaders: [
        `Authorization: Bearer ${adminToken}`
      ],
    };

    // Special hack for the 'valid-token' test:
    // We'll mock the AuthService.validateToken for the specific token 'valid-token'
    const authService = app.get(AuthService);
    const originalValidate = authService.validateToken.bind(authService);
    authService.validateToken = async (token: string) => {
      if (token === 'valid-token') {
        return { id: '1', nombre: 'John Doe' };
      }
      return originalValidate(token);
    };

    return new Verifier(opts).verifyProvider().then(output => {
      console.log('Pact Verification Complete!');
      console.log(output);
    });
  }, 30000);
});
