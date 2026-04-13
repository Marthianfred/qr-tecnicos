import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { Technician, TechnicianStatus } from '../../entities/technician.entity';
import { Certification, NivelCertification } from '../../entities/certification.entity';
import { Product } from '../../entities/product.entity';
import { Country } from '../../entities/country.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Technician)
    private tecnicoRepository: Repository<Technician>,
    @InjectRepository(Certification)
    private certificacionRepository: Repository<Certification>,
    @InjectRepository(Product)
    private productoRepository: Repository<Product>,
    @InjectRepository(Country)
    private paisRepository: Repository<Country>,
  ) {}

  async onModuleInit() {
    // Si queremos que se ejecute al levantar, descomentar:
    await this.runSeed();
  }

  async runSeed() {
    await this.seedUsers();
    await this.seedTechnicians();
    await this.seedProducts();
    await this.seedCountryes();
    return { message: 'Seed completed successfully' };
  }

  private async seedCountryes() {
    const paisesData = [
      { codigo: 'VE', name: 'Venezuela', bandera: '🇻🇪' },
      { codigo: 'PE', name: 'Perú', bandera: '🇵🇪' },
      { codigo: 'RD', name: 'República Dominicana', bandera: '🇩🇴' },
    ];

    for (const p of paisesData) {
      const exists = await this.countryRepository.findOneBy({ codigo: p.codigo });
      if (!exists) {
        const pais = this.countryRepository.create(p);
        await this.countryRepository.save(pais);
      }
    }
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

  private async seedTechnicians() {
    const tecnicosData = [
      { name: 'Juan Perez', documentId: '12345678', role: 'Técnico Especialista III', country: 'VE', zona: 'Caracas - Capitolio', status: TechnicianStatus.ACTIVO },
      { name: 'Maria Garcia', documentId: '87654321', role: 'Coordinadora de Squad', country: 'VE', zona: 'Caracas - Chacao', status: TechnicianStatus.ACTIVO },
    ];

    for (const tData of tecnicosData) {
      let tecnico = await this.tecnicoRepository.findOneBy({ documentId: tData.documentId });
      if (!tecnico) {
        tecnico = this.tecnicoRepository.create(tData);
        tecnico = await this.tecnicoRepository.save(tecnico);

        // Add some certifications
        const cert = this.certificacionRepository.create({
          nivel: NivelCertification.PREMIUM,
          fechaEmision: new Date(),
          fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          tecnico: tecnico,
        });
        await this.certificacionRepository.save(cert);
      }
    }
  }

  private async seedProducts() {
    const productosData = [
      { name: 'Router Dual Band', sku: 'ROUT-001', price: 45.0, stock: 100 },
      { name: 'ONT Fibex Plus', sku: 'ONT-002', price: 60.0, stock: 50 },
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
