/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeWeight } from './grade-weight.entity';
import { Employee } from '../employee/employee.entity';

@Injectable()
export class GradeWeightService {
  constructor(
    @InjectRepository(GradeWeight)
    private readonly repo: Repository<GradeWeight>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async findAll() {
    return this.repo.find({
      relations: ['employee'], // ✅ This will now work without conflict
    });
  }

  async saveWeights(data: { modified_by_empid: number; weights: any }) {
    const { modified_by_empid, weights } = data;

    // Validate Employee exists to avoid FK error
    let adminRef = null;
    if (modified_by_empid) {
      // We don't need to fetch the whole object, just create a reference
      adminRef = { empid: modified_by_empid };
    }

    const entitiesToSave: GradeWeight[] = [];

    for (const [system, categories] of Object.entries(weights)) {
      for (const [category, details] of Object.entries(categories as any)) {
        let entity = await this.repo.findOne({
          where: { grading_type: system, category: category },
        });

        if (!entity) {
          entity = new GradeWeight();
          entity.grading_type = system;
          entity.category = category;
        }

        entity.weight_percentage = Number((details as any).percentage) / 100;

        // ✅ FIX: Assign the object reference, not the column value
        entity.employee = adminRef as Employee;

        entitiesToSave.push(entity);
      }
    }

    return this.repo.save(entitiesToSave);
  }
}