import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Certification } from './certification.entity';
import { Squad } from './squad.entity';
import { Department } from './department.entity';

export enum StaffType {
  CORPORATE = 'corporate',
  PARTNER = 'partner',
}

export enum TechnicianStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('technicians')
export class Technician {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  documentId!: string; 

  @Column({ default: 'Técnico General' })
  role!: string; 

  @Column({
    enum: StaffType,
    default: StaffType.CORPORATE
  })
  staffType!: StaffType;

  @Column()
  country!: string; 

  @Column({ default: 'Sede Central' })
  zone!: string; 

  @Column({ nullable: true })
  photoUrl!: string;

  @Column({
    enum: TechnicianStatus,
    default: TechnicianStatus.ACTIVE,
  })
  status!: TechnicianStatus;

  @OneToMany(() => Certification, (cert) => cert.technician)
  certifications!: Certification[];

  @Column({ nullable: true })
  squadId!: string;

  @ManyToOne(() => Squad, (squad) => squad.technicians, { nullable: true })
  @JoinColumn({ name: 'squadId' })
  squad!: Squad;

  @Column({ nullable: true })
  departmentId!: string;

  @ManyToOne(() => Department, (dep) => dep.technicians, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department!: Department;
}
