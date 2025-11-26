import { Repository } from 'typeorm';
import { Employee } from './user.entity';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<Employee>);
    save(options: any): Promise<any>;
    findOne(options: any): Promise<Employee>;
    update(id: number, options: any): Promise<import("typeorm").UpdateResult>;
    findAll(): Promise<Employee[]>;
    delete(id: number): Promise<void>;
}
