import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SeedService } from '../../src/modules/seed/seed.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/entities/user.entity';
import { Tecnico } from '../../src/entities/tecnico.entity';
import { Producto } from '../../src/entities/producto.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Certificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Empresa } from '../../src/entities/empresa.entity';
import { SeedModule } from '../../src/modules/seed/seed.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('Seed Service (Integration)', () => {
  let app: INestApplication;
  let seedService: SeedService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Tecnico, Cuadrilla, Certificacion, ReporteInconsistencia, Producto, User, Empresa],
          synchronize: true,
        }),
        SeedModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    seedService = app.get(SeedService);
  }, 15000);

  afterAll(async () => {
    await app.close();
  });

  it('runSeed should populate the database', async () => {
    const userRepository = app.get(getRepositoryToken(User));
    const tecnicoRepository = app.get(getRepositoryToken(Tecnico));
    const productoRepository = app.get(getRepositoryToken(Producto));

    await seedService.runSeed();

    const users = await userRepository.find();
    const tecnicos = await tecnicoRepository.find();
    const productos = await productoRepository.find();

    expect(users.length).toBeGreaterThanOrEqual(3);
    expect(tecnicos.length).toBeGreaterThanOrEqual(2);
    expect(productos.length).toBeGreaterThanOrEqual(2);

    expect(users.some((u: User) => u.username === 'admin')).toBe(true);
    expect(tecnicos.some((t: Tecnico) => t.nombre === 'Juan Perez')).toBe(true);
    expect(productos.some((p: Producto) => p.sku === 'ROUT-001')).toBe(true);
  });
});
