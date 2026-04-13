import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tecnico } from './tecnico.entity';

@Entity('departamentos')
export class Departamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @OneToMany(() => Tecnico, (tecnico) => tecnico.departamento)
  tecnicos: Tecnico[];

  @Column({ default: true })
  isActive: boolean;
}
