/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObeService } from './obe.service';
import { ObeController } from './obe.controller';
import { JwtModule } from '@nestjs/jwt';
// Import all entities
import { CourseOutcome } from './course-outcome.entity';
import { TosWeight } from './tos-weight.entity';
import { RawScore } from './raw-score.entity';
import { FinalGrade } from './final-grade.entity';
import { ClassActivity } from './class-activity.entity';
import { AssessmentType } from './assessment-type.entity'
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseOutcome,
      TosWeight,
      RawScore,
      FinalGrade,
      ClassActivity,
      AssessmentType,
    ]),
    // ✅ Import JwtModule so AuthGuard can resolve JwtService
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // Match your AuthModule config
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ObeController],
  providers: [ObeService],
  exports: [ObeService],
})
export class ObeModule {}