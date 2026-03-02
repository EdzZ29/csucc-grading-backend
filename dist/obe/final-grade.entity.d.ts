import { Masterlist } from '../masterlist/masterlist.entity';
export declare class FinalGrade {
    final_grade_id: number;
    masterlist_id: number;
    final_weighted_score: number;
    final_numerical_grade: number;
    remarks: string;
    student: Masterlist;
}
