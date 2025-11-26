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
import { Employee } from 'src/user/user.entity';
import { Request } from 'express';
import { RolesGuard } from '../auth/roles.guard';

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
  async findOne(@Param('id') id: number, @Req() req: Request): Promise<Masterlist> {
    const user = req.user as Employee;
    return this.masterlistService.findOneForUser(id, user);
  }

  @Post('import')
  async importCsv(@Body() data: { headers: string[]; rows: string[][] }) {
    console.log('📥 Received CSV Payload:', JSON.stringify(data, null, 2));
    return this.masterlistService.importCsv(data);
  }

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
    @Query('employee_id') employeeId?: number,
  ): Promise<Masterlist[]> {
    if (employeeId) {
      return this.masterlistService.findBySYSemAndEmployee(
        sy,
        sem,
        Number(employeeId),
      );
    } else {
      return this.masterlistService.findBySYandSem(sy, sem);
    }
  }
}
