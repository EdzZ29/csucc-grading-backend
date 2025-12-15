import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeWeight } from './grade-weight.entity';
import { GradeWeightService } from './grade-weight.service';
import { GradeWeightController } from './grade-weight.controller';
import { Employee } from 'src/employee/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GradeWeight, Employee])],
  controllers: [GradeWeightController],
  providers: [GradeWeightService],
  exports: [GradeWeightService], // Exported so Logic can use it if needed
})
export class GradeWeightModule {}
