import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Masterlist } from './masterlist.entity';
import { Employee } from 'src/user/user.entity';

@Injectable()
export class MasterlistService {
  constructor(
    @InjectRepository(Masterlist)
    private readonly masterlistRepo: Repository<Masterlist>,
  ) {}

  // ✅ Get all records (Admin = all, Instructor = own)
  async findAllForUser(user: Employee): Promise<Masterlist[]> {
    if (user.role === 'Admin') {
      return this.masterlistRepo.find({ relations: ['employee'] });
    }

    return this.masterlistRepo.find({
      where: { employee: { employee_id: user.employee_id } },
      relations: ['employee'],
    });
  }

  // ✅ Get single record (role-safe)
  async findOneForUser(id: number, user: Employee): Promise<Masterlist> {
    const record = await this.masterlistRepo.findOne({
      where: { masterlist_id: id },
      relations: ['employee'],
    });

    if (!record) throw new NotFoundException(`Masterlist ${id} not found`);

    if (user.role !== 'Admin' && record.employee?.employee_id !== user.employee_id) {
      throw new NotFoundException(`You do not have access to this record`);
    }

    return record;
  }

  // ✅ CSV Import
  async importCsv(data: { headers: string[]; rows: string[][] }) {
    const { headers, rows } = data;

    const columnMap: Record<string, keyof Masterlist | 'employee'> = {
      status: 'status',
      sy: 'sy',
      sem: 'sem',
      subjcode: 'subjcode',
      section: 'section',
      studid: 'studid',
      stud_lastname: 'stud_lastname',
      stud_firstname: 'stud_firstname',
      stud_middlename: 'stud_middlename',
      stud_extname: 'stud_extname',
      employee_id: 'employee',
    };

    const entities: Masterlist[] = rows
      .filter((row) => row.some((cell) => cell && cell.trim() !== ''))
      .map((row) => {
        const obj: Partial<Masterlist> = {};
        headers.forEach((h, i) => {
          if (h === 'employee_id' && row[i]) {
            obj.employee = { employee_id: Number(row[i]) } as Employee;
          } else {
            const col = columnMap[h];
            if (col && col !== 'employee') (obj as any)[col] = row[i];
          }
        });
        return this.masterlistRepo.create(obj);
      });

    return await this.masterlistRepo.save(entities);
  }

  async findByYearAndSem(sy: string, sem: string, user: Employee) {
  const query = this.masterlistRepo
    .createQueryBuilder('masterlist')
    .leftJoinAndSelect('masterlist.employee', 'employee');

  if (sy && sy !== 'undefined' && sy !== 'null') {
    query.andWhere('masterlist.sy = :sy', { sy });
  }

  if (sem && sem !== 'undefined' && sem !== 'null') {
    query.andWhere('masterlist.sem = :sem', { sem });
  }

  if (user.role !== 'Admin') {
    // 👇 Use the *property name* here since your entity mapping handles the join column
    query.andWhere('employee.employee_id = :employee_id', {
      employee_id: user.employee_id,
    });
  }

  const result = await query.getMany();
  console.log('Query result:', result);
  return result;
}


  async findBySYSemAndEmployee(sy: string, sem: string, employee_id: number) {
    const query = this.masterlistRepo
      .createQueryBuilder('masterlist')
      .leftJoinAndSelect('masterlist.employee', 'employee')
      .where('masterlist.sy = :sy', { sy })
      .andWhere('masterlist.sem = :sem', { sem })
      .andWhere('masterlist.employee_id = :employee_id', { employee_id });

    return await query.getMany();
  }

  async findBySYandSem(sy: string, sem: string) {
    const query = this.masterlistRepo
      .createQueryBuilder('masterlist')
      .leftJoinAndSelect('masterlist.employee', 'employee')
      .where('masterlist.sy = :sy', { sy })
      .andWhere('masterlist.sem = :sem', { sem });

    return await query.getMany();
  }
}
