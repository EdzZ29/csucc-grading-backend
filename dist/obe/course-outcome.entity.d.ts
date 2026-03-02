import { Employee } from '../employee/employee.entity';
import { TosWeight } from './tos-weight.entity';
export declare class CourseOutcome {
    co_id: number;
    empid: number;
    subjcode: string;
    section: string;
    sy: string;
    sem: string;
    co_code: string;
    description: string;
    employee: Employee;
    tosWeights: TosWeight[];
}
