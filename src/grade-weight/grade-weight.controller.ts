import { Controller, Get, Post, Body } from '@nestjs/common';
import { GradeWeightService } from './grade-weight.service';

@Controller('grade-weight')
export class GradeWeightController {
  constructor(private readonly service: GradeWeightService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Post()
  save(@Body() body: any) {
    return this.service.saveWeights(body);
  }
}
