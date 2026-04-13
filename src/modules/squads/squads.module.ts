import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SquadsService } from './squads.service';
import { SquadsController } from './squads.controller';
import { Squad } from '../../entities/squad.entity';
import { Technician } from '../../entities/technician.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Squad, Technician]),
    AuthModule,
  ],
  controllers: [SquadsController],
  providers: [SquadsService],
  exports: [SquadsService],
})
export class SquadsModule {}
