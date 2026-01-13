declare class FinalGradePayloadDto {
    studentId: string;
    weightedScore: number;
    numericalGrade: number;
    remarks: string;
}
declare class ScoreEntryDto {
    studentId: string;
    score: number;
}
declare class ActivityDto {
    activity_id: number;
    name: string;
    maxScore: number;
    scores: ScoreEntryDto[];
}
export declare class SaveGradebookDto {
    subjcode: string;
    section: string;
    sy: string;
    sem: string;
    grading_type: string;
    category: string;
    activities: ActivityDto[];
    finalGrades: FinalGradePayloadDto[];
}
export {};
