import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

export interface IAMUser {
  id: string;
  username: string;
  role: string;
  email?: string;
}

interface KeycloakPayload {
  sub: string;
  preferred_username?: string;
  username?: string;
  role?: string;
  realm_access?: {
    roles: string[];
  };
  email?: string;
}

@Injectable()
export class KeycloakIAMService implements OnModuleInit {
  private jwksClient!: JwksClient;
  private readonly jwksUrl = process.env.KEYCLOAK_JWKS_URL;
  private readonly issuer = process.env.KEYCLOAK_ISSUER;
  private readonly audience = process.env.KEYCLOAK_AUDIENCE;

  onModuleInit() {
    if (this.jwksUrl) {
      this.jwksClient = new JwksClient({
        jwksUri: this.jwksUrl,
        cache: true,
        rateLimit: true,
      });
    }
  }

  /**
   * Validates an OIDC token from Keycloak using JWKS.
   */
  async validateToken(token: string): Promise<IAMUser> {
    if (!this.jwksUrl) {
      throw new Error('KEYCLOAK_JWKS_URL is not configured. OIDC validation is mandatory.');
    }

    try {
      const decodedToken = jwt.decode(token, { complete: true });
      if (!decodedToken || typeof decodedToken === 'string' || !decodedToken.header || !decodedToken.header.kid) {
        throw new UnauthorizedException('Invalid token format: missing kid');
      }

      const key = await this.jwksClient.getSigningKey(decodedToken.header.kid);
      const publicKey = key.getPublicKey();

      const decoded = jwt.verify(token, publicKey, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ['RS256'],
      }) as unknown as KeycloakPayload;

      return this.mapPayloadToUser(decoded);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('OIDC Token Validation Failed:', message);
      throw new UnauthorizedException('Invalid or expired OIDC token');
    }
  }

  private mapPayloadToUser(decoded: KeycloakPayload): IAMUser {
    return {
      id: decoded.sub,
      username: decoded.preferred_username || decoded.username || 'unknown',
      role: decoded.role || (decoded.realm_access?.roles?.includes('admin') ? 'admin' : 'user'),
      email: decoded.email,
    };
  }
}
