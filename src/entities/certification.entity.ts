import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Technician } from './technician.entity';

export enum CertificationLevel {
  INITIAL = 'Initial',
  BASIC = 'Basic',
  INTEGRAL = 'Integral',
  PREMIUM = 'Premium',
}

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: CertificationLevel,
  })
  level!: CertificationLevel;

  @Column({ type: 'date' })
  issuedAt!: Date;

  @Column({ type: 'date', nullable: true })
  expiresAt!: Date;

  @ManyToOne(() => Technician, (technician) => technician.certifications)
  technician!: Technician;
}
