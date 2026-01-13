import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ClassActivityService } from './class-activity.service';
import { SaveGradebookDto } from './dto/save-gradebook.dto';

@Controller('class-activity')
export class ClassActivityController {
  constructor(private readonly service: ClassActivityService) {}

  @Get('gradebook/:subjcode/:section/:category')
  getGradebook(
    @Param('subjcode') subjcode: string,
    @Param('section') section: string,
    @Param('category') category: string,
  ) {
    return this.service.getGradebook(subjcode, section, category);
  }

  // Endpoint 1: Save Activity Scores (Inputs)
  @Post('save-gradebook')
  saveGradebook(@Body() dto: SaveGradebookDto) {
    return this.service.saveGradebook(dto);
  }

  // Endpoint 2: Save Final Grades (Computed) - [NEW]
  @Post('save-final-grades')
  saveFinalGrades(@Body() dto: SaveGradebookDto) {
    return this.service.saveFinalGradesOnly(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.service.deleteActivity(id);
  }
}
