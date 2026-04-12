import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TrustLayerService } from './trust-layer.service';
import { KeycloakIAMService } from '../../services/iam.service';
import { Tecnico } from '../../entities/tecnico.entity';
import { Certificacion } from '../../entities/certificacion.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tecnico, Certificacion, User]),
    EventEmitterModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, TrustLayerService, KeycloakIAMService],
  controllers: [AuthController],
  exports: [AuthService, TrustLayerService, JwtModule, KeycloakIAMService],
})
export class AuthModule {}
