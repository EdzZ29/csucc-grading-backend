import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
export declare class EmployeeService {
    private readonly employeeRepository;
    constructor(employeeRepository: Repository<Employee>);
    save(options: any): Promise<any>;
    findOne(options: any): Promise<Employee>;
    update(id: number, options: any): Promise<import("typeorm").UpdateResult>;
    findAll(): Promise<Employee[]>;
    delete(id: number): Promise<void>;
}
