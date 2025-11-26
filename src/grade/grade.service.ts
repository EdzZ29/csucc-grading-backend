import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './grade.entity';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  // Create a grade
  async create(data: Partial<Grade>): Promise<Grade> {
    const grade = this.gradeRepository.create(data);
    return await this.gradeRepository.save(grade);
  }

  // Get all grades
  async findAll(): Promise<Grade[]> {
    return await this.gradeRepository.find({
      relations: ['employee', 'masterlist'],
    });
  }

  // Get one grade by ID
  async findOne(id: number): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({
      where: { grade_id: id },
      relations: ['employee', 'masterlist'],
    });
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return grade;
  }

  // Update a grade
  async update(id: number, data: Partial<Grade>): Promise<Grade> {
    const grade = await this.findOne(id);
    Object.assign(grade, data);
    return await this.gradeRepository.save(grade);
  }

  // Delete a grade
  async remove(id: number): Promise<void> {
    const grade = await this.findOne(id);
    await this.gradeRepository.remove(grade);
  }
}
