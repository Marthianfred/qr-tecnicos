import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtlService } from './etl.service';
import { EtlController } from './etl.controller';
import { Empresa } from '../../entities/empresa.entity';
import { User } from '../../entities/user.entity';
import { Cuadrilla } from '../../entities/cuadrilla.entity';
import { Tecnico } from '../../entities/tecnico.entity';
import { Certificacion } from '../../entities/certificacion.entity';

import { AuthModule } from '../auth/auth.module';
import { DepartamentosModule } from '../departamentos/departamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, User, Cuadrilla, Tecnico, Certificacion]),
    AuthModule,
    DepartamentosModule,
  ],
  controllers: [EtlController],
  providers: [EtlService],
  exports: [EtlService],
})
export class EtlModule {}
