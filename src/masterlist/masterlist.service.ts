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

  // ... [Keep findAllForUser / findOneForUser methods] ...

  async findAllForUser(user: Employee): Promise<Masterlist[]> {
    if (user.role === 'Admin') {
      return this.masterlistRepo.find({ relations: ['employee'] });
    }
    return this.masterlistRepo.find({
      where: { employee: { empid: user.empid } },
      relations: ['employee'],
    });
  }

  async findOneForUser(id: number, user: Employee): Promise<Masterlist> {
    const record = await this.masterlistRepo.findOne({
      where: { masterlist_id: id },
      relations: ['employee'],
    });
    if (!record) throw new NotFoundException(`Masterlist ${id} not found`);
    if (user.role !== 'Admin' && record.employee?.empid !== user.empid) {
      throw new NotFoundException(`You do not have access to this record`);
    }
    return record;
  }

  // ✅ FIXED IMPORT (With Batching)
  async importCsv(data: ImportMasterlistDto) {
    const { headers, rows } = data;
    const successEntities: Masterlist[] = [];
    const errors: { row: number; reason: string; data: any }[] = [];

    console.log('🚀 Starting Import Process...');
    console.log(`📊 Received ${rows.length} rows.`);

    // 1. Map Headers
    const headerMap = headers.reduce((acc, h, i) => {
      const cleanHeader = h
        .replace(/^\uFEFF/, '')
        .replace(/['"]+/g, '')
        .replace(/[\r\n]+/g, '')
        .trim()
        .toLowerCase();
      acc[cleanHeader] = i;
      return acc;
    }, {} as Record<string, number>);

    const getValue = (row: any[], colName: string) => {
      const index = headerMap[colName.toLowerCase()];
      if (index === undefined) return null;
      const val = row[index];
      return val ? String(val).trim() : '';
    };

    // 2. Iterate Rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.some(cell => cell && String(cell).trim() !== '')) continue;

      try {
        // --- Identify Instructor ---
        const instLast = getValue(row, 'instructor_lastname');
        const instFirst = getValue(row, 'instructor_firstname');

        if (!instLast || !instFirst) {
          throw new Error('Missing Instructor Name');
        }

        const instructor = await this.employeeRepo.findOne({
          where: {
            lastname: Like(instLast),
            firstname: Like(instFirst),
          },
        });

        if (!instructor) {
          // Log explicitly to help debugging names
          console.warn(`⚠️ Instructor Not Found: "${instFirst} ${instLast}" (Row ${i + 1})`);
          throw new Error(`Instructor not found in DB: ${instFirst} ${instLast}`);
        }

        // --- Key Fields ---
        const studid = getValue(row, 'studid');
        const subjcode = getValue(row, 'subjcode');
        const sy = getValue(row, 'sy');
        const sem = getValue(row, 'sem');

        if (!studid || !subjcode || !sy || !sem) {
          throw new Error('Missing key fields');
        }

        // --- Check Duplicate ---
        const existing = await this.masterlistRepo.findOne({
          where: { studid, subjcode, sy, sem },
        });

        if (existing) {
          throw new Error('Duplicate Record');
        }

        // --- Create Entity ---
        const entity = new Masterlist();
        entity.employee = instructor;
        entity.sy = sy;
        entity.sem = sem;
        entity.subjcode = subjcode;
        entity.section = getValue(row, 'section');
        entity.type = getValue(row, 'type') || 'Lec';

        entity.studid = studid;
        entity.studlastname = getValue(row, 'studlastname');
        entity.studfirstname = getValue(row, 'studfirstname');
        entity.studmiddlename = getValue(row, 'studmiddlename');
        entity.studextname = getValue(row, 'studextname');
        entity.studmajor = getValue(row, 'studmajor');

        const lvl = getValue(row, 'studlevel');
        entity.studlevel = lvl ? parseInt(lvl) : 0;

        entity.department = getValue(row, 'department');
        entity.college = getValue(row, 'college');

        successEntities.push(entity);
      } catch (error) {
        errors.push({
          row: i + 1,
          reason: error.message,
          data: row,
        });
      }
    }

    // ✅ 3. BATCH SAVE (Fixes 500 Error)
    let savedCount = 0;
    if (successEntities.length > 0) {
      console.log(`💾 Saving ${successEntities.length} records in batches...`);

      const BATCH_SIZE = 500; // Safe size (500 rows * ~15 cols = 7500 params < 65000 limit)

      for (let i = 0; i < successEntities.length; i += BATCH_SIZE) {
        const batch = successEntities.slice(i, i + BATCH_SIZE);
        console.log(`   ...Processing batch ${Math.ceil((i + 1) / BATCH_SIZE)} (${batch.length} rows)`);

        try {
          await this.masterlistRepo.save(batch);
          savedCount += batch.length;
        } catch (dbError) {
          console.error('❌ Batch Save Failed:', dbError.message);
          // Push a generic error for this batch
          errors.push({
            row: 0,
            reason: `Batch Failed (Rows ${i + 1}-${i + batch.length}): ${dbError.message}`,
            data: {},
          });
        }
      }
    }

    return {
      success: true,
      message: 'Import process completed',
      totalRows: rows.length,
      successCount: savedCount, // Use actual saved count
      failedCount: errors.length + (successEntities.length - savedCount),
      errors: errors,
    };
  }

  // ... [Keep your query methods] ...
    async findByYearAndSem(sy: string, sem: string, user: Employee) {
    const query = this.masterlistRepo
      .createQueryBuilder('masterlist')
      .leftJoinAndSelect('masterlist.employee', 'employee');

    if (sy && sy !== 'undefined' && sy !== 'null') query.andWhere('masterlist.sy = :sy', { sy });
    if (sem && sem !== 'undefined' && sem !== 'null') query.andWhere('masterlist.sem = :sem', { sem });
    if (user.role !== 'Admin') query.andWhere('employee.empid = :empid', { empid: user.empid });

    return await query.getMany();
  }

  async findBySYSemAndEmployee(sy: string, sem: string, empid: number) {
    return await this.masterlistRepo.find({
      where: { sy, sem, employee: { empid } },
      relations: ['employee'],
    });
  }

  async findBySYandSem(sy: string, sem: string) {
    return await this.masterlistRepo.find({
      where: { sy, sem },
      relations: ['employee'],
    });
  }
}