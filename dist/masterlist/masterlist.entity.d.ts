import { Employee } from '../employee/employee.entity';
import { FinalGrade } from 'src/final-grade/final-grade.entity';
import { RawScore } from 'src/raw-score/raw-score.entity';
export declare class Masterlist {
    masterlist_id: number;
    empid: number;
    type: string;
    sy: string;
    sem: string;
    subjcode: string;
    section: string;
    studid: string;
    studlastname: string;
    studfirstname: string;
    studmiddlename: string;
    studextname: string;
    studmajor: string;
    studlevel: number;
    department: string;
    college: string;
    createdAt: Date;
    employee: Employee;
    finalGrade: FinalGrade;
    rawScores: RawScore[];
}
