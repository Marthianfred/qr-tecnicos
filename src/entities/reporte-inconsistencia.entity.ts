import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Tecnico } from './tecnico.entity';

@Entity('reportes_inconsistencia')
export class ReporteInconsistencia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ nullable: true })
  ubicacion!: string; // Opcional: Latitud, Longitud o Dirección

  @CreateDateColumn()
  fechaReporte!: Date;

  @ManyToOne(() => Tecnico)
  tecnico!: Tecnico;

  @Column()
  tecnicoId!: string;
}
