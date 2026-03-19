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
  @Get('count/unique-subjects')
  async getUniqueSubjectsCount() {
    const count = await this.masterlistService.getUniqueSubjectsCount();
    return { count };
  }

  // ── Dean/Admin: ALL classes across ALL instructors ──────────────────
  // MUST be declared before @Get(':id') to avoid NestJS matching
  // "all-classes" as an :id parameter.
  @Get('all-classes')
  getAllClasses(): Promise<Masterlist[]> {
    return this.masterlistService.getAllClassesForAdmin();
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async findAll(@Req() req: Request): Promise<Masterlist[]> {
    const user = req.user as Employee;
    return this.masterlistService.findAllForUser(user);
  }

  // ── This is the critical route for Grading Module ──────────────────
  @UseGuards(AuthGuard, RolesGuard)
  @Get('filter/:sy/:sem')
  async findByYearAndSem(
    @Param('sy') sy: string,
    @Param('sem') sem: string,
    @Req() req: Request,
  ): Promise<Masterlist[]> {
    const user = req.user as Employee;
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
      return this.masterlistService.findBySYSemAndEmployee(sy, sem, Number(employeeId));
    } else {
      return this.masterlistService.findBySYandSem(sy, sem);
    }
  }

  // ── CSV Import ──────────────────────────────────────────────────────
  @Post('import')
  async importCsv(@Body() importDto: ImportMasterlistDto) {
    console.log('Processing CSV Import...');
    return this.masterlistService.importCsv(importDto);
  }

  // ── MUST be last — catches any numeric :id ──────────────────────────
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<Masterlist> {
    const user = req.user as Employee;
    return this.masterlistService.findOneForUser(id, user);
  }
}