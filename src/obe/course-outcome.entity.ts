import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { TosWeight } from './tos-weight.entity';

@Entity('course_outcomes')
export class CourseOutcome {
  @PrimaryGeneratedColumn()
  co_id: number;

  @Column()
  empid: number;

  @Column()
  subjcode: string;

  @Column()
  section: string;

  @Column()
  sy: string;

  @Column()
  sem: string;

  @Column()
  co_code: string; // CO1

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Employee, (emp) => emp.courseOutcomes)
  @JoinColumn({ name: 'empid' })
  employee: Employee;

  // ✅ Add this to allow getFullSyllabus to join weights
  @OneToMany(() => TosWeight, (tw) => tw.courseOutcome)
  tosWeights: TosWeight[];
}
