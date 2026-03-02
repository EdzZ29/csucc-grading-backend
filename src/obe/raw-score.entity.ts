import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { Masterlist } from '../masterlist/masterlist.entity';
import type { ClassActivity } from './class-activity.entity';

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

  @ManyToOne('ClassActivity', 'scores')
  @JoinColumn({ name: 'activity_id' })
  activity: Relation<ClassActivity>;
}
