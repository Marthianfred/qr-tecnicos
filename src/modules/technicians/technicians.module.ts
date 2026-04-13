import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from '../../entities/technician.entity';
import { Certification } from '../../entities/certification.entity';
import { InconsistencyReport } from '../../entities/inconsistency-report.entity';
import { TechniciansService } from './technicians.service';
import { TechniciansController } from './technicians.controller';
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
