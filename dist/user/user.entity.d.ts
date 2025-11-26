import { Grade } from 'src/grade/grade.entity';
import { Masterlist } from 'src/masterlist/masterlist.entity';
export declare enum Role {
    ADMIN = "Admin",
    INSTRUCTOR = "Instructor",
    DEAN = "Dean",
    CHANCELLOR = "Chancellor",
    GUIDANCE = "Guidance"
}
export declare class Employee {
    employee_id: number;
    role: string;
    lastname: string;
    firstname: string;
    middlename: string;
    extname: string;
    email: string;
    password: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    grades: Grade[];
    masterlists: Masterlist[];
}
