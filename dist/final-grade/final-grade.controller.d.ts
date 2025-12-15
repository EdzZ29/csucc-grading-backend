import { FinalGradeService } from './final-grade.service';
export declare class FinalGradeController {
    private readonly finalGradeService;
    constructor(finalGradeService: FinalGradeService);
    create(createFinalGradeDto: any): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateFinalGradeDto: any): string;
    remove(id: string): string;
}
