/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Req, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { ObeService } from './obe.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('obe')
export class ObeController {
    constructor(private readonly obeService: ObeService) { }


  @Get('assessment-types')
  async getTypes() {
    return await this.obeService.findAllAssessmentTypes();
  }

@UseGuards(AuthGuard) // Ensure the user is logged in
@Post('course-outcome/batch')
async batchSave(@Body() payload: any, @Req() req: any) {
  // Use the empid of the logged-in instructor
  const empid = req.user.empid;

  if (!empid) {
    throw new InternalServerErrorException('User identification failed');
  }

  return await this.obeService.saveBatchSyllabus({
    ...payload,
    empid
  });
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
    // You can replace 'any' with a DTO later for validation
    return await this.obeService.createCourseOutcome(data);
  }

  @Post('tos-weights')
  async setWeights(@Body() weights: any[]) {
    // Expects an array of weights for the matrix
    return await this.obeService.saveTosWeights(weights);
  }

@Get('syllabus/:empid/:subjcode/:section')
async getSyllabus(
  @Param('empid', ParseIntPipe) empid: number, // Use ParseIntPipe for safety
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