import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Technician } from '../../entities/technician.entity';
import { Certification } from '../../entities/certification.entity';
import { User } from '../../entities/user.entity';
import { TrustLayerService } from './trust-layer.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private trustLayer: TrustLayerService,
    @InjectRepository(Technician)
    private tecnicoRepository: Repository<Technician>,
    @InjectRepository(Certification)
    private certificacionRepository: Repository<Certification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async login(username: string, pass: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const payload = { username: user.username, sub: user.id, role: user.role, paisScope: user.countryScope };
      return {
        access_token: this.jwtService.sign(payload, { expiresIn: '8h' }),
        refresh_token: this.jwtService.sign(payload, { expiresIn: '24h' }),
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          paisScope: user.countryScope,
        },
      };
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const newPayload = { username: payload.username, sub: payload.sub, role: payload.role, paisScope: payload.countryScope };
      return {
        access_token: this.jwtService.sign(newPayload, { expiresIn: '8h' }),
      };
    } catch (e) {
      throw new UnauthorizedException('Sesión expirada. Por favor, inicie sesión de nuevo.');
    }
  }

  async generateQR(tecnicoId: string) {
    const tecnico = await this.tecnicoRepository.findOne({
      where: { id: tecnicoId },
      relations: ['certificaciones'],
    });

    // Aplicar Motor de Validaciones Triple Play (TrustLayer)
    // El motor ahora retorna la mejor certificación válida
    const bestCert = await this.trustLayer.validateTriplePlay(tecnico!);

    const payload = {
      sub: tecnico!.id,
      name: tecnico!.name,
      documentId: tecnico!.documentId,
      country: tecnico!.country,
      nivel: bestCert.nivel,
    };

    const qr_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    // Emitir evento para el monitor de real-time
    this.eventEmitter.emit('qr.generated', { tecnicoId, country: tecnico!.country });

    return { qr_token };
  }

  async validateToken(token: string) {
    // Aplicar Factor 4: Anti-Replay (TrustLayer)
    await this.trustLayer.validateAntiReplay(token);

    try {
      const payload = this.jwtService.verify(token);
      
      // Marcar como usado después de la primera validación exitosa
      await this.trustLayer.markTokenAsUsed(token);
      
      return payload;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('TrustLayer: Token inválido o expirado');
    }
  }
}
