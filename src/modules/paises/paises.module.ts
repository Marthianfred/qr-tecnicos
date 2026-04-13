import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pais } from '../../entities/pais.entity';
import { PaisesService } from './paises.service';
import { PaisesController } from './paises.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pais])],
  controllers: [PaisesController],
  providers: [PaisesService],
  exports: [PaisesService],
})
export class PaisesModule {}
