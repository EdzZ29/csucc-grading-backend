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
exports.ObeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_outcome_entity_1 = require("./course-outcome.entity");
const tos_weight_entity_1 = require("./tos-weight.entity");
const raw_score_entity_1 = require("./raw-score.entity");
const final_grade_entity_1 = require("./final-grade.entity");
const class_activity_entity_1 = require("./class-activity.entity");
const assessment_type_entity_1 = require("./assessment-type.entity");
const transmutation_table_1 = require("../shared/transmutation-table");
let ObeService = class ObeService {
    constructor(coRepo, tosRepo, scoreRepo, gradeRepo, activityRepo, assessmentTypeRepo) {
        this.coRepo = coRepo;
        this.tosRepo = tosRepo;
        this.scoreRepo = scoreRepo;
        this.gradeRepo = gradeRepo;
        this.activityRepo = activityRepo;
        this.assessmentTypeRepo = assessmentTypeRepo;
    }
    async findAllAssessmentTypes() {
        return this.assessmentTypeRepo.find({ order: { name: 'ASC' } });
    }
    async calculateStudentFinalGrade(masterlistId) {
        const scores = await this.scoreRepo.find({
            where: { masterlist_id: masterlistId },
            relations: ['activity'],
        });
        if (!(scores === null || scores === void 0 ? void 0 : scores.length))
            throw new common_1.NotFoundException('No scores found for student');
        const { empid, subjcode } = scores[0].activity;
        const weights = await this.tosRepo.find({ where: { empid, subjcode } });
        let totalWeightedScore = 0;
        for (const weight of weights) {
            const relevant = scores.filter((s) => s.activity.co_id === weight.co_id && s.activity.type_id === weight.type_id);
            if (relevant.length > 0) {
                const sumObtained = relevant.reduce((a, c) => a + c.score, 0);
                const sumMax = relevant.reduce((a, c) => a + c.activity.max_score, 0);
                totalWeightedScore += (sumObtained / sumMax) * weight.weight_percentage;
            }
        }
        let fg = await this.gradeRepo.findOne({ where: { masterlist_id: masterlistId } });
        if (!fg)
            fg = this.gradeRepo.create({ masterlist_id: masterlistId });
        fg.final_weighted_score = Math.round(totalWeightedScore * 100) / 100;
        fg.final_numerical_grade = (0, transmutation_table_1.transmuteGrade)(fg.final_weighted_score);
        fg.remarks = (0, transmutation_table_1.deriveRemarks)(fg.final_numerical_grade);
        return this.gradeRepo.save(fg);
    }
    async createCourseOutcome(data) {
        return this.coRepo.save(this.coRepo.create(data));
    }
    async saveTosWeights(weights) {
        return this.tosRepo.save(weights);
    }
    async createActivity(data) {
        return this.activityRepo.save(this.activityRepo.create(data));
    }
    async recordRawScore(data) {
        return this.scoreRepo.save(this.scoreRepo.create(data));
    }
    async getFullSyllabus(empid, subjcode, section) {
        const results = await this.coRepo.find({
            where: { empid, subjcode, section },
            relations: ['tosWeights'],
            order: { co_code: 'ASC' },
        });
        if (!(results === null || results === void 0 ? void 0 : results.length))
            return [];
        const uniqueMap = new Map();
        for (const co of results) {
            if (!uniqueMap.has(co.co_id))
                uniqueMap.set(co.co_id, co);
        }
        return Array.from(uniqueMap.values());
    }
    async createAssessmentType(data) {
        return this.assessmentTypeRepo.save(this.assessmentTypeRepo.create({ name: data.name, code: data.code.toUpperCase() }));
    }
    async saveBatchSyllabus(payload) {
        var _a;
        const normalizedSection = (_a = payload.section) === null || _a === void 0 ? void 0 : _a.trim().replace(/\s+/g, ' ');
        const existingCOs = await this.coRepo.find({
            where: { empid: payload.empid, subjcode: payload.subjcode, section: normalizedSection },
            select: ['co_id'],
        });
        const existingCoIds = existingCOs.map((co) => co.co_id);
        if (existingCoIds.length > 0)
            await this.tosRepo.delete({ co_id: (0, typeorm_2.In)(existingCoIds) });
        await this.coRepo.delete({ empid: payload.empid, subjcode: payload.subjcode, section: normalizedSection });
        const createdOutcomes = await Promise.all(payload.outcomes.map((co) => this.coRepo.save(this.coRepo.create({
            co_code: co.co_code, description: co.description,
            subjcode: payload.subjcode, section: normalizedSection,
            empid: payload.empid, sy: payload.sy, sem: payload.sem,
        }))));
        const outcomeMap = createdOutcomes.reduce((acc, co) => {
            acc[co.co_code] = co.co_id;
            return acc;
        }, {});
        const weightsToSave = payload.weights.map((w) => ({
            empid: payload.empid, subjcode: payload.subjcode, section: normalizedSection,
            co_id: outcomeMap[w.co_code], type_id: w.type_id,
            weight_percentage: w.weight_percentage,
        }));
        return this.tosRepo.save(weightsToSave);
    }
};
exports.ObeService = ObeService;
exports.ObeService = ObeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_outcome_entity_1.CourseOutcome)),
    __param(1, (0, typeorm_1.InjectRepository)(tos_weight_entity_1.TosWeight)),
    __param(2, (0, typeorm_1.InjectRepository)(raw_score_entity_1.RawScore)),
    __param(3, (0, typeorm_1.InjectRepository)(final_grade_entity_1.FinalGrade)),
    __param(4, (0, typeorm_1.InjectRepository)(class_activity_entity_1.ClassActivity)),
    __param(5, (0, typeorm_1.InjectRepository)(assessment_type_entity_1.AssessmentType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ObeService);
//# sourceMappingURL=obe.service.js.map