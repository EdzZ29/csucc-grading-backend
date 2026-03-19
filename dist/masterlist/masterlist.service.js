"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterlistService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const masterlist_entity_1 = require("./masterlist.entity");
const employee_entity_1 = require("../employee/employee.entity");
let MasterlistService = class MasterlistService {
    constructor(masterlistRepo, employeeRepo) {
        this.masterlistRepo = masterlistRepo;
        this.employeeRepo = employeeRepo;
    }
    async findByYearAndSem(sy, sem, user) {
        const query = this.masterlistRepo
            .createQueryBuilder('masterlist')
            .leftJoinAndSelect('masterlist.employee', 'employee');
        if (sy && sy !== 'null')
            query.andWhere('masterlist.sy = :sy', { sy });
        if (sem && sem !== 'null')
            query.andWhere('masterlist.sem = :sem', { sem });
        const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN';
        if (!isAdmin) {
            query.andWhere('masterlist.empid = :empid', { empid: user.empid });
        }
        return await query.getMany();
    }
    async findBySYSemAndEmployee(sy, sem, empid) {
        return await this.masterlistRepo.find({
            where: { sy, sem, empid },
            relations: ['employee'],
        });
    }
    async findBySYandSem(sy, sem) {
        return await this.masterlistRepo.find({
            where: { sy, sem },
            relations: ['employee'],
        });
    }
    async getUniqueSubjectsCount() {
        const result = await this.masterlistRepo
            .createQueryBuilder('masterlist')
            .select('COUNT(DISTINCT masterlist.subjcode || masterlist.section)', 'count')
            .getRawOne();
        return parseInt(result.count, 10) || 0;
    }
    async findAllForUser(user) {
        const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN';
        if (isAdmin) {
            return this.masterlistRepo.find({ relations: ['employee'] });
        }
        return this.masterlistRepo.find({
            where: { empid: user.empid },
            relations: ['employee'],
        });
    }
    async findOneForUser(id, user) {
        const record = await this.masterlistRepo.findOne({
            where: { masterlist_id: id },
            relations: ['employee'],
        });
        if (!record)
            throw new common_1.NotFoundException(`Masterlist ${id} not found`);
        const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN';
        if (!isAdmin && record.empid !== user.empid) {
            throw new common_1.NotFoundException(`Access denied`);
        }
        return record;
    }
    async getAllClassesForAdmin() {
        return this.masterlistRepo.find({
            relations: ['employee'],
            order: { masterlist_id: 'DESC' },
        });
    }
    async importCsv(data) {
        const { headers, rows } = data;
        const successEntities = [];
        const errors = [];
        const headerMap = headers.reduce((acc, h, i) => {
            const cleanHeader = h.replace(/^\uFEFF/, '').replace(/['"]+/g, '').trim().toLowerCase();
            acc[cleanHeader] = i;
            return acc;
        }, {});
        const getValue = (row, colName) => {
            const index = headerMap[colName.toLowerCase()];
            return index !== undefined && row[index] ? String(row[index]).trim() : '';
        };
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row.some(cell => cell && String(cell).trim() !== ''))
                continue;
            try {
                const instLast = getValue(row, 'instructor_lastname');
                const instFirst = getValue(row, 'instructor_firstname');
                const instructor = await this.employeeRepo.findOne({
                    where: { lastname: (0, typeorm_2.Like)(instLast), firstname: (0, typeorm_2.Like)(instFirst) },
                });
                if (!instructor)
                    throw new Error(`Instructor ${instFirst} ${instLast} not found`);
                const studid = getValue(row, 'studid');
                const subjcode = getValue(row, 'subjcode');
                const sy = getValue(row, 'sy');
                const sem = getValue(row, 'sem');
                const existing = await this.masterlistRepo.findOne({
                    where: { studid, subjcode, sy, sem },
                });
                if (existing)
                    throw new Error('Duplicate student entry for this class');
                const entity = new masterlist_entity_1.Masterlist();
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
            }
            catch (error) {
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
};
exports.MasterlistService = MasterlistService;
exports.MasterlistService = MasterlistService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(masterlist_entity_1.Masterlist)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MasterlistService);
//# sourceMappingURL=masterlist.service.js.map