import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassActivityService } from './class-activity.service';
import { ClassActivityController } from './class-activity.controller';
import { ClassActivity } from './class-activity.entity';
import { RawScore } from '../raw-score/raw-score.entity';
import { Masterlist } from '../masterlist/masterlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassActivity, RawScore, Masterlist])],
  controllers: [ClassActivityController],
  providers: [ClassActivityService],
})
export class ClassActivityModule {}
