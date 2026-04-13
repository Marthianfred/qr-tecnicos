import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('productos')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'int', default: 0 })
  stockInicial!: number;

  @Column({ unique: true })
  sku!: string;

  @Column({ nullable: true })
  categoria!: string;

  @Column({ nullable: true })
  imagenUrl!: string;

  @Column({ default: true })
  activo!: boolean;
}
