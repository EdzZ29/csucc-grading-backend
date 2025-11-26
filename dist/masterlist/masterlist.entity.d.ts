import { Employee } from '../user/user.entity';
import { Grade } from 'src/grade/grade.entity';
export declare class Masterlist {
    masterlist_id: number;
    employee: Employee;
    status: string;
    sy: string;
    sem: string;
    subjcode: string;
    section: string;
    studid: string;
    stud_lastname: string;
    stud_firstname: string;
    stud_middlename: string;
    stud_extname: string;
    created_at: Date;
    updated_at: Date;
    grades: Grade[];
}
