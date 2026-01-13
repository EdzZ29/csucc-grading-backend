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
    isAdmin(user) {
        return user.role && user.role.toUpperCase() === 'ADMIN';
    }
    async findAllForUser(user) {
        if (user.role === 'Admin') {
            return this.masterlistRepo.find({ relations: ['employee'] });
        }
        return this.masterlistRepo.find({
            where: { employee: { empid: user.empid } },
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
    async findOneForUser(id, user) {
        var _a;
        const record = await this.masterlistRepo.findOne({
            where: { masterlist_id: id },
            relations: ['employee'],
        });
        if (!record)
            throw new common_1.NotFoundException(`Masterlist ${id} not found`);
        if (user.role !== 'Admin' && ((_a = record.employee) === null || _a === void 0 ? void 0 : _a.empid) !== user.empid) {
            throw new common_1.NotFoundException(`You do not have access to this record`);
        }
        return record;
    }
    async importCsv(data) {
        const { headers, rows } = data;
        const successEntities = [];
        const errors = [];
        console.log('🚀 Starting Import Process...');
        console.log(`📊 Received ${rows.length} rows.`);
        const headerMap = headers.reduce((acc, h, i) => {
            const cleanHeader = h
                .replace(/^\uFEFF/, '')
                .replace(/['"]+/g, '')
                .replace(/[\r\n]+/g, '')
                .trim()
                .toLowerCase();
            acc[cleanHeader] = i;
            return acc;
        }, {});
        const getValue = (row, colName) => {
            const index = headerMap[colName.toLowerCase()];
            if (index === undefined)
                return null;
            const val = row[index];
            return val ? String(val).trim() : '';
        };
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row.some(cell => cell && String(cell).trim() !== ''))
                continue;
            try {
                const instLast = getValue(row, 'instructor_lastname');
                const instFirst = getValue(row, 'instructor_firstname');
                if (!instLast || !instFirst) {
                    throw new Error('Missing Instructor Name');
                }
                const instructor = await this.employeeRepo.findOne({
                    where: {
                        lastname: (0, typeorm_2.Like)(instLast),
                        firstname: (0, typeorm_2.Like)(instFirst),
                    },
                });
                if (!instructor) {
                    console.warn(`Instructor Not Found: "${instFirst} ${instLast}" (Row ${i + 1})`);
                    throw new Error(`Instructor not found in DB: ${instFirst} ${instLast}`);
                }
                const studid = getValue(row, 'studid');
                const subjcode = getValue(row, 'subjcode');
                const sy = getValue(row, 'sy');
                const sem = getValue(row, 'sem');
                if (!studid || !subjcode || !sy || !sem) {
                    throw new Error('Missing key fields');
                }
                const existing = await this.masterlistRepo.findOne({
                    where: { studid, subjcode, sy, sem },
                });
                if (existing) {
                    throw new Error('Duplicate Record');
                }
                const entity = new masterlist_entity_1.Masterlist();
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
            }
            catch (error) {
                errors.push({
                    row: i + 1,
                    reason: error.message,
                    data: row,
                });
            }
        }
        let savedCount = 0;
        if (successEntities.length > 0) {
            console.log(`💾 Saving ${successEntities.length} records in batches...`);
            const BATCH_SIZE = 500;
            for (let i = 0; i < successEntities.length; i += BATCH_SIZE) {
                const batch = successEntities.slice(i, i + BATCH_SIZE);
                console.log(`   ...Processing batch ${Math.ceil((i + 1) / BATCH_SIZE)} (${batch.length} rows)`);
                try {
                    await this.masterlistRepo.save(batch);
                    savedCount += batch.length;
                }
                catch (dbError) {
                    console.error('❌ Batch Save Failed:', dbError.message);
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
            successCount: savedCount,
            failedCount: errors.length + (successEntities.length - savedCount),
            errors: errors,
        };
    }
    async findByYearAndSem(sy, sem, user) {
        const query = this.masterlistRepo
            .createQueryBuilder('masterlist')
            .leftJoinAndSelect('masterlist.employee', 'employee')
            .leftJoinAndSelect('masterlist.rawScores', 'rawScores')
            .leftJoinAndSelect('rawScores.activity', 'activity')
            .leftJoinAndSelect('masterlist.finalGrade', 'finalGrade');
        if (sy && sy !== 'undefined' && sy !== 'null') {
            query.andWhere('masterlist.sy = :sy', { sy });
        }
        if (sem && sem !== 'undefined' && sem !== 'null') {
            query.andWhere('masterlist.sem = :sem', { sem });
        }
        const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN';
        if (!isAdmin) {
            query.andWhere('masterlist.empid = :empid', { empid: user.empid });
        }
        return await query.getMany();
    }
    async findBySYSemAndEmployee(sy, sem, empid) {
        return await this.masterlistRepo.find({
            where: { sy, sem, employee: { empid } },
            relations: ['employee'],
        });
    }
    async findBySYandSem(sy, sem) {
        return await this.masterlistRepo.find({
            where: { sy, sem },
            relations: ['employee'],
        });
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