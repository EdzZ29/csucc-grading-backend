import { RawScore } from '../raw-score/raw-score.entity';
export declare class ClassActivity {
    activity_id: number;
    grading_type: string;
    category: string;
    subjcode: string;
    section: string;
    activity_name: string;
    max_score: number;
    scores: RawScore[];
}
