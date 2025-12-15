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
exports.FinalGradeController = void 0;
const common_1 = require("@nestjs/common");
const final_grade_service_1 = require("./final-grade.service");
let FinalGradeController = class FinalGradeController {
    constructor(finalGradeService) {
        this.finalGradeService = finalGradeService;
    }
    create(createFinalGradeDto) {
        return this.finalGradeService.create(createFinalGradeDto);
    }
    findAll() {
        return this.finalGradeService.findAll();
    }
    findOne(id) {
        return this.finalGradeService.findOne(+id);
    }
    update(id, updateFinalGradeDto) {
        return this.finalGradeService.update(+id, updateFinalGradeDto);
    }
    remove(id) {
        return this.finalGradeService.remove(+id);
    }
};
exports.FinalGradeController = FinalGradeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinalGradeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinalGradeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinalGradeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinalGradeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinalGradeController.prototype, "remove", null);
exports.FinalGradeController = FinalGradeController = __decorate([
    (0, common_1.Controller)('final-grade'),
    __metadata("design:paramtypes", [final_grade_service_1.FinalGradeService])
], FinalGradeController);
//# sourceMappingURL=final-grade.controller.js.map