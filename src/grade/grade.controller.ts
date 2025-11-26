import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { GradeService } from './grade.service';
import { Grade } from './grade.entity';

@Controller('grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  // Create
  @Post()
  async create(@Body() data: Partial<Grade>): Promise<Grade> {
    return await this.gradeService.create(data);
  }

  // Get all
  @Get()
  async findAll(): Promise<Grade[]> {
    return await this.gradeService.findAll();
  }

  // Get one
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Grade> {
    return await this.gradeService.findOne(id);
  }

  // Update
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<Grade>,
  ): Promise<Grade> {
    return await this.gradeService.update(id, data);
  }

  // Delete
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ message: string }> {
    await this.gradeService.remove(id);
    return { message: `Grade with ID ${id} has been deleted successfully` };
  }
}
