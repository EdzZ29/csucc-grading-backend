/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Masterlist } from '../masterlist/masterlist.entity';
import { CourseOutcome } from '../obe/course-outcome.entity';
import { TosWeight } from '../obe/tos-weight.entity';

export enum EmpRole {
  ADMIN = 'Admin',
  INSTRUCTOR = 'Instructor',
  DEAN = 'Dean',
  CHAIRPERSON = 'Chairperson',
  GUIDANCE = 'Guidance',
}

@Entity('employee')
export class Employee {
  @PrimaryGeneratedColumn()
  empid: number;

  @Column({
    type: 'enum',
    enum: EmpRole,
    default: EmpRole.INSTRUCTOR,
  })
  role: EmpRole;

  @Column({ type: 'varchar', length: 100 })
  lastname: string;

  @Column({ type: 'varchar', length: 100 })
  firstname: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  middlename: string;

  @Column({ type: 'varchar', length: 5, default: '' })
  extname: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'boolean', default: true })
  isactive: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_blocked' })
  is_blocked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  // --- Relations ---

  @OneToMany(() => Masterlist, (masterlist) => masterlist.employee)
  masterlists: Masterlist[];

  @OneToMany(() => CourseOutcome, (co) => co.employee)
  courseOutcomes: CourseOutcome[];

  @OneToMany(() => TosWeight, (tw) => tw.employee)
  tosWeights: TosWeight[];
}