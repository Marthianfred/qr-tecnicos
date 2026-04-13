import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { Technician, TechnicianStatus } from '../../entities/technician.entity';
import { Certification, NivelCertification } from '../../entities/certification.entity';
import { User } from '../../entities/user.entity';
import { TrustLayerService } from './trust-layer.service';
import { UnauthorizedException } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let trustLayer: TrustLayerService;

  const mockTechnicianRepository = {
    findOne: jest.fn(),
  };

  const mockCertificationRepository = {
    find: jest.fn(),
  };

  const mockTrustLayerService = {
    validateTriplePlay: jest.fn(),
    validateAntiReplay: jest.fn(),
    markTokenAsUsed: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        JwtModule.register({
          secret: 'testSecret',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: TrustLayerService,
          useValue: mockTrustLayerService,
        },
        {
          provide: getRepositoryToken(Technician),
          useValue: mockTechnicianRepository,
        },
        {
          provide: getRepositoryToken(Certification),
          useValue: mockCertificationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    trustLayer = module.get<TrustLayerService>(TrustLayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQR', () => {
    it('should call trustLayer.validateTriplePlay', async () => {
      const tecnico = {
        id: '123',
        name: 'Juan Perez',
        documentId: 'V12345678',
        country: 'VE',
        status: TechnicianStatus.ACTIVO,
        certificaciones: [{ nivel: NivelCertification.INTEGRAL }],
      };
      mockTechnicianRepository.findOne.mockResolvedValue(tecnico);
      mockTrustLayerService.validateTriplePlay.mockResolvedValue({ nivel: NivelCertification.INTEGRAL });

      await service.generateQR('123');
      expect(mockTrustLayerService.validateTriplePlay).toHaveBeenCalledWith(tecnico);
    });

    it('should return a qr_token if trustLayer validation passes', async () => {
      const tecnico = {
        id: '123',
        name: 'Juan Perez',
        documentId: 'V12345678',
        country: 'VE',
        status: TechnicianStatus.ACTIVO,
        certificaciones: [{ nivel: NivelCertification.INTEGRAL }],
      };
      mockTechnicianRepository.findOne.mockResolvedValue(tecnico);
      mockTrustLayerService.validateTriplePlay.mockResolvedValue({ nivel: NivelCertification.INTEGRAL });

      const result = await service.generateQR('123');
      expect(result).toHaveProperty('qr_token');
    });

    it('should throw if trustLayer.validateTriplePlay throws', async () => {
      mockTechnicianRepository.findOne.mockResolvedValue({ id: '123' });
      mockTrustLayerService.validateTriplePlay.mockRejectedValue(new UnauthorizedException('TrustLayer Fail'));

      await expect(service.generateQR('123')).rejects.toThrow('TrustLayer Fail');
    });
  });

  describe('validateToken', () => {
    it('should call trustLayer.validateAntiReplay and markTokenAsUsed', async () => {
      const payload = { sub: '123', name: 'Juan' };
      const token = jwtService.sign(payload);
      
      mockTrustLayerService.validateAntiReplay.mockResolvedValue(undefined);
      mockTrustLayerService.markTokenAsUsed.mockResolvedValue(undefined);

      const result = await service.validateToken(token);
      
      expect(mockTrustLayerService.validateAntiReplay).toHaveBeenCalledWith(token);
      expect(mockTrustLayerService.markTokenAsUsed).toHaveBeenCalledWith(token);
      expect(result.name).toBe('Juan');
    });

    it('should throw if trustLayer.validateAntiReplay throws', async () => {
      mockTrustLayerService.validateAntiReplay.mockRejectedValue(new UnauthorizedException('Replay detected'));

      await expect(service.validateToken('someToken')).rejects.toThrow('Replay detected');
    });
  });
});
