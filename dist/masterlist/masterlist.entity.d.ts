import { Employee } from '../employee/employee.entity';
import { RawScore } from '../obe/raw-score.entity';
import { FinalGrade } from '../obe/final-grade.entity';
export declare class Masterlist {
    masterlist_id: number;
    empid: number;
    subjcode: string;
    section: string;
    sy: string;
    sem: string;
    credit_units: number;
    number_of_cos: number;
    no_of_students: number;
    chairperson: string;
    college_dean: string;
    studid: string;
    studlastname: string;
    studfirstname: string;
    course: string;
    year_level: string;
    createdAt: Date;
    employee: Employee;
    rawScores: RawScore[];
    finalGrade: FinalGrade;
}
