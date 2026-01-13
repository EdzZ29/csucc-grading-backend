import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Masterlist } from '../masterlist/masterlist.entity';

@Entity('final_grade')
export class FinalGrade {
  @PrimaryGeneratedColumn()
  final_grade_id: number;

  @Column()
  masterlist_id: number;

  @ManyToOne(() => Masterlist)
  @JoinColumn({ name: 'masterlist_id' })
  student: Masterlist;

  // The score out of 100 (e.g., 94.5)
  @Column('float', { nullable: true, default: 0 })
  final_weighted_score: number;

  // The transmuted grade (e.g., 1.00, 1.25)
  @Column('float', { nullable: true, default: 0 })
  final_numerical_grade: number;

  @Column({ nullable: true })
  remarks: string; // Passed or Failed
}
