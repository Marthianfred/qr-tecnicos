import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('paises')
export class Pais {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  codigo!: string; // Ej: 'VE', 'PE', 'RD', 'CO'

  @Column()
  nombre!: string; // Ej: 'Venezuela', 'Perú'

  @Column({ nullable: true })
  bandera!: string; // Emoji o URL de icono

  @Column({ default: true })
  activo!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaActivacion!: Date;
}
