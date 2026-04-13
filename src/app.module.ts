import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { TechniciansModule } from './modules/tecnicos/tecnicos.module';
import { SquadsModule } from './modules/cuadrillas/cuadrillas.module';
import { ProductsModule } from './modules/productos/productos.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { RedisModule } from './common/redis/redis.module';
import { SeedModule } from './modules/seed/seed.module';
import { EtlModule } from './modules/etl/etl.module';
import { CountriesModule } from './modules/paises/paises.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { DepartmentsModule } from './modules/departamentos/departamentos.module';
import { Technician } from './entities/technician.entity';
import { Squad } from './entities/squad.entity';
import { Department } from './entities/department.entity';
import { Certification } from './entities/certification.entity';
import { InconsistencyReport } from './entities/inconsistency-report.entity';
import { Product } from './entities/product.entity';
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { Country } from './entities/country.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'client'),
      exclude: ['/api*'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'fibex_qr',
      entities: [Technician, Squad, Department, Certification, InconsistencyReport, Product, User, Company, Country],
      synchronize: true, 
      extra: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    }),
    RedisModule,
    SeedModule,
    EtlModule,
    AuthModule,
    TechniciansModule,
    SquadsModule,
    ProductsModule,
    InventoryModule,
    PricingModule,
    CountriesModule,
    CompaniesModule,
    DepartmentsModule,
  ],
})
export class AppModule {}
