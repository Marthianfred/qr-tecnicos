import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  TECHNICIAN = 'technician',
  CLIENT = 'client',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string; // In a real app, this should be hashed

  @Column({
    type: 'varchar',
    enum: UserRole,
    default: UserRole.TECHNICIAN,
  })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;
}
