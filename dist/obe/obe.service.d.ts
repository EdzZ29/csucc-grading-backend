import { Repository } from 'typeorm';
import { CourseOutcome } from './course-outcome.entity';
import { TosWeight } from './tos-weight.entity';
import { RawScore } from './raw-score.entity';
import { FinalGrade } from './final-grade.entity';
import { ClassActivity } from './class-activity.entity';
import { AssessmentType } from './assessment-type.entity';
export declare class ObeService {
    private coRepo;
    private tosRepo;
    private scoreRepo;
    private gradeRepo;
    private activityRepo;
    private assessmentTypeRepo;
    constructor(coRepo: Repository<CourseOutcome>, tosRepo: Repository<TosWeight>, scoreRepo: Repository<RawScore>, gradeRepo: Repository<FinalGrade>, activityRepo: Repository<ClassActivity>, assessmentTypeRepo: Repository<AssessmentType>);
    findAllAssessmentTypes(empid?: number): Promise<AssessmentType[]>;
    calculateStudentFinalGrade(masterlistId: number): Promise<FinalGrade>;
    createCourseOutcome(data: any): Promise<CourseOutcome[]>;
    saveTosWeights(weights: any[]): Promise<any[]>;
    createActivity(data: any): Promise<ClassActivity[]>;
    recordRawScore(data: any): Promise<RawScore[]>;
    getFullSyllabus(empid: number, subjcode: string, section: string): Promise<CourseOutcome[]>;
    createAssessmentType(data: {
        name: string;
        code: string;
        empid: number;
    }): Promise<AssessmentType>;
    saveBatchSyllabus(payload: {
        subjcode: string;
        section: string;
        outcomes: any[];
        weights: any[];
        empid: number;
        sy: string;
        sem: string;
    }): Promise<({
        empid: number;
        subjcode: string;
        section: string;
        co_id: number;
        type_id: any;
        weight_percentage: any;
    } & TosWeight)[]>;
}
