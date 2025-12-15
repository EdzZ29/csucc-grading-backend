import { MasterlistService } from './masterlist.service';
import { Masterlist } from './masterlist.entity';
import { Request } from 'express';
import { ImportMasterlistDto } from './dtos/import-masterlist.dto';
export declare class MasterlistController {
    private readonly masterlistService;
    constructor(masterlistService: MasterlistService);
    findAll(req: Request): Promise<Masterlist[]>;
    findOne(id: number, req: Request): Promise<Masterlist>;
    importCsv(importDto: ImportMasterlistDto): Promise<{
        success: boolean;
        message: string;
        totalRows: number;
        successCount: number;
        failedCount: number;
        errors: {
            row: number;
            reason: string;
            data: any;
        }[];
    }>;
    findByYearAndSem(sy: string, sem: string, req: Request): Promise<Masterlist[]>;
    findBySYSEMQuery(sy: string, sem: string, employeeId?: number): Promise<Masterlist[]>;
}
