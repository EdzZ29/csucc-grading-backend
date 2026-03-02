import { Relation } from 'typeorm';
import { CourseOutcome } from './course-outcome.entity';
import { AssessmentType } from './assessment-type.entity';
import type { RawScore } from './raw-score.entity';
export declare class ClassActivity {
    activity_id: number;
    empid: number;
    subjcode: string;
    section: string;
    sy: string;
    sem: string;
    co_id: number;
    type_id: number;
    grading_type: string;
    category: string;
    activity_name: string;
    max_score: number;
    courseOutcome: CourseOutcome;
    assessmentType: AssessmentType;
    scores: Relation<RawScore[]>;
}
