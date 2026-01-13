import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { PredictionService } from './prediction.service';
// import { AuthGuard } from '../auth/auth.guard'; // Uncomment if you have auth

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  // Route: POST /api/prediction/train
  // Used by the "Train AI Model" button
  // @UseGuards(AuthGuard)
  @Post('train')
  async trainModel() {
    return this.predictionService.trainModel();
  }

  // Route: GET /api/prediction/risk/:id
  // Used by the "Check Risk" button
  // @UseGuards(AuthGuard)
  @Get('risk/:id')
  async getRisk(@Param('id') id: number) {
    return this.predictionService.predictRisk(id);
  }
}