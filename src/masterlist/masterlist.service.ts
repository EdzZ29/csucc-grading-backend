/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Masterlist } from './masterlist.entity';
import { Employee } from 'src/employee/employee.entity';
import { ImportMasterlistDto } from './dtos/import-masterlist.dto';

@Injectable()
export class MasterlistService {
  constructor(
    @InjectRepository(Masterlist)
    private readonly masterlistRepo: Repository<Masterlist>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  // ==========================================
  // CORE QUERIES
  // ==========================================

  async findByYearAndSem(sy: string, sem: string, user: Employee): Promise<Masterlist[]> {
    const query = this.masterlistRepo
      .createQueryBuilder('masterlist')
      .leftJoinAndSelect('masterlist.employee', 'employee');

    if (sy && sy !== 'null') query.andWhere('masterlist.sy = :sy', { sy });
    if (sem && sem !== 'null') query.andWhere('masterlist.sem = :sem', { sem });

    const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN';
    if (!isAdmin) {
      query.andWhere('masterlist.empid = :empid', { empid: user.empid });
    }

    return await query.getMany();
  }

  async findBySYSemAndEmployee(sy: string, sem: string, empid: number): Promise<Masterlist[]> {
    return await this.masterlistRepo.find({
      where: { sy, sem, empid },
      relations: ['employee'],
    });
  }

  async findBySYandSem(sy: string, sem: string): Promise<Masterlist[]> {
    return await this.masterlistRepo.find({
      where: { sy, sem },
      relations: ['employee'],
    });
  }

  // ==========================================
  // DASHBOARD & UTILS
  // ==========================================

  async getUniqueSubjectsCount(): Promise<number> {
    const result = await this.masterlistRepo
      .createQueryBuilder('masterlist')
      .select('COUNT(DISTINCT masterlist.subjcode || masterlist.section)', 'count')
      .getRawOne();
    return parseInt(result.count, 10) || 0;
  }

  async findAllForUser(user: Employee): Promise<Masterlist[]> {
    const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN';
    if (isAdmin) {
      return this.masterlistRepo.find({ relations: ['employee'] });
    }
    return this.masterlistRepo.find({
      where: { empid: user.empid },
      relations: ['employee'],
    });
  }

  async findOneForUser(id: number, user: Employee): Promise<Masterlist> {
    const record = await this.masterlistRepo.findOne({
      where: { masterlist_id: id },
      relations: ['employee'],
    });
    if (!record) throw new NotFoundException(`Masterlist ${id} not found`);

    const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN';
    if (!isAdmin && record.empid !== user.empid) {
      throw new NotFoundException(`Access denied`);
    }
    return record;
  }

  // ── Dean/Admin: returns ALL classes across ALL instructors ──────────
  async getAllClassesForAdmin(): Promise<Masterlist[]> {
    return this.masterlistRepo.find({       // ← fixed: masterlistRepo not masterlistRepository
      relations: ['employee'],
      order: { masterlist_id: 'DESC' },
    });
  }

  // ==========================================
  // CSV IMPORT LOGIC
  // ==========================================

  async importCsv(data: ImportMasterlistDto) {
    const { headers, rows } = data;
    const successEntities: Masterlist[] = [];
    const errors: { row: number; reason: string; data: any }[] = [];

    const headerMap = headers.reduce((acc, h, i) => {
      const cleanHeader = h.replace(/^\uFEFF/, '').replace(/['"]+/g, '').trim().toLowerCase();
      acc[cleanHeader] = i;
      return acc;
    }, {} as Record<string, number>);

    const getValue = (row: any[], colName: string) => {
      const index = headerMap[colName.toLowerCase()];
      return index !== undefined && row[index] ? String(row[index]).trim() : '';
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.some(cell => cell && String(cell).trim() !== '')) continue;

      try {
        const instLast = getValue(row, 'instructor_lastname');
        const instFirst = getValue(row, 'instructor_firstname');
        const instructor = await this.employeeRepo.findOne({
          where: { lastname: Like(instLast), firstname: Like(instFirst) },
        });

        if (!instructor) throw new Error(`Instructor ${instFirst} ${instLast} not found`);

        const studid = getValue(row, 'studid');
        const subjcode = getValue(row, 'subjcode');
        const sy = getValue(row, 'sy');
        const sem = getValue(row, 'sem');

        const existing = await this.masterlistRepo.findOne({
          where: { studid, subjcode, sy, sem },
        });
        if (existing) throw new Error('Duplicate student entry for this class');

        const entity = new Masterlist();
        entity.employee = instructor;
        entity.sy = sy;
        entity.sem = sem;
        entity.subjcode = subjcode;
        entity.section = getValue(row, 'section');
        entity.credit_units = parseInt(getValue(row, 'credit_units') || '3');
        entity.number_of_cos = parseInt(getValue(row, 'number_of_cos') || '0');
        entity.no_of_students = parseInt(getValue(row, 'no_of_students') || '0');
        entity.chairperson = getValue(row, 'chairperson');
        entity.college_dean = getValue(row, 'college_dean');
        entity.studid = studid;
        entity.studlastname = getValue(row, 'studlastname');
        entity.studfirstname = getValue(row, 'studfirstname');
        entity.course = getValue(row, 'course');
        entity.year_level = getValue(row, 'year_level');

        successEntities.push(entity);
      } catch (error) {
        errors.push({ row: i + 1, reason: error.message, data: row });
      }
    }

    let savedCount = 0;
    const BATCH_SIZE = 500;
    for (let i = 0; i < successEntities.length; i += BATCH_SIZE) {
      const batch = successEntities.slice(i, i + BATCH_SIZE);
      await this.masterlistRepo.save(batch);
      savedCount += batch.length;
    }

    return { success: true, successCount: savedCount, failedCount: errors.length, errors };
  }
}