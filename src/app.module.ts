import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { TecnicosModule } from './modules/tecnicos/tecnicos.module';
import { CuadrillasModule } from './modules/cuadrillas/cuadrillas.module';
import { ProductosModule } from './modules/productos/productos.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { RedisModule } from './common/redis/redis.module';
import { SeedModule } from './modules/seed/seed.module';
import { EtlModule } from './modules/etl/etl.module';
import { KeycloakIAMService } from './services/iam.service';
import { Tecnico } from './entities/tecnico.entity';
import { Cuadrilla } from './entities/cuadrilla.entity';
import { Certificacion } from './entities/certificacion.entity';
import { ReporteInconsistencia } from './entities/reporte-inconsistencia.entity';
import { Producto } from './entities/producto.entity';
import { User } from './entities/user.entity';
import { Empresa } from './entities/empresa.entity';

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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'fibex_qr',
      entities: [Tecnico, Cuadrilla, Certificacion, ReporteInconsistencia, Producto, User, Empresa],
      synchronize: true, // Solo para desarrollo
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
    TecnicosModule,
    CuadrillasModule,
    ProductosModule,
    InventoryModule,
    PricingModule,
  ],
})
export class AppModule {}
