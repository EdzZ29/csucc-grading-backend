import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionService } from './prediction.service';
import { PredictionController } from './prediction.controller';
import { Masterlist } from '../masterlist/masterlist.entity';
import { RawScore } from '../raw-score/raw-score.entity';
import { FinalGrade } from '../obe/final-grade.entity';
import { ClassActivity } from '../obe/class-activity.entity';
import { AssessmentType } from '../obe/assessment-type.entity';
import { AuthGuard } from '../auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Masterlist,
      RawScore,
      FinalGrade,
      ClassActivity,
      AssessmentType,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [PredictionController],
  providers: [PredictionService, AuthGuard],
})
export class PredictionModule {}