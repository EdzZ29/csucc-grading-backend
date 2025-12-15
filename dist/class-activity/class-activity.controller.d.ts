import { ClassActivityService } from './class-activity.service';
import { SaveGradebookDto } from './dto/save-gradebook.dto';
export declare class ClassActivityController {
    private readonly service;
    constructor(service: ClassActivityService);
    getGradebook(subjcode: string, section: string, category: string): Promise<import("./class-activity.entity").ClassActivity[]>;
    saveGradebook(dto: SaveGradebookDto): Promise<{
        success: boolean;
        message: string;
    }>;
    delete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
