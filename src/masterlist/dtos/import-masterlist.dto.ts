/* eslint-disable prettier/prettier */
import { IsArray, IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';

export class ImportMasterlistDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  // eslint-disable-next-line prettier/prettier
  headers: string[]; // Headers must be strings

  @IsArray()
  @ArrayNotEmpty()
  rows: any[][]; // Allow 'any' because some cells might be numbers
}
