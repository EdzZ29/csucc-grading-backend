import { GradeService } from './grade.service';
import { Grade } from './grade.entity';
export declare class GradeController {
    private readonly gradeService;
    constructor(gradeService: GradeService);
    create(data: Partial<Grade>): Promise<Grade>;
    findAll(): Promise<Grade[]>;
    findOne(id: number): Promise<Grade>;
    update(id: number, data: Partial<Grade>): Promise<Grade>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
