import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tecnico } from '../../entities/tecnico.entity';
import { Certificacion } from '../../entities/certificacion.entity';
import { ReporteInconsistencia } from '../../entities/reporte-inconsistencia.entity';
import { TecnicosService } from './tecnicos.service';
import { TecnicosController } from './tecnicos.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tecnico, Certificacion, ReporteInconsistencia]),
    AuthModule,
  ],
  controllers: [TecnicosController],
  providers: [TecnicosService],
})
export class TecnicosModule {}
