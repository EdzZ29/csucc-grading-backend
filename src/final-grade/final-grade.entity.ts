import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Masterlist } from '../masterlist/masterlist.entity'; // Assumes Masterlist exists

@Entity('final_grade')
export class FinalGrade {
  @PrimaryGeneratedColumn()
  final_grade_id: number;

  @Column({ name: 'masterlist_id' })
  masterlist_id: number;

  @ManyToOne(() => Masterlist)
  @JoinColumn({ name: 'masterlist_id' })
  student: Masterlist;

  @Column('float')
  final_semestral_grade: number;

  @Column()
  remarks: string; // 'Passed' or 'Failed'
}
