import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; //  Required for HttpService
import { TypeOrmModule } from '@nestjs/typeorm'; //  Required for MasterlistRepository
import { PredictionService } from './prediction.service';
import { PredictionController } from './prediction.controller';
import { Masterlist } from '../masterlist/masterlist.entity'; // Import entity
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { RawScore } from 'src/raw-score/raw-score.entity';
import { FinalGrade } from 'src/final-grade/final-grade.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Masterlist, RawScore, FinalGrade]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [PredictionController],
  providers: [PredictionService, AuthGuard],
})
export class PredictionModule {}
