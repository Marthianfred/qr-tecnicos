import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TecnicosService } from './tecnicos.service';
import { Tecnico, TecnicoStatus } from '../../entities/tecnico.entity';
import { Certificacion, NivelCertificacion } from '../../entities/certificacion.entity';
import { ReporteInconsistencia } from '../../entities/reporte-inconsistencia.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('TecnicosService', () => {
  let service: TecnicosService;

  const mockTecnicoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCertificacionRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockReporteRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TecnicosService,
        {
          provide: getRepositoryToken(Tecnico),
          useValue: mockTecnicoRepository,
        },
        {
          provide: getRepositoryToken(Certificacion),
          useValue: mockCertificacionRepository,
        },
        {
          provide: getRepositoryToken(ReporteInconsistencia),
          useValue: mockReporteRepository,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TecnicosService>(TecnicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tecnicos', async () => {
      mockTecnicoRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(mockTecnicoRepository.find).toHaveBeenCalledWith({ relations: ['certificaciones'] });
    });
  });

  describe('findOne', () => {
    it('should return one tecnico', async () => {
      const tecnico = { id: '123' };
      mockTecnicoRepository.findOne.mockResolvedValue(tecnico);
      const result = await service.findOne('123');
      expect(result).toEqual(tecnico);
      expect(mockTecnicoRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['certificaciones'],
      });
    });
  });

  describe('create', () => {
    it('should create and save a tecnico with valid VE document', async () => {
      const dto = { nombre: 'Test', documento: 'V12345678', pais: 'VE' };
      mockTecnicoRepository.create.mockReturnValue(dto);
      mockTecnicoRepository.save.mockResolvedValue({ id: '123', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('123');
    });

    it('should throw BadRequestException for missing documento in VE', async () => {
      const dto = { nombre: 'Test', documento: undefined, pais: 'VE' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create and save a tecnico with valid PE document', async () => {
      const dto = { nombre: 'Test', documento: '12345678', pais: 'PE' };
      mockTecnicoRepository.create.mockReturnValue(dto);
      mockTecnicoRepository.save.mockResolvedValue({ id: '123', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('123');
    });

    it('should throw BadRequestException for invalid PE document', async () => {
      const dto = { nombre: 'Test', documento: '1234567', pais: 'PE' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing documento in PE', async () => {
      const dto = { nombre: 'Test', documento: undefined, pais: 'PE' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create and save a tecnico with valid RD document', async () => {
      const dto = { nombre: 'Test', documento: '12345678901', pais: 'RD' };
      mockTecnicoRepository.create.mockReturnValue(dto);
      mockTecnicoRepository.save.mockResolvedValue({ id: '123', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('123');
    });

    it('should throw BadRequestException for invalid RD document', async () => {
      const dto = { nombre: 'Test', documento: '1234567890', pais: 'RD' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing documento in RD', async () => {
      const dto = { nombre: 'Test', documento: undefined, pais: 'RD' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create a tecnico if country is not VE, PE or RD without validation', async () => {
      const dto = { nombre: 'Test', documento: 'ABC', pais: 'OTHER' };
      mockTecnicoRepository.create.mockReturnValue(dto);
      mockTecnicoRepository.save.mockResolvedValue({ id: '123', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('123');
    });
  });

  describe('addCertificacion', () => {
    it('should return null if tecnico not found', async () => {
      mockTecnicoRepository.findOne.mockResolvedValue(null);
      const result = await service.addCertificacion('123', {});
      expect(result).toBeNull();
    });

    it('should create and save a certificacion', async () => {
      const tecnico = { id: '123' } as Tecnico;
      const certDto = { nivel: NivelCertificacion.INTEGRAL };
      mockTecnicoRepository.findOne.mockResolvedValue(tecnico);
      mockCertificacionRepository.create.mockReturnValue({ ...certDto, tecnico });
      mockCertificacionRepository.save.mockResolvedValue({ id: 'cert1', ...certDto });
      
      const result = await service.addCertificacion('123', certDto);
      expect(result).toBeDefined();
      expect(result?.id).toBe('cert1');
      expect(mockCertificacionRepository.save).toHaveBeenCalled();
    });
  });

  describe('reportInconsistency', () => {
    it('should throw NotFoundException if tecnico not found', async () => {
      mockTecnicoRepository.findOneBy.mockResolvedValue(null);
      await expect(service.reportInconsistency('123', { descripcion: 'test' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should create and save a report', async () => {
      const tecnico = { id: '123' };
      mockTecnicoRepository.findOneBy.mockResolvedValue(tecnico);
      mockReporteRepository.findOne.mockResolvedValue(null);
      mockReporteRepository.create.mockReturnValue({ id: 'rep1', tecnicoId: '123' });
      mockReporteRepository.save.mockResolvedValue({ id: 'rep1', tecnicoId: '123' });

      const result = await service.reportInconsistency('123', { descripcion: 'test' });
      expect(result).toBeDefined();
      expect(result.tecnicoId).toBe('123');
      expect(mockReporteRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAllReports', () => {
    it('should return all reports', async () => {
      mockReporteRepository.find.mockResolvedValue([]);
      const result = await service.findAllReports();
      expect(result).toEqual([]);
      expect(mockReporteRepository.find).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should throw NotFoundException if tecnico not found', async () => {
      mockTecnicoRepository.findOneBy.mockResolvedValue(null);
      await expect(service.updateStatus('123', TecnicoStatus.INACTIVO))
        .rejects.toThrow(NotFoundException);
    });

    it('should update and save tecnico status', async () => {
      const tecnico = { id: '123', status: TecnicoStatus.ACTIVO };
      mockTecnicoRepository.findOneBy.mockResolvedValue(tecnico);
      mockTecnicoRepository.save.mockResolvedValue({ ...tecnico, status: TecnicoStatus.INACTIVO });

      const result = await service.updateStatus('123', TecnicoStatus.INACTIVO);
      expect(result.status).toBe(TecnicoStatus.INACTIVO);
      expect(mockTecnicoRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        status: TecnicoStatus.INACTIVO
      }));
    });
  });
});
