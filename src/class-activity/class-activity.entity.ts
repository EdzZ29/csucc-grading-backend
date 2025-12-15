import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RawScore } from '../raw-score/raw-score.entity';

@Entity('class_activity')
export class ClassActivity {
  @PrimaryGeneratedColumn()
  activity_id: number;

  @Column()
  grading_type: string;

  @Column()
  category: string;

  @Column()
  subjcode: string;

  @Column()
  section: string;

  @Column()
  activity_name: string;

  @Column('int')
  max_score: number;

  @OneToMany(() => RawScore, (score) => score.activity)
  scores: RawScore[];
}