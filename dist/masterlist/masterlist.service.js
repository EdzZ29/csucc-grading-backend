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
let MasterlistService = class MasterlistService {
    constructor(masterlistRepo) {
        this.masterlistRepo = masterlistRepo;
    }
    async findAllForUser(user) {
        if (user.role === 'Admin') {
            return this.masterlistRepo.find({ relations: ['employee'] });
        }
        return this.masterlistRepo.find({
            where: { employee: { employee_id: user.employee_id } },
            relations: ['employee'],
        });
    }
    async findOneForUser(id, user) {
        var _a;
        const record = await this.masterlistRepo.findOne({
            where: { masterlist_id: id },
            relations: ['employee'],
        });
        if (!record)
            throw new common_1.NotFoundException(`Masterlist ${id} not found`);
        if (user.role !== 'Admin' && ((_a = record.employee) === null || _a === void 0 ? void 0 : _a.employee_id) !== user.employee_id) {
            throw new common_1.NotFoundException(`You do not have access to this record`);
        }
        return record;
    }
    async importCsv(data) {
        const { headers, rows } = data;
        const columnMap = {
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
        const entities = rows
            .filter((row) => row.some((cell) => cell && cell.trim() !== ''))
            .map((row) => {
            const obj = {};
            headers.forEach((h, i) => {
                if (h === 'employee_id' && row[i]) {
                    obj.employee = { employee_id: Number(row[i]) };
                }
                else {
                    const col = columnMap[h];
                    if (col && col !== 'employee')
                        obj[col] = row[i];
                }
            });
            return this.masterlistRepo.create(obj);
        });
        return await this.masterlistRepo.save(entities);
    }
    async findByYearAndSem(sy, sem, user) {
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
            query.andWhere('employee.employee_id = :employee_id', {
                employee_id: user.employee_id,
            });
        }
        const result = await query.getMany();
        console.log('Query result:', result);
        return result;
    }
    async findBySYSemAndEmployee(sy, sem, employee_id) {
        const query = this.masterlistRepo
            .createQueryBuilder('masterlist')
            .leftJoinAndSelect('masterlist.employee', 'employee')
            .where('masterlist.sy = :sy', { sy })
            .andWhere('masterlist.sem = :sem', { sem })
            .andWhere('masterlist.employee_id = :employee_id', { employee_id });
        return await query.getMany();
    }
    async findBySYandSem(sy, sem) {
        const query = this.masterlistRepo
            .createQueryBuilder('masterlist')
            .leftJoinAndSelect('masterlist.employee', 'employee')
            .where('masterlist.sy = :sy', { sy })
            .andWhere('masterlist.sem = :sem', { sem });
        return await query.getMany();
    }
};
exports.MasterlistService = MasterlistService;
exports.MasterlistService = MasterlistService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(masterlist_entity_1.Masterlist)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MasterlistService);
//# sourceMappingURL=masterlist.service.js.map