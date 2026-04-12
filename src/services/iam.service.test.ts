import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakIAMService } from './iam.service';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

jest.unmock('./iam.service');

jest.mock('jwks-rsa', () => {
  return {
    JwksClient: jest.fn().mockImplementation(() => {
      return {
        getSigningKey: jest.fn().mockResolvedValue({
          getPublicKey: () => 'test-public-key',
        }),
      };
    }),
  };
});

jest.mock('jsonwebtoken');

describe('KeycloakIAMService', () => {
  let service: KeycloakIAMService;

  beforeEach(async () => {
    process.env.KEYCLOAK_JWKS_URL = 'http://localhost/jwks';
    process.env.KEYCLOAK_ISSUER = 'http://localhost/issuer';
    process.env.KEYCLOAK_AUDIENCE = 'test-audience';

    const module: TestingModule = await Test.createTestingModule({
      providers: [KeycloakIAMService],
    }).compile();

    service = module.get<KeycloakIAMService>(KeycloakIAMService);
    service.onModuleInit();
  });

  afterEach(() => {
    delete process.env.KEYCLOAK_JWKS_URL;
    delete process.env.KEYCLOAK_ISSUER;
    delete process.env.KEYCLOAK_AUDIENCE;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateToken', () => {
    it('should throw error if KEYCLOAK_JWKS_URL is missing', async () => {
      delete process.env.KEYCLOAK_JWKS_URL;
      const newService = new KeycloakIAMService();
      await expect(newService.validateToken('token')).rejects.toThrow(
        'KEYCLOAK_JWKS_URL is not configured'
      );
    });

    it('should validate a valid OIDC token', async () => {
      const mockToken = 'valid.token.payload';
      const mockPayload = {
        sub: 'user-123',
        preferred_username: 'testuser',
        realm_access: { roles: ['admin'] },
        email: 'test@example.com',
      };

      (jwt.decode as jest.Mock).mockReturnValue({
        header: { kid: 'test-kid' },
      });
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = await service.validateToken(mockToken);

      expect(result).toEqual({
        id: 'user-123',
        username: 'testuser',
        role: 'admin',
        email: 'test@example.com',
      });
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-public-key', expect.any(Object));
    });

    it('should throw UnauthorizedException if token format is invalid', async () => {
      (jwt.decode as jest.Mock).mockReturnValue(null);
      await expect(service.validateToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if jwt.verify fails', async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        header: { kid: 'test-kid' },
      });
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Verification failed');
      });

      await expect(service.validateToken('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should use fallback username and default role if missing in payload', async () => {
      const mockToken = 'token';
      const mockPayload = {
        sub: 'user-456',
      };

      (jwt.decode as jest.Mock).mockReturnValue({
        header: { kid: 'test-kid' },
      });
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = await service.validateToken(mockToken);

      expect(result).toEqual({
        id: 'user-456',
        username: 'unknown',
        role: 'user',
        email: undefined,
      });
    });
  });
});
