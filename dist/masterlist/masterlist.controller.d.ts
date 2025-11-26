import { MasterlistService } from './masterlist.service';
import { Masterlist } from './masterlist.entity';
import { Request } from 'express';
export declare class MasterlistController {
    private readonly masterlistService;
    constructor(masterlistService: MasterlistService);
    findAll(req: Request): Promise<Masterlist[]>;
    findOne(id: number, req: Request): Promise<Masterlist>;
    importCsv(data: {
        headers: string[];
        rows: string[][];
    }): Promise<Masterlist[]>;
    findByYearAndSem(sy: string, sem: string, req: Request): Promise<Masterlist[]>;
    findBySYSEMQuery(sy: string, sem: string, employeeId?: number): Promise<Masterlist[]>;
}
