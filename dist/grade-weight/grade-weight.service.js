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
exports.GradeWeightService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const grade_weight_entity_1 = require("./grade-weight.entity");
const employee_entity_1 = require("../employee/employee.entity");
let GradeWeightService = class GradeWeightService {
    constructor(repo, employeeRepo) {
        this.repo = repo;
        this.employeeRepo = employeeRepo;
    }
    async findAll() {
        return this.repo.find({
            relations: ['employee'],
        });
    }
    async saveWeights(data) {
        const { modified_by_empid, weights } = data;
        let adminRef = null;
        if (modified_by_empid) {
            adminRef = { empid: modified_by_empid };
        }
        const entitiesToSave = [];
        for (const [system, categories] of Object.entries(weights)) {
            for (const [category, details] of Object.entries(categories)) {
                let entity = await this.repo.findOne({
                    where: { grading_type: system, category: category },
                });
                if (!entity) {
                    entity = new grade_weight_entity_1.GradeWeight();
                    entity.grading_type = system;
                    entity.category = category;
                }
                entity.weight_percentage = Number(details.percentage) / 100;
                entity.employee = adminRef;
                entitiesToSave.push(entity);
            }
        }
        return this.repo.save(entitiesToSave);
    }
};
exports.GradeWeightService = GradeWeightService;
exports.GradeWeightService = GradeWeightService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(grade_weight_entity_1.GradeWeight)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GradeWeightService);
//# sourceMappingURL=grade-weight.service.js.map