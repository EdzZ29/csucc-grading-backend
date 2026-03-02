/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Masterlist } from '../masterlist/masterlist.entity';
import { ClassActivity } from '../obe/class-activity.entity'; // ← unified entity

@Entity('raw_score')
export class RawScore {
  @PrimaryGeneratedColumn()
  raw_score_id: number;

  @Column()
  masterlist_id: number;

  @Column()
  activity_id: number;

  @Column({ type: 'float' })
  score: number;

  @ManyToOne(() => Masterlist, (m) => m.rawScores)
  @JoinColumn({ name: 'masterlist_id' })
  student: Masterlist;

  @ManyToOne(() => ClassActivity, (a) => a.scores)
  @JoinColumn({ name: 'activity_id' })
  activity: ClassActivity;
}
