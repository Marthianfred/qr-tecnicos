import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string; // Ej: 'VE', 'PE', 'RD', 'CO'

  @Column()
  name!: string; // Ej: 'Venezuela', 'Perú'

  @Column({ nullable: true })
  flag!: string; // Emoji o URL de icono

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  activatedAt!: Date;
}
