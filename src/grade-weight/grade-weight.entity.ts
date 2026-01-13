import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../employee/employee.entity';

@Entity('grade_weights')
export class GradeWeight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grading_type: string; // LECTURE, LEC_LAB

  @Column()
  category: string; // WRITTEN, PERFORMANCE, etc.

  @Column('decimal', { precision: 5, scale: 2 })
  weight_percentage: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'modified_by_empid', referencedColumnName: 'empid' })
  employee: Employee;
}
