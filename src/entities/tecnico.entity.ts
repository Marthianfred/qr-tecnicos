import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Certificacion } from './certificacion.entity';
import { Cuadrilla } from './cuadrilla.entity';

export enum TecnicoStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('tecnicos')
export class Tecnico {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ unique: true })
  documento!: string; // Cédula o DNI

  @Column()
  pais!: string; // VE, PE, RD

  @Column({ nullable: true })
  fotoUrl!: string;

  @Column({
    enum: TecnicoStatus,
    default: TecnicoStatus.ACTIVO,
  })
  status!: TecnicoStatus;

  @OneToMany(() => Certificacion, (cert) => cert.tecnico)
  certificaciones!: Certificacion[];

  @Column({ nullable: true })
  cuadrillaId!: string;

  @ManyToOne(() => Cuadrilla, (cuadrilla) => cuadrilla.tecnicos, { nullable: true })
  @JoinColumn({ name: 'cuadrillaId' })
  cuadrilla!: Cuadrilla;
}
