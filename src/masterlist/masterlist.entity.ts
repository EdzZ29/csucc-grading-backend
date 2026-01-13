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
import { Employee } from '../employee/employee.entity'; // FK: EMP_ID
import { FinalGrade } from 'src/final-grade/final-grade.entity';
import { RawScore } from 'src/raw-score/raw-score.entity';

@Entity('masterlist')
export class Masterlist {
  @PrimaryGeneratedColumn({ name: 'masterlist_id' })
  masterlist_id: number;

  @Column({ name: 'empid' })
  empid: number;

  @Column({ type: 'varchar', length: 50, default: '' })
  type: string;

  @Column({ name: 'sy', type: 'varchar', length: 20, nullable: true })
  sy: string; // school year

  @Column({ name: 'sem', type: 'varchar', length: 20, nullable: true })
  sem: string; // semester

  @Column({
    name: 'subjcode',
    type: 'varchar',
    length: 50,
    default: '',
    nullable: true,
  })
  subjcode: string;

  @Column({
    name: 'section',
    type: 'varchar',
    length: 50,
    default: '',
    nullable: true,
  })
  section: string;

  @Column({ name: 'studid', type: 'varchar', length: 50 })
  studid: string;

  @Column({ name: 'studlastname', type: 'varchar', length: 100 })
  studlastname: string;

  @Column({ name: 'studfirstname', type: 'varchar', length: 100 })
  studfirstname: string;

  @Column({ name: 'studmiddlename', type: 'varchar', length: 100, default: '' })
  studmiddlename: string;

  @Column({ name: 'studextname', type: 'varchar', length: 20, default: '' })
  studextname: string;

  @Column({ name: 'studmajor', type: 'varchar', length: 100, default: '' })
  studmajor: string;

  @Column({ name: 'studlevel', type: 'integer' })
  studlevel: number;

  @Column({ name: 'department', type: 'varchar', length: 100, default: '' })
  department: string;

  @Column({ name: 'college', type: 'varchar', length: 100, default: '' })
  college: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empid' })
  employee: Employee;

  @OneToOne(() => FinalGrade, (grade) => grade.student)
  finalGrade: FinalGrade;

  @OneToMany(() => RawScore, (score) => score.student)
  rawScores: RawScore[];
}
