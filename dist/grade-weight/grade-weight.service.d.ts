import { Repository } from 'typeorm';
import { GradeWeight } from './grade-weight.entity';
import { Employee } from '../employee/employee.entity';
export declare class GradeWeightService {
    private readonly repo;
    private readonly employeeRepo;
    constructor(repo: Repository<GradeWeight>, employeeRepo: Repository<Employee>);
    findAll(): Promise<GradeWeight[]>;
    saveWeights(data: {
        modified_by_empid: number;
        weights: any;
    }): Promise<GradeWeight[]>;
}
