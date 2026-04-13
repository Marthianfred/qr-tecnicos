import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Technician, TechnicianStatus } from '../../entities/technician.entity';
import { Certification, CertificationLevel } from '../../entities/certification.entity';

const LEVEL_HIERARCHY: Record<CertificationLevel, number> = {
  [CertificationLevel.INITIAL]: 1,
  [CertificationLevel.BASIC]: 2,
  [CertificationLevel.INTEGRAL]: 3,
  [CertificationLevel.PREMIUM]: 4,
};

@Injectable()
export class TrustLayerService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * Integrally validates the Triple Play model + Anti-Replay
   */
  async validateFullTrust(technician: Technician, token?: string): Promise<Certification> {
    const highestCert = await this.validateTriplePlay(technician);

    if (token) {
      await this.validateAntiReplay(token);
    }

    return highestCert;
  }

  /**
   * Validates the 3 factors of the Triple Play model
   * 1. Identity: Technician exists.
   * 2. Operating Status: Technician is ACTIVE.
   * 3. Certification: Technician has valid certifications.
   */
  async validateTriplePlay(technician: Technician): Promise<Certification> {
    if (!technician) {
      throw new UnauthorizedException('TrustLayer: Identity Failure - Technician not found');
    }

    if (technician.status !== TechnicianStatus.ACTIVE) {
      throw new UnauthorizedException(`TrustLayer: Status Failure - Technician in state ${technician.status}`);
    }

    const validCerts = this.getValidCertifications(technician);

    if (validCerts.length === 0) {
      if (!technician.certifications || technician.certifications.length === 0) {
        throw new UnauthorizedException('TrustLayer: Certification Failure - No training records found');
      }
      throw new UnauthorizedException('TrustLayer: Certification Failure - Technician has expired certifications');
    }

    return validCerts.reduce((prev, current) => {
      return LEVEL_HIERARCHY[current.level] > LEVEL_HIERARCHY[prev.level] ? current : prev;
    });
  }

  /**
   * Filters valid certifications
   */
  getValidCertifications(technician: Technician): Certification[] {
    if (!technician.certifications) return [];
    
    const now = new Date();
    return technician.certifications.filter(cert => {
      if (!cert.expiresAt) return true;
      return new Date(cert.expiresAt) > now;
    });
  }

  async validateAntiReplay(token: string): Promise<void> {
    const isUsed = await this.redis.get(`used_token:${token}`);
    if (isUsed) {
      throw new UnauthorizedException('TrustLayer: Security Alert - This token has already been reused');
    }
  }

  async markTokenAsUsed(token: string): Promise<void> {
    await this.redis.set(`used_token:${token}`, 'true', 'EX', 15 * 60);
  }
}
