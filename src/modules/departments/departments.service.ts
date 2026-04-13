import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const dep = this.departmentRepository.create(createDepartmentDto);
    return await this.departmentRepository.save(dep) as Department;
  }

  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
      order: { name: 'ASC' },
      relations: ['technicians']
    });
  }

  async findByName(name: string): Promise<Department | null> {
    return await this.departmentRepository.findOneBy({ name });
  }

  async findOne(id: string): Promise<Department> {
    const dep = await this.departmentRepository.findOne({
      where: { id },
      relations: ['technicians']
    });
    if (!dep) throw new NotFoundException(`Department with ID ${id} not found`);
    return dep;
  }

  async update(id: string, updateDto: Partial<CreateDepartmentDto>): Promise<Department> {
    const dep = await this.findOne(id);
    Object.assign(dep, updateDto);
    return await this.departmentRepository.save(dep) as Department;
  }

  async remove(id: string): Promise<void> {
    const dep = await this.findOne(id);
    await this.departmentRepository.remove(dep);
  }

  async ensureDefaultDepartments(names: string[]) {
    for (const name of names) {
      const exists = await this.departmentRepository.findOneBy({ name });
      if (!exists) {
        await this.create({ name } as any);
      }
    }
  }
}
