import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TechniciansService } from './tecnicos.service';
import { Technician, TechnicianStatus } from '../../entities/technician.entity';
import { Certification, NivelCertification } from '../../entities/certification.entity';
import { InconsistencyReport } from '../../entities/inconsistency-report.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('TechniciansService', () => {
  let service: TechniciansService;

  const mockTechnicianRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCertificationRepository = {
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
        TechniciansService,
        {
          provide: getRepositoryToken(Technician),
          useValue: mockTechnicianRepository,
        },
        {
          provide: getRepositoryToken(Certification),
          useValue: mockCertificationRepository,
        },
        {
          provide: getRepositoryToken(InconsistencyReport),
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

    service = module.get<TechniciansService>(TechniciansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tecnicos', async () => {
      mockTechnicianRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(mockTechnicianRepository.find).toHaveBeenCalledWith({ 
        where: {},
        relations: ['certificaciones'] 
      });
    });
  });

  describe('findOne', () => {
    it('should return one tecnico', async () => {
      const tecnico = { id: '1' };
      mockTechnicianRepository.findOne.mockResolvedValue(tecnico);
      const result = await service.findOne('1');
      expect(result).toEqual(tecnico);
      expect(mockTechnicianRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['certificaciones'],
      });
    });
  });

  describe('create', () => {
    it('should create and save a tecnico with valid VE document', async () => {
      const dto = { name: 'Test', documentId: 'V12345678', country: 'VE' };
      mockTechnicianRepository.create.mockReturnValue(dto);
      mockTechnicianRepository.save.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('1');
    });

    it('should throw BadRequestException for missing documento in VE', async () => {
      const dto = { name: 'Test', documentId: undefined, country: 'VE' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create and save a tecnico with valid PE document', async () => {
      const dto = { name: 'Test', documentId: '12345678', country: 'PE' };
      mockTechnicianRepository.create.mockReturnValue(dto);
      mockTechnicianRepository.save.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('1');
    });

    it('should throw BadRequestException for invalid PE document', async () => {
      const dto = { name: 'Test', documentId: '1234567', country: 'PE' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing documento in PE', async () => {
      const dto = { name: 'Test', documentId: undefined, country: 'PE' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create and save a tecnico with valid RD document', async () => {
      const dto = { name: 'Test', documentId: '12345678901', country: 'RD' };
      mockTechnicianRepository.create.mockReturnValue(dto);
      mockTechnicianRepository.save.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('1');
    });

    it('should throw BadRequestException for invalid RD document', async () => {
      const dto = { name: 'Test', documentId: '1234567890', country: 'RD' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing documento in RD', async () => {
      const dto = { name: 'Test', documentId: undefined, country: 'RD' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create a tecnico if country is not VE, PE or RD without validation', async () => {
      const dto = { name: 'Test', documentId: 'ABC', country: 'OTHER' };
      mockTechnicianRepository.create.mockReturnValue(dto);
      mockTechnicianRepository.save.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('1');
    });
  });

  describe('addCertification', () => {
    it('should return null if tecnico not found', async () => {
      mockTechnicianRepository.findOne.mockResolvedValue(null);
      const result = await service.addCertification('1', {});
      expect(result).toBeNull();
    });

    it('should create and save a certificacion', async () => {
      const tecnico = { id: '1' } as Technician;
      const certDto = { nivel: NivelCertification.INTEGRAL };
      mockTechnicianRepository.findOne.mockResolvedValue(tecnico);
      mockCertificationRepository.create.mockReturnValue({ ...certDto, tecnico });
      mockCertificationRepository.save.mockResolvedValue({ id: 'cert1', ...certDto });
      
      const result = await service.addCertification('1', certDto);
      expect(result).toBeDefined();
      expect(result?.id).toBe('cert1');
      expect(mockCertificationRepository.save).toHaveBeenCalled();
    });
  });

  describe('reportInconsistency', () => {
    it('should throw NotFoundException if tecnico not found', async () => {
      mockTechnicianRepository.findOneBy.mockResolvedValue(null);
      await expect(service.reportInconsistency('1', { description: 'test' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should create and save a report', async () => {
      const tecnico = { id: '1' };
      mockTechnicianRepository.findOneBy.mockResolvedValue(tecnico);
      mockReporteRepository.findOne.mockResolvedValue(null);
      mockReporteRepository.create.mockReturnValue({ id: 'rep1', tecnicoId: '1' });
      mockReporteRepository.save.mockResolvedValue({ id: 'rep1', tecnicoId: '1' });

      const result = await service.reportInconsistency('1', { description: 'test' });
      expect(result).toBeDefined();
      expect(result.tecnicoId).toBe('1');
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
      mockTechnicianRepository.findOneBy.mockResolvedValue(null);
      await expect(service.updateStatus('1', TechnicianStatus.INACTIVO))
        .rejects.toThrow(NotFoundException);
    });

    it('should update and save tecnico status', async () => {
      const tecnico = { id: '1', status: TechnicianStatus.ACTIVO };
      mockTechnicianRepository.findOneBy.mockResolvedValue(tecnico);
      mockTechnicianRepository.save.mockResolvedValue({ ...tecnico, status: TechnicianStatus.INACTIVO });

      const result = await service.updateStatus('1', TechnicianStatus.INACTIVO);
      expect(result.status).toBe(TechnicianStatus.INACTIVO);
      expect(mockTechnicianRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        status: TechnicianStatus.INACTIVO
      }));
    });
  });
});
