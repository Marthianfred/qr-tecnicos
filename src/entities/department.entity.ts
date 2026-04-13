import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Technician } from './technician.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Technician, (technician) => technician.department)
  technicians: Technician[];

  @Column({ default: true })
  isActive: boolean;
}
