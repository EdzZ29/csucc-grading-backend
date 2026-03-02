/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ClassActivityService } from './class-activity.service';
import { SaveGradebookDto } from './dto/save-gradebook.dto';
import { ComputeGradesDto } from './dto/compute-grades.dto';

@Controller('class-activity')
export class ClassActivityController {
  constructor(private readonly service: ClassActivityService) {}

  /* ── Existing CRUD (preserved, no breaking changes) ──────── */

  @Get('gradebook/:subjcode/:section/:category')
  getGradebook(
    @Param('subjcode') subjcode: string,
    @Param('section') section: string,
    @Param('category') category: string,
  ) {
    return this.service.getGradebook(subjcode, section, category);
  }

  @Post('save-gradebook')
  saveGradebook(@Body() dto: SaveGradebookDto) {
    return this.service.saveGradebook(dto);
  }

  @Post('save-final-grades')
  saveFinalGrades(@Body() dto: SaveGradebookDto) {
    return this.service.saveFinalGradesOnly(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.service.deleteActivity(id);
  }

  /* ── NEW: OBE Computation Pipeline ───────────────────────── */

  @Post('compute-grades')
  computeGrades(@Body() dto: ComputeGradesDto) {
    return this.service.computeAllGrades(dto);
  }

  @Get('sheet/raw-score')
  getRawScoreSheet(
    @Query('subjcode') subjcode: string,
    @Query('section') section: string,
    @Query('sy') sy: string,
    @Query('sem') sem: string,
  ) {
    return this.service.getRawScoreSheet(subjcode, section, sy, sem);
  }

  @Get('sheet/percent-rating')
  getPercentRatingSheet(
    @Query('subjcode') subjcode: string,
    @Query('section') section: string,
    @Query('sy') sy: string,
    @Query('sem') sem: string,
  ) {
    return this.service.getPercentRatingSheet(subjcode, section, sy, sem);
  }

  @Get('sheet/final-grade')
  getFinalGradeSheet(
    @Query('subjcode') subjcode: string,
    @Query('section') section: string,
    @Query('sy') sy: string,
    @Query('sem') sem: string,
  ) {
    return this.service.getFinalGradeSheet(subjcode, section, sy, sem);
  }
}