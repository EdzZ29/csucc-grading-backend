import { GradeWeightService } from './grade-weight.service';
export declare class GradeWeightController {
    private readonly service;
    constructor(service: GradeWeightService);
    getAll(): Promise<import("./grade-weight.entity").GradeWeight[]>;
    save(body: any): Promise<import("./grade-weight.entity").GradeWeight[]>;
}
