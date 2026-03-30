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
exports.ObeController = void 0;
const common_1 = require("@nestjs/common");
const obe_service_1 = require("./obe.service");
let ObeController = class ObeController {
    constructor(obeService) {
        this.obeService = obeService;
    }
    async getTypes(req) {
        const empid = req.query.empid || (req.user && req.user.empid);
        return await this.obeService.findAllAssessmentTypes(empid);
    }
    async batchSave(payload, req) {
        const empid = payload.empid || (req.user && req.user.empid);
        console.log('[OBE] batchSave called with empid:', empid, 'subjcode:', payload.subjcode, 'section:', payload.section);
        console.log('[OBE] outcomes:', JSON.stringify(payload.outcomes));
        console.log('[OBE] weights:', JSON.stringify(payload.weights));
        if (!empid) {
            throw new common_1.InternalServerErrorException('User identification failed — no empid in request body or auth token');
        }
        try {
            const result = await this.obeService.saveBatchSyllabus(Object.assign(Object.assign({}, payload), { empid }));
            console.log('[OBE] batchSave SUCCESS');
            return result;
        }
        catch (error) {
            console.error('[OBE] batchSave FAILED:', error.message);
            console.error('[OBE] Full error:', error);
            throw new common_1.InternalServerErrorException(error.message || 'Failed to save syllabus');
        }
    }
    async addType(data) {
        return await this.obeService.createAssessmentType(data);
    }
    async createCO(data) {
        return await this.obeService.createCourseOutcome(data);
    }
    async setWeights(weights) {
        return await this.obeService.saveTosWeights(weights);
    }
    async getSyllabus(empid, subjcode, section) {
        console.log(`Fetching Syllabus: Emp:${empid}, Subj:${subjcode}, Sect:${section}`);
        if (!empid || !subjcode || !section) {
            throw new common_1.InternalServerErrorException('Missing required route parameters');
        }
        return await this.obeService.getFullSyllabus(empid, subjcode, section);
    }
    async createActivity(data) {
        return await this.obeService.createActivity(data);
    }
    async recordScore(data) {
        return await this.obeService.recordRawScore(data);
    }
    async calculateFinal(masterlistId) {
        return await this.obeService.calculateStudentFinalGrade(masterlistId);
    }
};
exports.ObeController = ObeController;
__decorate([
    (0, common_1.Get)('assessment-types'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObeController.prototype, "getTypes", null);
__decorate([
    (0, common_1.Post)('course-outcome/batch'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ObeController.prototype, "batchSave", null);
__decorate([
    (0, common_1.Post)('assessment-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObeController.prototype, "addType", null);
__decorate([
    (0, common_1.Post)('course-outcome'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObeController.prototype, "createCO", null);
__decorate([
    (0, common_1.Post)('tos-weights'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ObeController.prototype, "setWeights", null);
__decorate([
    (0, common_1.Get)('syllabus/:empid/:subjcode/:section'),
    __param(0, (0, common_1.Param)('empid', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('subjcode')),
    __param(2, (0, common_1.Param)('section')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], ObeController.prototype, "getSyllabus", null);
__decorate([
    (0, common_1.Post)('activity'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObeController.prototype, "createActivity", null);
__decorate([
    (0, common_1.Post)('raw-score'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObeController.prototype, "recordScore", null);
__decorate([
    (0, common_1.Patch)('calculate-grade/:masterlistId'),
    __param(0, (0, common_1.Param)('masterlistId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ObeController.prototype, "calculateFinal", null);
exports.ObeController = ObeController = __decorate([
    (0, common_1.Controller)('obe'),
    __metadata("design:paramtypes", [obe_service_1.ObeService])
], ObeController);
//# sourceMappingURL=obe.controller.js.map