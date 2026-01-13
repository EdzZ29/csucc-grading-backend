import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Masterlist } from '../masterlist/masterlist.entity';
import { ClassActivity } from '../class-activity/class-activity.entity';

@Entity('raw_score')
export class RawScore {
  @PrimaryGeneratedColumn()
  raw_score_id: number;

  @Index()
  @Column()
  masterlist_id: number;

  @ManyToOne(() => Masterlist)
  @JoinColumn({ name: 'masterlist_id' })
  student: Masterlist;

  @Index() //  Add Index for faster filtering by activity
  @Column()
  activity_id: number;

  @ManyToOne(() => ClassActivity, (activity) => activity.scores)
  @JoinColumn({ name: 'activity_id' })
  activity: ClassActivity;


  @Column('float', { nullable: true, default: null })
  score: number;
}
