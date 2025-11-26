import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../user/user.entity';
import { Masterlist } from '../masterlist/masterlist.entity';

@Entity({ name: 'grade' })
export class Grade {
  @PrimaryGeneratedColumn()
  grade_id: number;

  @ManyToOne(() => Masterlist, (masterlist) => masterlist.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'masterlist_id' })
  masterlist: Masterlist;

  @ManyToOne(() => Employee, (employee) => employee.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  quiz: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  performance_task: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  prelim: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  midterm: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  finals: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  average: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remarks: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
