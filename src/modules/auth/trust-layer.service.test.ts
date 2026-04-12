import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { TrustLayerService } from './trust-layer.service';
import { TecnicoStatus } from '../../entities/tecnico.entity';
import { NivelCertificacion } from '../../entities/certificacion.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('TrustLayerService', () => {
  let service: TrustLayerService;
  let mockRedis: any;

  beforeEach(async () => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrustLayerService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<TrustLayerService>(TrustLayerService);
  });

  describe('validateTriplePlay', () => {
    it('should throw if tecnico is null', async () => {
      await expect(service.validateTriplePlay(null as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if tecnico is inactive', async () => {
      const tecnico = { status: TecnicoStatus.INACTIVO } as any;
      await expect(service.validateTriplePlay(tecnico)).rejects.toThrow(/Fallo de Estatus/);
    });

    it('should throw if tecnico has no certifications', async () => {
      const tecnico = { status: TecnicoStatus.ACTIVO, certificaciones: [] } as any;
      await expect(service.validateTriplePlay(tecnico)).rejects.toThrow(/Sin registros de formación/);
    });

    it('should pass if tecnico has a certification without expiration date', async () => {
      const tecnico = {
        status: TecnicoStatus.ACTIVO,
        certificaciones: [{ nivel: NivelCertificacion.INTEGRAL, fechaExpiracion: null }],
      } as any;
      
      const result = await service.validateTriplePlay(tecnico);
      expect(result.nivel).toBe(NivelCertificacion.INTEGRAL);
    });

    it('should throw if tecnico has only expired certifications', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tecnico = {
        status: TecnicoStatus.ACTIVO,
        certificaciones: [{ fechaExpiracion: yesterday }],
      } as any;
      
      await expect(service.validateTriplePlay(tecnico)).rejects.toThrow(/posee certificaciones vencidas/i);
    });

    it('should return the highest level certification if multiple are valid', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const tecnico = {
        status: TecnicoStatus.ACTIVO,
        certificaciones: [
          { nivel: NivelCertificacion.BASICO, fechaExpiracion: tomorrow },
          { nivel: NivelCertificacion.PREMIUM, fechaExpiracion: tomorrow },
          { nivel: NivelCertificacion.INTEGRAL, fechaExpiracion: tomorrow },
        ],
      } as any;
      
      const result = await service.validateTriplePlay(tecnico);
      expect(result.nivel).toBe(NivelCertificacion.PREMIUM);
    });

    it('should throw if tecnico has no certifications at all', async () => {
      const tecnico = {
        status: TecnicoStatus.ACTIVO,
        certificaciones: [],
      } as any;
      
      await expect(service.validateTriplePlay(tecnico)).rejects.toThrow(/Sin registros de formación/);
    });
  });

  describe('validateFullTrust', () => {
    it('should validate triple play and anti-replay', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tecnico = {
        status: TecnicoStatus.ACTIVO,
        certificaciones: [{ nivel: NivelCertificacion.INTEGRAL, fechaExpiracion: tomorrow }],
      } as any;
      
      mockRedis.get.mockResolvedValue(null);
      
      const result = await service.validateFullTrust(tecnico, 'token123');
      expect(result.nivel).toBe(NivelCertificacion.INTEGRAL);
      expect(mockRedis.get).toHaveBeenCalledWith('used_token:token123');
    });

    it('should skip anti-replay if token is not provided', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tecnico = {
        status: TecnicoStatus.ACTIVO,
        certificaciones: [{ nivel: NivelCertificacion.INTEGRAL, fechaExpiracion: tomorrow }],
      } as any;
      
      const result = await service.validateFullTrust(tecnico);
      expect(result.nivel).toBe(NivelCertificacion.INTEGRAL);
      expect(mockRedis.get).not.toHaveBeenCalled();
    });
  });

  describe('validateAntiReplay', () => {
    it('should throw if token is already in Redis', async () => {
      mockRedis.get.mockResolvedValue('true');
      await expect(service.validateAntiReplay('token123')).rejects.toThrow(/ha sido reutilizado/);
    });

    it('should pass if token is not in Redis', async () => {
      mockRedis.get.mockResolvedValue(null);
      await expect(service.validateAntiReplay('token123')).resolves.not.toThrow();
    });
  });

  describe('markTokenAsUsed', () => {
    it('should set token in Redis with TTL', async () => {
      await service.markTokenAsUsed('token123');
      expect(mockRedis.set).toHaveBeenCalledWith('used_token:token123', 'true', 'EX', 900);
    });
  });
});
