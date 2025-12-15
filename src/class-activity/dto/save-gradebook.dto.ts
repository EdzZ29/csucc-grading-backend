import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class ScoreEntryDto {
  @IsString()
  studentId: string; // This is the 'studid' (e.g., "2023-001") from frontend

  @IsNumber()
  score: number;
}

class ActivityDto {
  @IsOptional()
  activity_id: number; // If editing an existing column

  @IsString()
  name: string; // "Quiz 1"

  @IsNumber()
  maxScore: number; // 50

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreEntryDto)
  scores: ScoreEntryDto[];
}

export class SaveGradebookDto {
  @IsString()
  subjcode: string;

  @IsString()
  section: string;

  @IsString()
  grading_type: string; // 'LECTURE' or 'LEC_LAB'

  @IsString()
  category: string; // 'WRITTEN', 'PERFORMANCE', etc.

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityDto)
  activities: ActivityDto[];
}
