import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CuadrillasService } from './cuadrillas.service';
import { Cuadrilla } from '../../entities/cuadrilla.entity';
import { Tecnico } from '../../entities/tecnico.entity';
import { NotFoundException } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('CuadrillasService', () => {
  let service: CuadrillasService;

  const mockCuadrillaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTecnicoRepository = {
    update: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CuadrillasService,
        {
          provide: getRepositoryToken(Cuadrilla),
          useValue: mockCuadrillaRepository,
        },
        {
          provide: getRepositoryToken(Tecnico),
          useValue: mockTecnicoRepository,
        },
      ],
    }).compile();

    service = module.get<CuadrillasService>(CuadrillasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all cuadrillas', async () => {
      mockCuadrillaRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(mockCuadrillaRepository.find).toHaveBeenCalledWith({ relations: ['tecnicos', 'supervisor'] });
    });
  });

  describe('findOne', () => {
    it('should return one cuadrilla', async () => {
      const cuadrilla = { id: '123' };
      mockCuadrillaRepository.findOne.mockResolvedValue(cuadrilla);
      const result = await service.findOne('123');
      expect(result).toEqual(cuadrilla);
    });

    it('should throw NotFoundException if not found', async () => {
      mockCuadrillaRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a cuadrilla', async () => {
      const dto = { nombre: 'Cuadrilla 1', zona: 'Norte' };
      mockCuadrillaRepository.create.mockReturnValue(dto);
      mockCuadrillaRepository.save.mockResolvedValue({ id: '123', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('123');
      expect(mockCuadrillaRepository.save).toHaveBeenCalled();
    });
  });

  describe('addTecnicos', () => {
    it('should update tecnicos with cuadrillaId', async () => {
      mockCuadrillaRepository.findOne.mockResolvedValue({ id: 'c1' });
      await service.addTecnicos('c1', ['t1', 't2']);
      expect(mockTecnicoRepository.update).toHaveBeenCalledTimes(2);
      expect(mockTecnicoRepository.update).toHaveBeenCalledWith('t1', { cuadrillaId: 'c1' });
      expect(mockTecnicoRepository.update).toHaveBeenCalledWith('t2', { cuadrillaId: 'c1' });
    });
  });

  describe('removeTecnico', () => {
    it('should throw if tecnico not in cuadrilla', async () => {
      mockCuadrillaRepository.findOne.mockResolvedValue({ id: 'c1' });
      mockTecnicoRepository.findOneBy.mockResolvedValue(null);
      await expect(service.removeTecnico('c1', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should remove tecnico from cuadrilla', async () => {
      mockCuadrillaRepository.findOne.mockResolvedValue({ id: 'c1' });
      mockTecnicoRepository.findOneBy.mockResolvedValue({ id: 't1', cuadrillaId: 'c1' });
      await service.removeTecnico('c1', 't1');
      expect(mockTecnicoRepository.update).toHaveBeenCalledWith('t1', { cuadrillaId: undefined });
    });
  });
});
