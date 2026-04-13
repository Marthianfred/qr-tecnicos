import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtlService } from './etl.service';
import { EtlController } from './etl.controller';
import { Company } from '../../entities/company.entity';
import { User } from '../../entities/user.entity';
import { Squad } from '../../entities/squad.entity';
import { Technician } from '../../entities/technician.entity';
import { Certification } from '../../entities/certification.entity';

import { AuthModule } from '../auth/auth.module';
import { DepartmentsModule } from '../departamentos/departamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, Squad, Technician, Certification]),
    AuthModule,
    DepartmentsModule,
  ],
  controllers: [EtlController],
  providers: [EtlService],
  exports: [EtlService],
})
export class EtlModule {}
