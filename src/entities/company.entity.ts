import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Squad } from "./squad.entity";

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  taxId!: string;

  @Column({ default: "VE" })
  country!: string;

  @OneToMany(() => Squad, (squad) => squad.company)
  squads!: Squad[];
}
