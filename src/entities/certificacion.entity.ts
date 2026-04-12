import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Tecnico } from './tecnico.entity';

export enum NivelCertificacion {
  INICIAL = 'Inicial',
  BASICO = 'Básico',
  INTEGRAL = 'Integral',
  PREMIUM = 'Premium',
}

@Entity('certificaciones')
export class Certificacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    enum: NivelCertificacion,
  })
  nivel!: NivelCertificacion;

  @Column({ type: 'date' })
  fechaEmision!: Date;

  @Column({ type: 'date', nullable: true })
  fechaExpiracion!: Date;

  @ManyToOne(() => Tecnico, (tecnico) => tecnico.certificaciones)
  tecnico!: Tecnico;
}
