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
    type: 'varchar',
    enum: CertificationLevel,
  })
  level!: CertificationLevel;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date;

  @ManyToOne(() => Technician, (technician) => technician.certifications)
  technician!: Technician;
}
