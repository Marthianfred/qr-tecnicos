import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from '../../entities/departamento.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}

  async create(createDepartamentoDto: CreateDepartamentoDto): Promise<Departamento> {
    const dep = this.departamentoRepository.create(createDepartamentoDto);
    return await this.departamentoRepository.save(dep);
  }

  async findAll(): Promise<Departamento[]> {
    return await this.departamentoRepository.find({
      order: { nombre: 'ASC' },
      relations: ['tecnicos']
    });
  }

  async findByNombre(nombre: string): Promise<Departamento | null> {
    return await this.departamentoRepository.findOneBy({ nombre });
  }

  async findOne(id: string): Promise<Departamento> {
    const dep = await this.departamentoRepository.findOne({
      where: { id },
      relations: ['tecnicos']
    });
    if (!dep) throw new NotFoundException(`Departamento ccon ID ${id} no encontrado`);
    return dep;
  }

  async update(id: string, updateDto: Partial<CreateDepartamentoDto>): Promise<Departamento> {
    const dep = await this.findOne(id);
    Object.assign(dep, updateDto);
    return await this.departamentoRepository.save(dep);
  }

  async remove(id: string): Promise<void> {
    const dep = await this.findOne(id);
    await this.departamentoRepository.remove(dep);
  }

  async ensureDefaultDepartments(nombres: string[]) {
    for (const nombre of nombres) {
      const exists = await this.departamentoRepository.findOneBy({ nombre });
      if (!exists) {
        await this.create({ nombre });
      }
    }
  }
}
