import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../../entities/user.entity';
import { Tecnico } from '../../entities/tecnico.entity';
import { Certificacion } from '../../entities/certificacion.entity';
import { Producto } from '../../entities/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tecnico, Certificacion, Producto]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
