export declare const TRANSMUTATION_TABLE: {
    minPercent: number;
    grade: number;
}[];
export declare const FAILING_GRADE = 5;
export declare const CO_PASS_THRESHOLD = 0.6;
export declare function transmuteGrade(weightedPercent: number): number;
export declare function deriveRemarks(numericalGrade: number, allCosPassed?: boolean): string;
