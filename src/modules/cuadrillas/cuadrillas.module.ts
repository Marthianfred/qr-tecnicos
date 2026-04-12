import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuadrillasService } from './cuadrillas.service';
import { CuadrillasController } from './cuadrillas.controller';
import { Cuadrilla } from '../../entities/cuadrilla.entity';
import { Tecnico } from '../../entities/tecnico.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cuadrilla, Tecnico]),
    AuthModule,
  ],
  controllers: [CuadrillasController],
  providers: [CuadrillasService],
  exports: [CuadrillasService],
})
export class CuadrillasModule {}
