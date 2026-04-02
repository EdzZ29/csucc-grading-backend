/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Req, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { ObeService } from './obe.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('obe')
export class ObeController {
    constructor(private readonly obeService: ObeService) { }


  @Get('assessment-types')
  async getTypes(@Req() req: any) {
    const empid = req.query.empid || (req.user && req.user.empid);
    return await this.obeService.findAllAssessmentTypes(empid);
  }

@Post('course-outcome/batch')
async batchSave(@Body() payload: any, @Req() req: any) {
  const empid = payload.empid || (req.user && req.user.empid);

  console.log('[OBE] batchSave called with empid:', empid, 'subjcode:', payload.subjcode, 'section:', payload.section);
  console.log('[OBE] outcomes:', JSON.stringify(payload.outcomes));
  console.log('[OBE] weights:', JSON.stringify(payload.weights));

  if (!empid) {
    throw new InternalServerErrorException('User identification failed — no empid in request body or auth token');
  }

  if (!payload.subjcode || !payload.section) {
    throw new InternalServerErrorException('Missing required fields: subjcode and section');
  }

  try {
    console.log('[OBE] Starting saveBatchSyllabus...');
    const result = await this.obeService.saveBatchSyllabus({
      subjcode: payload.subjcode.trim(),
      section: payload.section.trim(),
      outcomes: payload.outcomes || [],
      weights: payload.weights || [],
      empid,
      sy: payload.sy || '',
      sem: payload.sem || '',
    });
    console.log('[OBE] batchSave SUCCESS, result:', result);
    return result;
  } catch (error) {
    console.error('[OBE] batchSave FAILED');
    console.error('[OBE] Error message:', error.message);
    console.error('[OBE] Error details:', error);
    console.error('[OBE] Error stack:', error.stack);
    
    // Provide specific error message to frontend
    const errorMessage = error.message || 'Failed to save syllabus';
    throw new InternalServerErrorException(`[OBE Error] ${errorMessage}`);
  }
}

    /* eslint-disable prettier/prettier */
@Post('assessment-types')
    async addType(@Body() data: { name: string; code: string; empid: number }) {
        return await this.obeService.createAssessmentType(data);
    }

  // ==========================================
  // SYLLABUS SETUP (Outcomes & Weights)
  // ==========================================

  @Post('course-outcome')
  async createCO(@Body() data: any) {
    return await this.obeService.createCourseOutcome(data);
  }

  @Post('tos-weights')
  async setWeights(@Body() weights: any[]) {
    return await this.obeService.saveTosWeights(weights);
  }

@Get('syllabus/:empid/:subjcode/:section')
async getSyllabus(
  @Param('empid', ParseIntPipe) empid: number,
  @Param('subjcode') subjcode: string,
  @Param('section') section: string
) {
  console.log(`Fetching Syllabus: Emp:${empid}, Subj:${subjcode}, Sect:${section}`);

  if (!empid || !subjcode || !section) {
    throw new InternalServerErrorException('Missing required route parameters');
  }

  return await this.obeService.getFullSyllabus(empid, subjcode, section);
}

  // ==========================================
  // CLASS ACTIVITIES & SCORING
  // ==========================================

  @Post('activity')
  async createActivity(@Body() data: any) {
    return await this.obeService.createActivity(data);
  }

  @Post('raw-score')
  async recordScore(@Body() data: any) {
    return await this.obeService.recordRawScore(data);
  }

  // ==========================================
  // FINAL COMPUTATION
  // ==========================================

  @Patch('calculate-grade/:masterlistId')
  async calculateFinal(
    @Param('masterlistId', ParseIntPipe) masterlistId: number,
  ) {
    return await this.obeService.calculateStudentFinalGrade(masterlistId);
  }
}