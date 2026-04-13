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
    private technicianRepository: Repository<Technician>,
    @InjectRepository(Certification)
    private certificationRepository: Repository<Certification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async login(username: string, pass: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const payload = { username: user.username, sub: user.id, role: user.role, countryScope: user.countryScope };
      return {
        access_token: this.jwtService.sign(payload, { expiresIn: '8h' }),
        refresh_token: this.jwtService.sign(payload, { expiresIn: '24h' }),
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          countryScope: user.countryScope,
        },
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const newPayload = { username: payload.username, sub: payload.sub, role: payload.role, countryScope: payload.countryScope };
      return {
        access_token: this.jwtService.sign(newPayload, { expiresIn: '8h' }),
      };
    } catch (e) {
      throw new UnauthorizedException('Session expired. Please login again.');
    }
  }

  async generateQR(technicianId: string) {
    const technician = await this.technicianRepository.findOne({
      where: { id: technicianId },
      relations: ['certifications'],
    });

    if (!technician) throw new UnauthorizedException('Technician not found');

    const bestCert = await this.trustLayer.validateTriplePlay(technician);

    const payload = {
      sub: technician.id,
      name: technician.name,
      documentId: technician.documentId,
      country: technician.country,
      level: bestCert.level,
    };

    const qr_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    this.eventEmitter.emit('qr.generated', { technicianId, country: technician.country });

    return { qr_token };
  }

  async validateToken(token: string) {
    await this.trustLayer.validateAntiReplay(token);

    try {
      const payload = this.jwtService.verify(token);
      await this.trustLayer.markTokenAsUsed(token);
      return payload;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('TrustLayer: Invalid or expired token');
    }
  }
}
