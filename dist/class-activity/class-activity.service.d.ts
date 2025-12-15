import { Repository } from 'typeorm';
import { ClassActivity } from './class-activity.entity';
import { RawScore } from '../raw-score/raw-score.entity';
import { Masterlist } from '../masterlist/masterlist.entity';
import { SaveGradebookDto } from './dto/save-gradebook.dto';
export declare class ClassActivityService {
    private activityRepo;
    private scoreRepo;
    private masterlistRepo;
    constructor(activityRepo: Repository<ClassActivity>, scoreRepo: Repository<RawScore>, masterlistRepo: Repository<Masterlist>);
    getGradebook(subjcode: string, section: string, category: string): Promise<ClassActivity[]>;
    saveGradebook(dto: SaveGradebookDto): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteActivity(activityId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
