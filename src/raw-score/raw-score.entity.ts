// src/raw-score/raw-score.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Masterlist } from '../masterlist/masterlist.entity';
import { ClassActivity } from '../class-activity/class-activity.entity';

@Entity('raw_score')
export class RawScore {
  @PrimaryGeneratedColumn()
  raw_score_id: number;

  @Column()
  masterlist_id: number; // FK Column

  @ManyToOne(() => Masterlist)
  @JoinColumn({ name: 'masterlist_id' })
  student: Masterlist;

  @Column()
  activity_id: number; // FK Column

  @ManyToOne(() => ClassActivity, (activity) => activity.scores)
  @JoinColumn({ name: 'activity_id' })
  activity: ClassActivity;

  @Column('float')
  score: number;
}
