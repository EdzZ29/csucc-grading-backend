import { Repository } from 'typeorm';
import { Masterlist } from './masterlist.entity';
import { Employee } from 'src/user/user.entity';
export declare class MasterlistService {
    private readonly masterlistRepo;
    constructor(masterlistRepo: Repository<Masterlist>);
    findAllForUser(user: Employee): Promise<Masterlist[]>;
    findOneForUser(id: number, user: Employee): Promise<Masterlist>;
    importCsv(data: {
        headers: string[];
        rows: string[][];
    }): Promise<Masterlist[]>;
    findByYearAndSem(sy: string, sem: string, user: Employee): Promise<Masterlist[]>;
    findBySYSemAndEmployee(sy: string, sem: string, employee_id: number): Promise<Masterlist[]>;
    findBySYandSem(sy: string, sem: string): Promise<Masterlist[]>;
}
