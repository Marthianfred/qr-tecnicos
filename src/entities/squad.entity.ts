import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Technician } from './technician.entity';
import { User } from './user.entity';
import { Company } from './company.entity';

@Entity('squads')
export class Squad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  zone!: string;

  @Column({ nullable: true })
  supervisorId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'supervisorId' })
  supervisor!: User;

  @Column({ nullable: true })
  companyId!: string;

  @ManyToOne(() => Company, (company) => company.squads, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @OneToMany(() => Technician, (technician) => technician.squad)
  technicians!: Technician[];

  @CreateDateColumn()
  createdAt!: Date;
}

