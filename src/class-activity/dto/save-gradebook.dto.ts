/* eslint-disable prettier/prettier */
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScoreEntryDto {
  @IsString()
  studentId: string;

  @IsNumber()
  score: number;
}

export class ActivityDto {
  @IsOptional()
  @IsNumber()
  activity_id?: number;

  @IsString()
  name: string;

  @IsNumber()
  maxScore: number;

  /** FK to course_outcomes — preferred for OBE computation */
  @IsOptional()
  @IsNumber()
  co_id?: number;

  /** FK to assessment_types — preferred for OBE computation */
  @IsOptional()
  @IsNumber()
  type_id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreEntryDto)
  scores: ScoreEntryDto[];
}

export class FinalGradeEntryDto {
  @IsString()
  studentId: string;

  @IsNumber()
  weightedScore: number;

  @IsNumber()
  numericalGrade: number;

  @IsString()
  remarks: string;
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

  /** Assessment type code for filtering: "QZ","EX","CA" */
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  grading_type?: string;

  @IsOptional()
  @IsNumber()
  empid?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityDto)
  activities?: ActivityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalGradeEntryDto)
  finalGrades?: FinalGradeEntryDto[];
}