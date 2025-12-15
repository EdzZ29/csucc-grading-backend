/* eslint-disable prettier/prettier */
// src/masterlist/masterlist.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MasterlistService } from './masterlist.service';
import { Masterlist } from './masterlist.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Employee } from 'src/employee/employee.entity';
import { Request } from 'express';
import { RolesGuard } from '../auth/roles.guard';
import { ImportMasterlistDto } from './dtos/import-masterlist.dto';

@Controller('masterlist')
export class MasterlistController {
  constructor(private readonly masterlistService: MasterlistService) {}

  @UseGuards(AuthGuard)
  @Get('all')
  async findAll(@Req() req: Request): Promise<Masterlist[]> {
    const user = req.user as Employee;
    return this.masterlistService.findAllForUser(user);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<Masterlist> {
    const user = req.user as Employee;
    return this.masterlistService.findOneForUser(id, user);
  }

  // ✅ Updated Import Route using DTO
  @Post('import')
  async importCsv(@Body() importDto: ImportMasterlistDto) {
    console.log('Processing CSV Import...');
    return this.masterlistService.importCsv(importDto);
  }

  // ✅ FIXED: This is the critical route for Grading Module
  // It fetches classes filtered by SY/SEM but restricted to the logged-in Instructor
  @UseGuards(AuthGuard, RolesGuard)
  @Get('filter/:sy/:sem')
  async findByYearAndSem(
    @Param('sy') sy: string,
    @Param('sem') sem: string,
    @Req() req: Request,
  ): Promise<Masterlist[]> {
    const user = req.user as Employee;
    // Ensure your Service has findByYearAndSem(sy, sem, user)
    return this.masterlistService.findByYearAndSem(sy, sem, user);
  }

  @UseGuards(AuthGuard)
  @Get('filter/:sy/:sem/query')
  async findBySYSEMQuery(
    @Param('sy') sy: string,
    @Param('sem') sem: string,
    @Query('empid') employeeId?: number,
  ): Promise<Masterlist[]> {
    if (employeeId) {
      return this.masterlistService.findBySYSemAndEmployee(
        sy,
        sem,
        Number(employeeId),
      );
    } else {
      // Admin fallback or specific query use case
      return this.masterlistService.findBySYandSem(sy, sem);
    }
  }
}