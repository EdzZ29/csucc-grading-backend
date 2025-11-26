import { Employee } from '../user/user.entity';
import { Masterlist } from '../masterlist/masterlist.entity';
export declare class Grade {
    grade_id: number;
    masterlist: Masterlist;
    employee: Employee;
    quiz: number;
    performance_task: number;
    prelim: number;
    midterm: number;
    finals: number;
    average: number;
    remarks: string;
    created_at: Date;
    updated_at: Date;
}
