import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pais } from '../../entities/pais.entity';
import { PaisesService } from './paises.service';
import { PaisesController } from './paises.controller';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pais]), AuthModule],
  controllers: [PaisesController],
  providers: [PaisesService],
  exports: [PaisesService],
})
export class PaisesModule {}
