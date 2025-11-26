import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Grade } from 'src/grade/grade.entity'; // ✅ Import Grade
import { Masterlist } from 'src/masterlist/masterlist.entity'; // ✅ Import Masterlist

export enum Role {
  ADMIN = 'Admin',
  INSTRUCTOR = 'Instructor',
  DEAN = 'Dean',
  CHANCELLOR = 'Chancellor',
  GUIDANCE = 'Guidance',
}

@Entity({ name: 'employee' })
export class Employee {
  @PrimaryGeneratedColumn()
  employee_id: number;

  @Column({ type: 'varchar', length: 50 })
  role: string;

  @Column({ type: 'varchar', length: 100 })
  lastname: string;

  @Column({ type: 'varchar', length: 100 })
  firstname: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middlename: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  extname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => Grade, (grade) => grade.employee)
  grades: Grade[];

  @OneToMany(() => Masterlist, (masterlist) => masterlist.employee)
  masterlists: Masterlist[];
}
