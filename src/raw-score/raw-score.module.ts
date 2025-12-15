import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawScore } from './raw-score.entity';
import { RawScoreService } from './raw-score.service';
import { RawScoreController } from './raw-score.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RawScore])],
  controllers: [RawScoreController],
  providers: [RawScoreService],
})
export class RawScoreModule {}
