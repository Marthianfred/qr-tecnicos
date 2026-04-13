import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { Technician, TechnicianStatus } from '../../entities/technician.entity';
import { Certification, CertificationLevel } from '../../entities/certification.entity';
import { Product } from '../../entities/product.entity';
import { Country } from '../../entities/country.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Technician)
    private technicianRepository: Repository<Technician>,
    @InjectRepository(Certification)
    private certificationRepository: Repository<Certification>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  async onModuleInit() {
    await this.runSeed();
  }

  async runSeed() {
    await this.seedUsers();
    await this.seedTechnicians();
    await this.seedProducts();
    await this.seedCountries();
    return { message: 'Seed completed successfully' };
  }

  private async seedCountries() {
    const countriesData = [
      { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
      { code: 'PE', name: 'Perú', flag: '🇵🇪' },
      { code: 'RD', name: 'República Dominicana', flag: '🇩🇴' },
    ];

    for (const c of countriesData) {
      const exists = await this.countryRepository.findOneBy({ code: c.code });
      if (!exists) {
        const country = this.countryRepository.create(c);
        await this.countryRepository.save(country);
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
        const isOldPassword = !exists.password.startsWith('$2b$') || (u.username === 'admin' && !(await bcrypt.compare(u.password, exists.password)));
        if (isOldPassword) {
          exists.password = await bcrypt.hash(u.password, saltRounds);
          await this.userRepository.save(exists);
        }
      }
    }
  }

  private async seedTechnicians() {
    const techniciansData = [
      { name: 'Juan Perez', documentId: '12345678', role: 'Field Technician III', country: 'VE', zone: 'Caracas - Capitolio', status: TechnicianStatus.ACTIVE },
      { name: 'Maria Garcia', documentId: '87654321', role: 'Squad Coordinator', country: 'VE', zone: 'Caracas - Chacao', status: TechnicianStatus.ACTIVE },
    ];

    for (const tData of techniciansData) {
      let technician = await this.technicianRepository.findOneBy({ documentId: tData.documentId });
      if (!technician) {
        technician = this.technicianRepository.create(tData);
        technician = await this.technicianRepository.save(technician);

        const cert = this.certificationRepository.create({
          level: CertificationLevel.PREMIUM,
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          technician: technician,
        });
        await this.certificationRepository.save(cert);
      }
    }
  }

  private async seedProducts() {
    const productsData = [
      { name: 'Router Dual Band', sku: 'ROUT-001', price: 45.0, stock: 100 },
      { name: 'ONT Fibex Plus', sku: 'ONT-002', price: 60.0, stock: 50 },
    ];

    for (const p of productsData) {
      const exists = await this.productRepository.findOneBy({ sku: p.sku });
      if (!exists) {
        const product = this.productRepository.create(p);
        await this.productRepository.save(product);
      }
    }
  }
}
