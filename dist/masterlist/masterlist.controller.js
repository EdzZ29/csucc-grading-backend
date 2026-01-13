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
exports.MasterlistController = void 0;
const common_1 = require("@nestjs/common");
const masterlist_service_1 = require("./masterlist.service");
const auth_guard_1 = require("../auth/auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const import_masterlist_dto_1 = require("./dtos/import-masterlist.dto");
let MasterlistController = class MasterlistController {
    constructor(masterlistService) {
        this.masterlistService = masterlistService;
    }
    async getUniqueSubjectsCount() {
        const count = await this.masterlistService.getUniqueSubjectsCount();
        return { count };
    }
    async findAll(req) {
        const user = req.user;
        return this.masterlistService.findAllForUser(user);
    }
    async findOne(id, req) {
        const user = req.user;
        return this.masterlistService.findOneForUser(id, user);
    }
    async importCsv(importDto) {
        console.log('Processing CSV Import...');
        return this.masterlistService.importCsv(importDto);
    }
    async findByYearAndSem(sy, sem, req) {
        const user = req.user;
        return this.masterlistService.findByYearAndSem(sy, sem, user);
    }
    async findBySYSEMQuery(sy, sem, employeeId) {
        if (employeeId) {
            return this.masterlistService.findBySYSemAndEmployee(sy, sem, Number(employeeId));
        }
        else {
            return this.masterlistService.findBySYandSem(sy, sem);
        }
    }
};
exports.MasterlistController = MasterlistController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('count/unique-subjects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterlistController.prototype, "getUniqueSubjectsCount", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MasterlistController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MasterlistController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('import'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_masterlist_dto_1.ImportMasterlistDto]),
    __metadata("design:returntype", Promise)
], MasterlistController.prototype, "importCsv", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Get)('filter/:sy/:sem'),
    __param(0, (0, common_1.Param)('sy')),
    __param(1, (0, common_1.Param)('sem')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MasterlistController.prototype, "findByYearAndSem", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('filter/:sy/:sem/query'),
    __param(0, (0, common_1.Param)('sy')),
    __param(1, (0, common_1.Param)('sem')),
    __param(2, (0, common_1.Query)('empid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MasterlistController.prototype, "findBySYSEMQuery", null);
exports.MasterlistController = MasterlistController = __decorate([
    (0, common_1.Controller)('masterlist'),
    __metadata("design:paramtypes", [masterlist_service_1.MasterlistService])
], MasterlistController);
//# sourceMappingURL=masterlist.controller.js.map