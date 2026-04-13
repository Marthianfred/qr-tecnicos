import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Squad } from '../../entities/squad.entity';
import { Technician } from '../../entities/technician.entity';

@Injectable()
export class SquadsService {
  constructor(
    @InjectRepository(Squad)
    private squadRepository: Repository<Squad>,
    @InjectRepository(Technician)
    private technicianRepository: Repository<Technician>,
  ) {}

  async findAll() {
    return this.squadRepository.find({ relations: ['technicians', 'supervisor'] });
  }

  async findOne(id: string) {
    const squad = await this.squadRepository.findOne({
      where: { id },
      relations: ['technicians', 'supervisor'],
    });
    if (!squad) throw new NotFoundException('Squad not found');
    return squad;
  }

  async create(squadData: Partial<Squad>) {
    const squad = this.squadRepository.create(squadData);
    return this.squadRepository.save(squad);
  }

  async update(id: string, squadData: Partial<Squad>) {
    await this.findOne(id);
    await this.squadRepository.update(id, squadData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const squad = await this.findOne(id);
    await this.technicianRepository.update({ squadId: id }, { squadId: undefined } as any);
    return this.squadRepository.remove(squad);
  }

  async addTechnicians(squadId: string, technicianIds: string[]) {
    await this.findOne(squadId);
    for (const technicianId of technicianIds) {
      await this.technicianRepository.update(technicianId, { squadId });
    }
    return this.findOne(squadId);
  }

  async removeTechnician(squadId: string, technicianId: string) {
    await this.findOne(squadId);
    const technician = await this.technicianRepository.findOneBy({ id: technicianId, squadId });
    if (!technician) throw new NotFoundException('Technician does not belong to this squad');
    
    await this.technicianRepository.update(technicianId, { squadId: undefined } as any);
    return this.findOne(squadId);
  }
}
