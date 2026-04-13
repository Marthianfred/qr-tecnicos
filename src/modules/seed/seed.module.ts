import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../../entities/user.entity';
import { Technician } from '../../entities/technician.entity';
import { Certification } from '../../entities/certification.entity';
import { Product } from '../../entities/product.entity';
import { Country } from '../../entities/country.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Technician, Certification, Product, Country]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
