import { Repository } from 'typeorm';
import { ClassActivity } from './class-activity.entity';
import { RawScore } from '../raw-score/raw-score.entity';
import { Masterlist } from '../masterlist/masterlist.entity';
import { FinalGrade } from 'src/final-grade/final-grade.entity';
import { SaveGradebookDto } from './dto/save-gradebook.dto';
export declare class ClassActivityService {
    private activityRepo;
    private scoreRepo;
    private masterlistRepo;
    private finalGradeRepo;
    private readonly logger;
    constructor(activityRepo: Repository<ClassActivity>, scoreRepo: Repository<RawScore>, masterlistRepo: Repository<Masterlist>, finalGradeRepo: Repository<FinalGrade>);
    getGradebook(subjcode: string, section: string, category: string): Promise<ClassActivity[]>;
    saveGradebook(dto: SaveGradebookDto): Promise<{
        success: boolean;
        message: string;
    }>;
    saveFinalGradesOnly(dto: SaveGradebookDto): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    deleteActivity(activityId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
