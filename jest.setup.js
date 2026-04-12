process.env.JWT_SECRET = 'test-secret-gate-keep';
process.env.KEYCLOAK_JWKS_URL = 'http://localhost:8080/realms/master/protocol/openid-connect/certs';
process.env.KEYCLOAK_ISSUER = 'http://localhost:8080/realms/master';
process.env.KEYCLOAK_AUDIENCE = 'fibex-secure-visit';

// Global mock to avoid ESM parsing issues with jose/jwks-rsa
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

// Global mock for KeycloakIAMService to allow tests to pass with local tokens
jest.mock('./src/services/iam.service', () => {
  return {
    KeycloakIAMService: jest.fn().mockImplementation(() => {
      return {
        onModuleInit: jest.fn(),
        validateToken: jest.fn().mockImplementation(async (token) => {
          // Fallback to local JWT verification for tests
          const jwt = require('jsonwebtoken');
          try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-gate-keep');
            return {
              id: payload.sub,
              username: payload.username,
              role: payload.role || (payload.realm_access?.roles?.includes('admin') ? 'admin' : 'user'),
              email: payload.email,
            };
          } catch (e) {
            const { UnauthorizedException } = require('@nestjs/common');
            throw new UnauthorizedException('Invalid token in global mock');
          }
        }),
      };
    }),
  };
});


