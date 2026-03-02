/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { RawScore } from '../obe/raw-score.entity';
import { FinalGrade } from '../obe/final-grade.entity';

@Entity('masterlist')
export class Masterlist {
  @PrimaryGeneratedColumn({ name: 'masterlist_id' })
  masterlist_id: number;

  @Column({ name: 'empid' })
  empid: number;

  @Column({ name: 'subjcode', type: 'varchar', length: 50 })
  subjcode: string;

  @Column({ name: 'section', type: 'varchar', length: 50 })
  section: string;

  @Column({ name: 'sy', type: 'varchar', length: 20 })
  sy: string;

  @Column({ name: 'sem', type: 'varchar', length: 20 })
  sem: string;

  @Column({ name: 'credit_units', type: 'int', default: 0 })
  credit_units: number;

  @Column({ name: 'number_of_cos', type: 'int', default: 0 })
  number_of_cos: number;

  @Column({ name: 'no_of_students', type: 'int', default: 0 })
  no_of_students: number;

  @Column({ name: 'chairperson', type: 'varchar', length: 100, nullable: true })
  chairperson: string;

  @Column({ name: 'college_dean', type: 'varchar', length: 100, nullable: true })
  college_dean: string;

  @Column({ name: 'studid', type: 'varchar', length: 50 })
  studid: string;

  @Column({ name: 'studlastname', type: 'varchar', length: 100 })
  studlastname: string;

  @Column({ name: 'studfirstname', type: 'varchar', length: 100 })
  studfirstname: string;

  @Column({ name: 'course', type: 'varchar', length: 100 })
  course: string;

  @Column({ name: 'year_level', type: 'varchar', length: 50 })
  year_level: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // --- Relations ---

  @ManyToOne(() => Employee, (emp) => emp.masterlists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empid' })
  employee: Employee;

  @OneToMany(() => RawScore, (rs) => rs.student)
  rawScores: RawScore[];

  @OneToOne(() => FinalGrade, (fg) => fg.student)
  finalGrade: FinalGrade;
}