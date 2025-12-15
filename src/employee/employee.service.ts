import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity'; // Updated import

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>, // Renamed variable
  ) {}

  async save(options) {
    return this.employeeRepository.save(options);
  }

  async findOne(options) {
    return this.employeeRepository.findOneBy(options);
  }

  async update(id: number, options) {
    return this.employeeRepository.update(id, options);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({ order: { empid: 'ASC' } });
  }

  async delete(id: number): Promise<void> {
    await this.employeeRepository.delete(id);
  }
}