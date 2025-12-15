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
    grading_type: string;
    category: string;
    activities: ActivityDto[];
}
export {};
