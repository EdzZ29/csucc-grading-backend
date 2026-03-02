/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { CourseOutcome } from './course-outcome.entity';
import { AssessmentType } from './assessment-type.entity';

@Entity('tos_weights')
export class TosWeight {
  @PrimaryGeneratedColumn()
  tos_id: number;

  @Column()
  empid: number;

  @Column({ type: 'varchar', length: 50 })
  subjcode: string;

  @Column({ type: 'varchar', length: 50, nullable: true }) // ✅ ADD THIS
  section: string;

  @Column()
  co_id: number;

  @Column()
  type_id: number;

  @Column({ type: 'float' })
  weight_percentage: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'empid' })
  employee: Employee;

  @ManyToOne(() => CourseOutcome)
  @JoinColumn({ name: 'co_id' })
  courseOutcome: CourseOutcome;

  @ManyToOne(() => AssessmentType)
  @JoinColumn({ name: 'type_id' })
  assessmentType: AssessmentType;
}