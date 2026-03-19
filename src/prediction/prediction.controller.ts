import { Controller, Post, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('prediction')
@UseGuards(AuthGuard)
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  // POST /api/prediction/train
  @Post('train')
  trainModel() {
    return this.predictionService.trainModel();
  }

  // GET /api/prediction/risk/:masterlistId
  @Get('risk/:id')
  getRisk(@Param('id') id: number) {
    return this.predictionService.predictRisk(id);
  }

  // GET /api/prediction/batch?subjcode=CS101&section=A&sy=2025-2026&sem=1st
  @Get('batch')
  getBatch(
    @Query('subjcode') subjcode: string,
    @Query('section')  section:  string,
    @Query('sy')       sy:       string,
    @Query('sem')      sem:      string,
  ) {
    return this.predictionService.predictBatch(subjcode, section, sy, sem);
  }

  // GET /api/prediction/heatmap?subjcode=CS101&section=A&sy=2025-2026&sem=1st
  // Returns CO attainment grid: students × course outcomes with pass/fail coloring
  @Get('heatmap')
  getHeatmap(
    @Query('subjcode') subjcode: string,
    @Query('section')  section:  string,
    @Query('sy')       sy:       string,
    @Query('sem')      sem:      string,
  ) {
    return this.predictionService.getCoHeatmap(subjcode, section, sy, sem);
  }

  // GET /api/prediction/trajectory?subjcode=CS101&section=A&sy=2025-2026&sem=1st
  // Returns per-student assessment score timeline for trend visualization
  @Get('trajectory')
  getTrajectory(
    @Query('subjcode') subjcode: string,
    @Query('section')  section:  string,
    @Query('sy')       sy:       string,
    @Query('sem')      sem:      string,
  ) {
    return this.predictionService.getTrajectory(subjcode, section, sy, sem);
  }
}