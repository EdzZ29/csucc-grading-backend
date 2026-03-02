import { Repository } from 'typeorm';
import { ClassActivity } from '../obe/class-activity.entity';
import { RawScore } from '../obe/raw-score.entity';
import { Masterlist } from '../masterlist/masterlist.entity';
import { FinalGrade } from '../obe/final-grade.entity';
import { CourseOutcome } from '../obe/course-outcome.entity';
import { TosWeight } from '../obe/tos-weight.entity';
import { AssessmentType } from '../obe/assessment-type.entity';
import { SaveGradebookDto } from './dto/save-gradebook.dto';
import { ComputeGradesDto } from './dto/compute-grades.dto';
interface RawScoreCell {
    activity_id: number;
    activity_name: string;
    co_id: number;
    type_id: number;
    max_score: number;
    score: number | null;
}
interface PercentRatingCell {
    activity_id: number;
    activity_name: string;
    co_id: number;
    type_id: number;
    percent: number | null;
}
interface WeightedRatingCell {
    co_id: number;
    co_code: string;
    type_id: number;
    type_code: string;
    weight_percentage: number;
    avg_percent: number;
    weighted_value: number;
}
export interface StudentGradeRow {
    masterlist_id: number;
    studid: string;
    student_name: string;
    raw_scores: RawScoreCell[];
    percent_ratings: PercentRatingCell[];
    weighted_ratings: WeightedRatingCell[];
    total_weighted_percent: number;
    final_numerical_grade: number;
    remarks: string;
}
export declare class ClassActivityService {
    private activityRepo;
    private scoreRepo;
    private masterlistRepo;
    private finalGradeRepo;
    private coRepo;
    private tosRepo;
    private assessmentTypeRepo;
    private readonly logger;
    constructor(activityRepo: Repository<ClassActivity>, scoreRepo: Repository<RawScore>, masterlistRepo: Repository<Masterlist>, finalGradeRepo: Repository<FinalGrade>, coRepo: Repository<CourseOutcome>, tosRepo: Repository<TosWeight>, assessmentTypeRepo: Repository<AssessmentType>);
    getGradebook(subjcode: string, section: string, category: string): Promise<ClassActivity[]>;
    saveGradebook(dto: SaveGradebookDto): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteActivity(activityId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    computeAllGrades(dto: ComputeGradesDto): Promise<StudentGradeRow[]>;
    getRawScoreSheet(subjcode: string, section: string, sy: string, sem: string): Promise<{
        masterlist_id: number;
        studid: string;
        student_name: string;
        scores: {
            activity_id: number;
            activity_name: string;
            co_id: number;
            type_id: number;
            max_score: number;
            score: number;
        }[];
    }[]>;
    getPercentRatingSheet(subjcode: string, section: string, sy: string, sem: string): Promise<{
        scores: {
            percent_rating: number;
            activity_id: number;
            activity_name: string;
            co_id: number;
            type_id: number;
            max_score: number;
            score: number;
        }[];
        masterlist_id: number;
        studid: string;
        student_name: string;
    }[]>;
    getFinalGradeSheet(subjcode: string, section: string, sy: string, sem: string): Promise<any[]>;
    saveFinalGradesOnly(dto: SaveGradebookDto): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
}
export {};
