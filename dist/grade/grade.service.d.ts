import { Repository } from 'typeorm';
import { Grade } from './grade.entity';
export declare class GradeService {
    private readonly gradeRepository;
    constructor(gradeRepository: Repository<Grade>);
    create(data: Partial<Grade>): Promise<Grade>;
    findAll(): Promise<Grade[]>;
    findOne(id: number): Promise<Grade>;
    update(id: number, data: Partial<Grade>): Promise<Grade>;
    remove(id: number): Promise<void>;
}
