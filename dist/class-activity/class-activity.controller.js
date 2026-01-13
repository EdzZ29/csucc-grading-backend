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
exports.ClassActivityController = void 0;
const common_1 = require("@nestjs/common");
const class_activity_service_1 = require("./class-activity.service");
const save_gradebook_dto_1 = require("./dto/save-gradebook.dto");
let ClassActivityController = class ClassActivityController {
    constructor(service) {
        this.service = service;
    }
    getGradebook(subjcode, section, category) {
        return this.service.getGradebook(subjcode, section, category);
    }
    saveGradebook(dto) {
        return this.service.saveGradebook(dto);
    }
    saveFinalGrades(dto) {
        return this.service.saveFinalGradesOnly(dto);
    }
    async delete(id) {
        return this.service.deleteActivity(id);
    }
};
exports.ClassActivityController = ClassActivityController;
__decorate([
    (0, common_1.Get)('gradebook/:subjcode/:section/:category'),
    __param(0, (0, common_1.Param)('subjcode')),
    __param(1, (0, common_1.Param)('section')),
    __param(2, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ClassActivityController.prototype, "getGradebook", null);
__decorate([
    (0, common_1.Post)('save-gradebook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_gradebook_dto_1.SaveGradebookDto]),
    __metadata("design:returntype", void 0)
], ClassActivityController.prototype, "saveGradebook", null);
__decorate([
    (0, common_1.Post)('save-final-grades'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_gradebook_dto_1.SaveGradebookDto]),
    __metadata("design:returntype", void 0)
], ClassActivityController.prototype, "saveFinalGrades", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClassActivityController.prototype, "delete", null);
exports.ClassActivityController = ClassActivityController = __decorate([
    (0, common_1.Controller)('class-activity'),
    __metadata("design:paramtypes", [class_activity_service_1.ClassActivityService])
], ClassActivityController);
//# sourceMappingURL=class-activity.controller.js.map