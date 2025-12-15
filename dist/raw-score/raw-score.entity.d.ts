import { Masterlist } from '../masterlist/masterlist.entity';
import { ClassActivity } from '../class-activity/class-activity.entity';
export declare class RawScore {
    raw_score_id: number;
    masterlist_id: number;
    student: Masterlist;
    activity_id: number;
    activity: ClassActivity;
    score: number;
}
