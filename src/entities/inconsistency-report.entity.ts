import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Technician } from "./technician.entity";

@Entity("inconsistency_reports")
export class InconsistencyReport {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ nullable: true })
  location!: string;
  @CreateDateColumn()
  reportedAt!: Date;

  @ManyToOne(() => Technician)
  technician!: Technician;

  @Column()
  technicianId!: string;

  @Column({ default: false })
  resolved!: boolean;
}
