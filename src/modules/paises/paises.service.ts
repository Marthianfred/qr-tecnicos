import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pais } from '../../entities/pais.entity';

@Injectable()
export class PaisesService implements OnModuleInit {
  constructor(
    @InjectRepository(Pais)
    private paisRepository: Repository<Pais>,
  ) {}

  async onModuleInit() {
    const count = await this.paisRepository.count();
    if (count === 0) {
      await this.paisRepository.save([
        { codigo: 'VE', nombre: 'Venezuela', bandera: '🇻🇪' },
        { codigo: 'PE', nombre: 'Perú', bandera: '🇵🇪' },
        { codigo: 'RD', nombre: 'República Dominicana', bandera: '🇩🇴' },
      ]);
      console.log('🌎 Países base inicializados en el sistema');
    }
  }

  async findAll() {
    return this.paisRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: string) {
    return this.paisRepository.findOneBy({ id });
  }

  async create(paisData: Partial<Pais>) {
    const pais = this.paisRepository.create(paisData);
    return this.paisRepository.save(pais);
  }

  async update(id: string, paisData: Partial<Pais>) {
    await this.paisRepository.update(id, paisData);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.paisRepository.delete(id);
    return { deleted: true };
  }
}
