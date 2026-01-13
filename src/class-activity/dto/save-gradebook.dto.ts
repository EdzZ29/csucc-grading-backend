/* eslint-disable prettier/prettier */
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class FinalGradePayloadDto {
  @IsString()
  studentId: string;

  @IsNumber()
  weightedScore: number;

  @IsNumber()
  numericalGrade: number;

  @IsString()
  remarks: string;
}

class ScoreEntryDto {
  @IsString()
  studentId: string;

  @IsOptional()
  @IsNumber()
  score: number;
}

class ActivityDto {
  @IsOptional()
  activity_id: number;

  @IsString()
  name: string;

  @IsNumber()
  maxScore: number;

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
  sy: string;

  @IsString()
  sem: string;

  @IsString()
  grading_type: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityDto)
  activities: ActivityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalGradePayloadDto)
  finalGrades: FinalGradePayloadDto[];
}