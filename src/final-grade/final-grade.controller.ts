import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FinalGradeService } from './final-grade.service';

@Controller('final-grade')
export class FinalGradeController {
  constructor(private readonly finalGradeService: FinalGradeService) {}

  @Post()
  create(@Body() createFinalGradeDto: any) {
    return this.finalGradeService.create(createFinalGradeDto);
  }

  @Get()
  findAll() {
    return this.finalGradeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.finalGradeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFinalGradeDto: any) {
    return this.finalGradeService.update(+id, updateFinalGradeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.finalGradeService.remove(+id);
  }
}
