import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './user.entity';

@Injectable()
export class UserService {
    constructor (
        @InjectRepository(Employee) private readonly userRepository: Repository<Employee>
    ){  
    }

    async save(options){
        return this.userRepository.save(options)
    }

    async findOne(options) {
       return this.userRepository.findOneBy(options)
    }

    async update(id: number, options) {
        return this.userRepository.update(id, options)
    }

    async findAll(): Promise<Employee[]> {
        return this.userRepository.find({ order: { employee_id: 'ASC' } });
    }

    async delete(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }

}

