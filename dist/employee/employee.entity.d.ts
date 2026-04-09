import { Masterlist } from '../masterlist/masterlist.entity';
import { CourseOutcome } from '../obe/course-outcome.entity';
import { TosWeight } from '../obe/tos-weight.entity';
export declare enum EmpRole {
    ADMIN = "Admin",
    INSTRUCTOR = "Instructor",
    DEAN = "Dean",
    CHAIRPERSON = "Chairperson",
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
    is_blocked: boolean;
    created_at: Date;
    masterlists: Masterlist[];
    courseOutcomes: CourseOutcome[];
    tosWeights: TosWeight[];
}
