import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RawScoreService } from './raw-score.service';

@Controller('raw-score')
export class RawScoreController {
  constructor(private readonly rawScoreService: RawScoreService) {}

  @Post()
  create(@Body() createRawScoreDto: any) {
    return this.rawScoreService.create(createRawScoreDto);
  }

  @Get()
  findAll() {
    return this.rawScoreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rawScoreService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRawScoreDto: any) {
    return this.rawScoreService.update(+id, updateRawScoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rawScoreService.remove(+id);
  }
}
