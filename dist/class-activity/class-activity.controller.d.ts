import { ClassActivityService } from './class-activity.service';
import { SaveGradebookDto } from './dto/save-gradebook.dto';
import { ComputeGradesDto } from './dto/compute-grades.dto';
export declare class ClassActivityController {
    private readonly service;
    constructor(service: ClassActivityService);
    getGradebook(subjcode: string, section: string, category: string): Promise<import("../obe/class-activity.entity").ClassActivity[]>;
    saveGradebook(dto: SaveGradebookDto): Promise<{
        success: boolean;
        message: string;
    }>;
    saveFinalGrades(dto: SaveGradebookDto): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    delete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    computeGrades(dto: ComputeGradesDto): Promise<import("./class-activity.service").StudentGradeRow[]>;
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
}
