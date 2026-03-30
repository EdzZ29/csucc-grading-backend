import { ObeService } from './obe.service';
export declare class ObeController {
    private readonly obeService;
    constructor(obeService: ObeService);
    getTypes(req: any): Promise<import("./assessment-type.entity").AssessmentType[]>;
    batchSave(payload: any, req: any): Promise<({
        empid: number;
        subjcode: string;
        section: string;
        co_id: number;
        type_id: any;
        weight_percentage: any;
    } & import("./tos-weight.entity").TosWeight)[]>;
    addType(data: {
        name: string;
        code: string;
        empid: number;
    }): Promise<import("./assessment-type.entity").AssessmentType>;
    createCO(data: any): Promise<import("./course-outcome.entity").CourseOutcome[]>;
    setWeights(weights: any[]): Promise<any[]>;
    getSyllabus(empid: number, subjcode: string, section: string): Promise<import("./course-outcome.entity").CourseOutcome[]>;
    createActivity(data: any): Promise<import("./class-activity.entity").ClassActivity[]>;
    recordScore(data: any): Promise<import("./raw-score.entity").RawScore[]>;
    calculateFinal(masterlistId: number): Promise<import("./final-grade.entity").FinalGrade>;
}
