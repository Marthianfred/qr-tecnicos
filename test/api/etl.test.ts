import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtlService } from '../../src/modules/etl/etl.service';
import { Empresa } from '../../src/entities/empresa.entity';
import { User } from '../../src/entities/user.entity';
import { Cuadrilla } from '../../src/entities/cuadrilla.entity';
import { Tecnico } from '../../src/entities/tecnico.entity';
import { Certificacion } from '../../src/entities/certificacion.entity';
import { ReporteInconsistencia } from '../../src/entities/reporte-inconsistencia.entity';
import { Producto } from '../../src/entities/producto.entity';
import * as path from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('EtlService (Integration)', () => {
  let service: EtlService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Empresa, User, Cuadrilla, Tecnico, Certificacion, ReporteInconsistencia, Producto],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Empresa, User, Cuadrilla, Tecnico, Certificacion]),
      ],
      providers: [EtlService],
    }).compile();

    service = module.get<EtlService>(EtlService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should process CSV and load data correctly', async () => {
    const csvPath = path.join(__dirname, '../../src/data/tecnicos_certificaciones.csv');
    const result = await service.processCsv(csvPath);

    expect(result.success).toBe(true);

    const empresaRepo = module.get('EmpresaRepository');
    const userRepo = module.get('UserRepository');
    const tecnicoRepo = module.get('TecnicoRepository');
    const certRepo = module.get('CertificacionRepository');

    const empresas = await empresaRepo.find();
    expect(empresas.length).toBe(2);
    expect(empresas.map((e: any) => e.nombre)).toContain('Fibex Services');
    expect(empresas.map((e: any) => e.nombre)).toContain('GDA Tech');

    const supervisors = await userRepo.find({ where: { role: 'coordinator' } });
    expect(supervisors.length).toBe(2);
    expect(supervisors.map((s: any) => s.username)).toContain('V11111111');

    const tecnicos = await tecnicoRepo.find({ relations: ['certificaciones', 'cuadrilla'] });
    expect(tecnicos.length).toBe(4);
    
    const juan = tecnicos.find((t: any) => t.nombre === 'Juan Rodriguez');
    expect(juan).toBeDefined();
    expect(juan.certificaciones.length).toBe(1); // Only "Inicial" is "Certificado" in dummy CSV
    expect(juan.cuadrilla.nombre).toBe('Cuadrilla Carlos Perez');

    const pedro = tecnicos.find((t: any) => t.nombre === 'Pedro Lopez');
    expect(pedro).toBeDefined();
    expect(pedro.certificaciones.length).toBe(2); // "Inicial" and "Básico"
  });
});
