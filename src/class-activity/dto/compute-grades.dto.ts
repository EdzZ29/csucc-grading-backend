/* eslint-disable prettier/prettier */
import { IsString, IsNumber } from 'class-validator';

export class ComputeGradesDto {
  @IsNumber()
  empid: number;

  @IsString()
  subjcode: string;

  @IsString()
  section: string;

  @IsString()
  sy: string;

  @IsString()
  sem: string;
}