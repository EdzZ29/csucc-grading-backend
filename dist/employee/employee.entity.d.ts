import { Masterlist } from '../masterlist/masterlist.entity';
import { GradeWeight } from '../grade-weight/grade-weight.entity';
export declare enum EmpRole {
    ADMIN = "Admin",
    INSTRUCTOR = "Instructor",
    DEAN = "Dean",
    CHANCELLOR = "Chancellor",
    GUIDANCE = "Guidance"
}
export declare class Employee {
    empid: number;
    role: EmpRole;
    lastname: string;
    firstname: string;
    middlename: string;
    extname: string;
    email: string;
    password: string;
    isactive: boolean;
    created_at: Date;
    masterlists: Masterlist[];
    gradeWeights: GradeWeight[];
}
