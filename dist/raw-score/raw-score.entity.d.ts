import { Masterlist } from '../masterlist/masterlist.entity';
import { ClassActivity } from '../obe/class-activity.entity';
export declare class RawScore {
    raw_score_id: number;
    masterlist_id: number;
    activity_id: number;
    score: number;
    student: Masterlist;
    activity: ClassActivity;
}
