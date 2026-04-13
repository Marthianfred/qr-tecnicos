import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { Tecnico, TecnicoStatus } from '../../entities/tecnico.entity';
import { Certificacion, NivelCertificacion } from '../../entities/certificacion.entity';
import { Producto } from '../../entities/producto.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tecnico)
    private tecnicoRepository: Repository<Tecnico>,
    @InjectRepository(Certificacion)
    private certificacionRepository: Repository<Certificacion>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async onModuleInit() {
    // Si queremos que se ejecute al levantar, descomentar:
    await this.runSeed();
  }

  async runSeed() {
    await this.seedUsers();
    await this.seedTecnicos();
    await this.seedProductos();
    return { message: 'Seed completed successfully' };
  }

  private async seedUsers() {
    const saltRounds = 10;
    const users = [
      { username: 'admin', password: 'Fibex#Admin.2026!', role: UserRole.ADMIN },
      { username: 'coordinator', password: 'Fibex#Coord.2026!', role: UserRole.COORDINATOR },
      { username: 'tech_user', password: 'Fibex#Tech.2026!', role: UserRole.TECHNICIAN },
    ];

    for (const u of users) {
      const exists = await this.userRepository.findOneBy({ username: u.username });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(u.password, saltRounds);
        const user = this.userRepository.create({ ...u, password: hashedPassword });
        await this.userRepository.save(user);
      } else {
        // Fuerza la actualización si detecta que es el admin y queremos cambiarle la clave
        const isOldPassword = !exists.password.startsWith('$2b$') || (u.username === 'admin' && !(await bcrypt.compare(u.password, exists.password)));
        if (isOldPassword) {
          console.log(`Actualizando seguridad para usuario: ${u.username}`);
          exists.password = await bcrypt.hash(u.password, saltRounds);
          await this.userRepository.save(exists);
        }
      }
    }
  }

  private async seedTecnicos() {
    const tecnicosData = [
      { nombre: 'Juan Perez', documento: '12345678', cargo: 'Técnico Especialista III', pais: 'VE', zona: 'Caracas - Capitolio', status: TecnicoStatus.ACTIVO },
      { nombre: 'Maria Garcia', documento: '87654321', cargo: 'Coordinadora de Cuadrilla', pais: 'VE', zona: 'Caracas - Chacao', status: TecnicoStatus.ACTIVO },
    ];

    for (const tData of tecnicosData) {
      let tecnico = await this.tecnicoRepository.findOneBy({ documento: tData.documento });
      if (!tecnico) {
        tecnico = this.tecnicoRepository.create(tData);
        tecnico = await this.tecnicoRepository.save(tecnico);

        // Add some certifications
        const cert = this.certificacionRepository.create({
          nivel: NivelCertificacion.PREMIUM,
          fechaEmision: new Date(),
          fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          tecnico: tecnico,
        });
        await this.certificacionRepository.save(cert);
      }
    }
  }

  private async seedProductos() {
    const productosData = [
      { nombre: 'Router Dual Band', sku: 'ROUT-001', precio: 45.0, stock: 100 },
      { nombre: 'ONT Fibex Plus', sku: 'ONT-002', precio: 60.0, stock: 50 },
    ];

    for (const p of productosData) {
      const exists = await this.productoRepository.findOneBy({ sku: p.sku });
      if (!exists) {
        const producto = this.productoRepository.create(p);
        await this.productoRepository.save(producto);
      }
    }
  }
}
