import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async findAll() {
    return this.companyRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const company = await this.companyRepository.findOneBy({ id });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async findByName(name: string) {
    return this.companyRepository.findOneBy({ name });
  }

  async create(companyData: Partial<Company>) {
    const company = this.companyRepository.create(companyData);
    return this.companyRepository.save(company);
  }

  async update(id: string, companyData: Partial<Company>) {
    await this.findOne(id);
    await this.companyRepository.update(id, companyData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const company = await this.findOne(id);
    return this.companyRepository.remove(company);
  }
}
