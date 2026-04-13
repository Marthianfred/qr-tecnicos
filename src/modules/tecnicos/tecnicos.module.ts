import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from '../../entities/technician.entity';
import { Certification } from '../../entities/certification.entity';
import { InconsistencyReport } from '../../entities/inconsistency-report.entity';
import { TechniciansService } from './tecnicos.service';
import { TechniciansController } from './tecnicos.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Technician, Certification, InconsistencyReport]),
    AuthModule,
  ],
  controllers: [TechniciansController],
  providers: [TechniciansService],
})
export class TechniciansModule {}
