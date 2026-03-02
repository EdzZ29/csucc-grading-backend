export declare class ScoreEntryDto {
    studentId: string;
    score: number;
}
export declare class ActivityDto {
    activity_id?: number;
    name: string;
    maxScore: number;
    co_id?: number;
    type_id?: number;
    scores: ScoreEntryDto[];
}
export declare class FinalGradeEntryDto {
    studentId: string;
    weightedScore: number;
    numericalGrade: number;
    remarks: string;
}
export declare class SaveGradebookDto {
    subjcode: string;
    section: string;
    sy: string;
    sem: string;
    category: string;
    grading_type?: string;
    empid?: number;
    activities?: ActivityDto[];
    finalGrades?: FinalGradeEntryDto[];
}
