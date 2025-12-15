import { Employee } from '../employee/employee.entity';
export declare class GradeWeight {
    id: number;
    grading_type: string;
    category: string;
    weight_percentage: number;
    updated_at: Date;
    employee: Employee;
}
