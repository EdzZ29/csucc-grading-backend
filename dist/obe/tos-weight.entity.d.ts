import { Employee } from '../employee/employee.entity';
import { CourseOutcome } from './course-outcome.entity';
import { AssessmentType } from './assessment-type.entity';
export declare class TosWeight {
    tos_id: number;
    empid: number;
    subjcode: string;
    section: string;
    co_id: number;
    type_id: number;
    weight_percentage: number;
    employee: Employee;
    courseOutcome: CourseOutcome;
    assessmentType: AssessmentType;
}
