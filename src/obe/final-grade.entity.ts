import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Masterlist } from '../masterlist/masterlist.entity';

@Entity('final_grade')
export class FinalGrade {
  @PrimaryGeneratedColumn()
  final_grade_id: number;

  @Column()
  masterlist_id: number;

  @Column({ type: 'float' })
  final_weighted_score: number;

  @Column({ type: 'float' })
  final_numerical_grade: number;

  @Column({ nullable: true })
  remarks: string;

  @OneToOne(() => Masterlist, (m) => m.finalGrade)
  @JoinColumn({ name: 'masterlist_id' })
  student: Masterlist;
}
