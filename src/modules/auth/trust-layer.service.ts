import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Tecnico, TecnicoStatus } from '../../entities/tecnico.entity';
import { Certificacion, NivelCertificacion } from '../../entities/certificacion.entity';

const NIVEL_HIERARCHY: Record<NivelCertificacion, number> = {
  [NivelCertificacion.INICIAL]: 1,
  [NivelCertificacion.BASICO]: 2,
  [NivelCertificacion.INTEGRAL]: 3,
  [NivelCertificacion.PREMIUM]: 4,
};

@Injectable()
export class TrustLayerService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * Valida integralmente el modelo Triple Play + Anti-Replay
   */
  async validateFullTrust(tecnico: Tecnico, token?: string): Promise<Certificacion> {
    // 1. Validaciones Triple Play Core
    const highestCert = await this.validateTriplePlay(tecnico);

    // 2. Validación Anti-Replay (Factor 4) si se provee un token
    if (token) {
      await this.validateAntiReplay(token);
    }

    return highestCert;
  }

  /**
   * Valida los 3 factores del modelo Triple Play
   * 1. Identidad: El técnico existe en el sistema.
   * 2. Estatus Operativo: El técnico está ACTIVO.
   * 3. Certificación: El técnico tiene certificaciones vigentes.
   * @returns La certificación de mayor nivel encontrada.
   */
  async validateTriplePlay(tecnico: Tecnico): Promise<Certificacion> {
    // Factor 1: Identidad
    if (!tecnico) {
      throw new UnauthorizedException('TrustLayer: Fallo de Identidad - Técnico no encontrado');
    }

    // Factor 2: Estatus Operativo
    if (tecnico.status !== TecnicoStatus.ACTIVO) {
      throw new UnauthorizedException(`TrustLayer: Fallo de Estatus - Técnico en estado ${tecnico.status}`);
    }

    // Factor 3: Certificación
    const validCerts = this.getValidCertifications(tecnico);

    if (validCerts.length === 0) {
      if (!tecnico.certificaciones || tecnico.certificaciones.length === 0) {
        throw new UnauthorizedException('TrustLayer: Fallo de Certificación - Sin registros de formación');
      }
      throw new UnauthorizedException('TrustLayer: Fallo de Certificación - El técnico posee certificaciones vencidas');
    }

    // Retornar la de mayor nivel según la jerarquía
    return validCerts.reduce((prev, current) => {
      return NIVEL_HIERARCHY[current.nivel] > NIVEL_HIERARCHY[prev.nivel] ? current : prev;
    });
  }

  /**
   * Filtra certificaciones vigentes
   */
  getValidCertifications(tecnico: Tecnico): Certificacion[] {
    if (!tecnico.certificaciones) return [];
    
    const now = new Date();
    return tecnico.certificaciones.filter(cert => {
      if (!cert.fechaExpiracion) return true;
      return new Date(cert.fechaExpiracion) > now;
    });
  }

  /**
   * Implementa validación Anti-Replay (Factor 4) usando Redis
   */
  async validateAntiReplay(token: string): Promise<void> {
    const isUsed = await this.redis.get(`used_token:${token}`);
    if (isUsed) {
      throw new UnauthorizedException('TrustLayer: Alerta de Seguridad - Este token ya ha sido reutilizado');
    }
  }

  /**
   * Marca un token como usado en Redis con un TTL de 15 minutos (matching JWT expiry)
   */
  async markTokenAsUsed(token: string): Promise<void> {
    await this.redis.set(`used_token:${token}`, 'true', 'EX', 15 * 60);
  }
}
