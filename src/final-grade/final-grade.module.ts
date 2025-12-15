import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalGrade } from './final-grade.entity';
import { FinalGradeService } from './final-grade.service';
import { FinalGradeController } from './final-grade.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinalGrade])],
  controllers: [FinalGradeController],
  providers: [FinalGradeService],
})
export class FinalGradeModule {}
