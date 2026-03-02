/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassActivityService } from './class-activity.service';
import { ClassActivityController } from './class-activity.controller';
import { ClassActivity } from '../obe/class-activity.entity'; // ← unified entity from obe/
import { RawScore } from '../obe/raw-score.entity';
import { Masterlist } from '../masterlist/masterlist.entity';
import { FinalGrade } from '../obe/final-grade.entity';
import { CourseOutcome } from '../obe/course-outcome.entity';
import { TosWeight } from '../obe/tos-weight.entity';
import { AssessmentType } from '../obe/assessment-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassActivity,
      RawScore,
      Masterlist,
      FinalGrade,
      CourseOutcome,
      TosWeight,
      AssessmentType,
    ]),
  ],
  controllers: [ClassActivityController],
  providers: [ClassActivityService],
  exports: [ClassActivityService],
})
export class ClassActivityModule {}