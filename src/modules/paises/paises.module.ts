import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from '../../entities/country.entity';
import { CountryesService } from './paises.service';
import { CountryesController } from './paises.controller';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Country]), AuthModule],
  controllers: [CountryesController],
  providers: [CountryesService],
  exports: [CountryesService],
})
export class CountryesModule {}
