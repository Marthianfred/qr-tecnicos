import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tecnico } from './tecnico.entity';
import { User } from './user.entity';
import { Empresa } from './empresa.entity';

@Entity('cuadrillas')
export class Cuadrilla {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column()
  zona!: string;

  @Column({ nullable: true })
  supervisorId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'supervisorId' })
  supervisor!: User;

  @Column({ nullable: true })
  empresaId!: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.cuadrillas, { nullable: true })
  @JoinColumn({ name: 'empresaId' })
  empresa!: Empresa;

  @OneToMany(() => Tecnico, (tecnico) => tecnico.cuadrilla)
  tecnicos!: Tecnico[];

  @CreateDateColumn()
  createdAt!: Date;
}

