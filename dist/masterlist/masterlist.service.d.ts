import { Repository } from 'typeorm';
import { Masterlist } from './masterlist.entity';
import { Employee } from 'src/employee/employee.entity';
import { ImportMasterlistDto } from './dtos/import-masterlist.dto';
export declare class MasterlistService {
    private readonly masterlistRepo;
    private readonly employeeRepo;
    constructor(masterlistRepo: Repository<Masterlist>, employeeRepo: Repository<Employee>);
    findByYearAndSem(sy: string, sem: string, user: Employee): Promise<Masterlist[]>;
    findBySYSemAndEmployee(sy: string, sem: string, empid: number): Promise<Masterlist[]>;
    findBySYandSem(sy: string, sem: string): Promise<Masterlist[]>;
    getUniqueSubjectsCount(): Promise<number>;
    findAllForUser(user: Employee): Promise<Masterlist[]>;
    findOneForUser(id: number, user: Employee): Promise<Masterlist>;
    getAllClassesForAdmin(): Promise<Masterlist[]>;
    importCsv(data: ImportMasterlistDto): Promise<{
        success: boolean;
        successCount: number;
        failedCount: number;
        errors: {
            row: number;
            reason: string;
            data: any;
        }[];
    }>;
}
