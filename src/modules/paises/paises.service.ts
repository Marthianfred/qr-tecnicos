import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../../entities/country.entity';

@Injectable()
export class CountryesService implements OnModuleInit {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  async onModuleInit() {
    const count = await this.countryRepository.count();
    if (count === 0) {
      await this.countryRepository.save([
        { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
        { code: 'PE', name: 'Perú', flag: '🇵🇪' },
        { code: 'RD', name: 'República Dominicana', flag: '🇩🇴' },
      ]);
      console.log('🌎 Base countries initialized in the system');
    }
  }

  async findAll() {
    return this.countryRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    return this.countryRepository.findOneBy({ id });
  }

  async create(countryData: Partial<Country>) {
    const country = this.countryRepository.create(countryData);
    return this.countryRepository.save(country);
  }

  async update(id: string, countryData: Partial<Country>) {
    await this.countryRepository.update(id, countryData);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.countryRepository.delete(id);
    return { deleted: true };
  }
}
