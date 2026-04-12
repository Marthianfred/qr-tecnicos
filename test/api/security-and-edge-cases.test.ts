import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { TecnicosModule } from '../../src/modules/tecnicos/tecnicos.module';
import { RedisModule } from '../../src/common/redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TecnicoStatus } from '../../src/entities/tecnico.entity';
import { NivelCertificacion } from '../../src/entities/certificacion.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tecnico } from '../../src/entities/tecnico.entity';
import { Certificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { User, UserRole } from '../../src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

describe('Security and Edge Cases (FIB-31)', () => {
  let app: INestApplication;
  let adminToken: string;
  let jwtService: JwtService;
  let tecnicoRepository: Repository<Tecnico>;
  let certificacionRepository: Repository<Certificacion>;
  let reporteRepository: Repository<ReporteInconsistencia>;
  let mockRedis: any;

  beforeAll(async () => {
    const store = new Map();
    mockRedis = {
      get: jest.fn().mockImplementation((key) => store.get(key)),
      set: jest.fn().mockImplementation((key, value) => {
        store.set(key, value);
        return 'OK';
      }),
    };

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
      .useValue(mockRedis)
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

    tecnicoRepository = moduleFixture.get<Repository<Tecnico>>(getRepositoryToken(Tecnico));
    certificacionRepository = moduleFixture.get<Repository<Certificacion>>(getRepositoryToken(Certificacion));
    reporteRepository = moduleFixture.get<Repository<ReporteInconsistencia>>(getRepositoryToken(ReporteInconsistencia));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Multi-region Validation', () => {
    it('should reject invalid VE document format', async () => {
      const response = await request(app.getHttpServer())
        .post('/tecnicos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Invalid VE',
          documento: '12345678', // Missing V or E
          pais: 'VE'
        });
      
      expect(response.status).toBe(400);
    });

    it('should reject invalid PE document format', async () => {
      const response = await request(app.getHttpServer())
        .post('/tecnicos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Invalid PE',
          documento: '1234567', // Only 7 digits
          pais: 'PE'
        });
      
      expect(response.status).toBe(400);
    });

    it('should reject invalid RD document format', async () => {
      const response = await request(app.getHttpServer())
        .post('/tecnicos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Invalid RD',
          documento: '1234567890', // Only 10 digits
          pais: 'RD'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Token Security - Expired Certifications', () => {
    it('should reject QR generation if technician has only expired certifications', async () => {
      // Create tecnico
      const tecnico = await tecnicoRepository.save({
        nombre: 'Tech Expired Cert',
        documento: 'V99999991',
        pais: 'VE',
        status: TecnicoStatus.ACTIVO
      });

      // Add expired certification
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await certificacionRepository.save({
        nivel: NivelCertificacion.BASICO,
        fechaEmision: new Date(2023, 1, 1),
        fechaExpiracion: yesterday,
        tecnico: tecnico
      });

      const response = await request(app.getHttpServer())
        .post(`/tecnicos/${tecnico.id}/qr`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('certificaciones vencidas');
    });
  });

  describe('Duplicate Inconsistency Reports', () => {
    it('should prevent duplicate reports for same technician and description', async () => {
       const tecnico = await tecnicoRepository.save({
        nombre: 'Tech Duplicate Report',
        documento: 'V99999992',
        pais: 'VE',
        status: TecnicoStatus.ACTIVO
      });

      const reportData = {
        descripcion: 'Foto no coincide',
        fechaReporte: new Date()
      };

      // First report
      await request(app.getHttpServer())
        .post(`/tecnicos/${tecnico.id}/report`)
        .send(reportData);

      // Second report (duplicate)
      const response = await request(app.getHttpServer())
        .post(`/tecnicos/${tecnico.id}/report`)
        .send(reportData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Ya existe un reporte');
    });
  });

  describe('Token Security - Single Use / Reusability', () => {
    it('should invalidate token after first successful validation', async () => {
      const tecnico = await tecnicoRepository.save({
        nombre: 'Tech Single Use',
        documento: 'V99999993',
        pais: 'VE',
        status: TecnicoStatus.ACTIVO
      });

      await certificacionRepository.save({
        nivel: NivelCertificacion.INTEGRAL,
        fechaEmision: new Date(),
        fechaExpiracion: new Date(2027, 1, 1),
        tecnico: tecnico
      });

      const genResponse = await request(app.getHttpServer())
        .post(`/tecnicos/${tecnico.id}/qr`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      const token = genResponse.body.qr_token;

      // First validation - success
      const val1 = await request(app.getHttpServer())
        .get(`/tecnicos/validate/${token}`);
      
      expect(val1.status).toBe(200);

      // Second validation - fail (reused)
      const val2 = await request(app.getHttpServer())
        .get(`/tecnicos/validate/${token}`);
      
      expect(val2.status).toBe(401);
      expect(val2.body.message).toContain('reutilizado');
    });

    it('should reject token if it has been tampered with', async () => {
      const tecnico = await tecnicoRepository.save({
        nombre: 'Tech Tamper',
        documento: 'V99999994',
        pais: 'VE',
        status: TecnicoStatus.ACTIVO
      });

      await certificacionRepository.save({
        nivel: NivelCertificacion.INTEGRAL,
        fechaEmision: new Date(),
        fechaExpiracion: new Date(2027, 1, 1),
        tecnico: tecnico
      });

      const genResponse = await request(app.getHttpServer())
        .post(`/tecnicos/${tecnico.id}/qr`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      const token = genResponse.body.qr_token;
      
      // Tamper with the token (change payload part)
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      payload.nivel = 'Premium'; // Try to upgrade level
      parts[1] = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '');
      const tamperedToken = parts.join('.');

      const response = await request(app.getHttpServer())
        .get(`/tecnicos/validate/${tamperedToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('inválido');
    });
  });
});
