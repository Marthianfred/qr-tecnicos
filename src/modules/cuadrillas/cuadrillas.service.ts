import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Squad } from '../../entities/squad.entity';
import { Technician } from '../../entities/technician.entity';

@Injectable()
export class SquadsService {
  constructor(
    @InjectRepository(Squad)
    private cuadrillaRepository: Repository<Squad>,
    @InjectRepository(Technician)
    private tecnicoRepository: Repository<Technician>,
  ) {}

  async findAll() {
    return this.cuadrillaRepository.find({ relations: ['tecnicos', 'supervisor'] });
  }

  async findOne(id: string) {
    const cuadrilla = await this.cuadrillaRepository.findOne({
      where: { id },
      relations: ['tecnicos', 'supervisor'],
    });
    if (!cuadrilla) throw new NotFoundException('Squad no encontrada');
    return cuadrilla;
  }

  async create(cuadrillaData: Partial<Squad>) {
    const cuadrilla = this.cuadrillaRepository.create(cuadrillaData);
    return this.cuadrillaRepository.save(cuadrilla);
  }

  async update(id: string, cuadrillaData: Partial<Squad>) {
    await this.findOne(id);
    await this.cuadrillaRepository.update(id, cuadrillaData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const cuadrilla = await this.findOne(id);
    // Antes de eliminar, desvincular técnicos
    await this.tecnicoRepository.update({ cuadrillaId: id }, { cuadrillaId: undefined });
    return this.cuadrillaRepository.remove(cuadrilla);
  }

  async addTechnicians(cuadrillaId: string, tecnicoIds: string[]) {
    await this.findOne(cuadrillaId);
    for (const tecnicoId of tecnicoIds) {
      await this.tecnicoRepository.update(tecnicoId, { cuadrillaId });
    }
    return this.findOne(cuadrillaId);
  }

  async removeTechnician(cuadrillaId: string, tecnicoId: string) {
    await this.findOne(cuadrillaId);
    const tecnico = await this.tecnicoRepository.findOneBy({ id: tecnicoId, cuadrillaId });
    if (!tecnico) throw new NotFoundException('Técnico no pertenece a esta cuadrilla');
    
    await this.tecnicoRepository.update(tecnicoId, { cuadrillaId: undefined });
    return this.findOne(cuadrillaId);
  }
}
