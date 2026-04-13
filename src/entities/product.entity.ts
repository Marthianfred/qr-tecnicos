import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'int', default: 0 })
  initialStock!: number;

  @Column({ unique: true })
  sku!: string;

  @Column({ nullable: true })
  category!: string;

  @Column({ nullable: true })
  imageUrl!: string;

  @Column({ default: true })
  active!: boolean;
}
