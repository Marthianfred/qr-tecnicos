import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SquadsService } from './cuadrillas.service';
import { Squad } from '../../entities/squad.entity';
import { Technician } from '../../entities/technician.entity';
import { NotFoundException } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('SquadsService', () => {
  let service: SquadsService;

  const mockSquadRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTechnicianRepository = {
    update: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SquadsService,
        {
          provide: getRepositoryToken(Squad),
          useValue: mockSquadRepository,
        },
        {
          provide: getRepositoryToken(Technician),
          useValue: mockTechnicianRepository,
        },
      ],
    }).compile();

    service = module.get<SquadsService>(SquadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all cuadrillas', async () => {
      mockSquadRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(mockSquadRepository.find).toHaveBeenCalledWith({ relations: ['tecnicos', 'supervisor'] });
    });
  });

  describe('findOne', () => {
    it('should return one cuadrilla', async () => {
      const cuadrilla = { id: '123' };
      mockSquadRepository.findOne.mockResolvedValue(cuadrilla);
      const result = await service.findOne('123');
      expect(result).toEqual(cuadrilla);
    });

    it('should throw NotFoundException if not found', async () => {
      mockSquadRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a cuadrilla', async () => {
      const dto = { name: 'Squad 1', zona: 'Norte' };
      mockSquadRepository.create.mockReturnValue(dto);
      mockSquadRepository.save.mockResolvedValue({ id: '123', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('123');
      expect(mockSquadRepository.save).toHaveBeenCalled();
    });
  });

  describe('addTechnicians', () => {
    it('should update tecnicos with cuadrillaId', async () => {
      mockSquadRepository.findOne.mockResolvedValue({ id: 'c1' });
      await service.addTechnicians('c1', ['t1', 't2']);
      expect(mockTechnicianRepository.update).toHaveBeenCalledTimes(2);
      expect(mockTechnicianRepository.update).toHaveBeenCalledWith('t1', { cuadrillaId: 'c1' });
      expect(mockTechnicianRepository.update).toHaveBeenCalledWith('t2', { cuadrillaId: 'c1' });
    });
  });

  describe('removeTechnician', () => {
    it('should throw if tecnico not in cuadrilla', async () => {
      mockSquadRepository.findOne.mockResolvedValue({ id: 'c1' });
      mockTechnicianRepository.findOneBy.mockResolvedValue(null);
      await expect(service.removeTechnician('c1', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should remove tecnico from cuadrilla', async () => {
      mockSquadRepository.findOne.mockResolvedValue({ id: 'c1' });
      mockTechnicianRepository.findOneBy.mockResolvedValue({ id: 't1', cuadrillaId: 'c1' });
      await service.removeTechnician('c1', 't1');
      expect(mockTechnicianRepository.update).toHaveBeenCalledWith('t1', { cuadrillaId: undefined });
    });
  });
});
