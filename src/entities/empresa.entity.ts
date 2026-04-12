import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Cuadrilla } from './cuadrilla.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ unique: true })
  nil!: string; // Número de Identificación Laboral / Legal

  @OneToMany(() => Cuadrilla, (cuadrilla) => cuadrilla.empresa)
  cuadrillas!: Cuadrilla[];
}
