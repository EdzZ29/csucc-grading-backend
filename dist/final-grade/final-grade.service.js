"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalGradeService = void 0;
const common_1 = require("@nestjs/common");
let FinalGradeService = class FinalGradeService {
    create(createFinalGradeDto) {
        return 'This action adds a new finalGrade';
    }
    findAll() {
        return `This action returns all finalGrade`;
    }
    findOne(id) {
        return `This action returns a #${id} finalGrade`;
    }
    update(id, updateFinalGradeDto) {
        return `This action updates a #${id} finalGrade`;
    }
    remove(id) {
        return `This action removes a #${id} finalGrade`;
    }
};
exports.FinalGradeService = FinalGradeService;
exports.FinalGradeService = FinalGradeService = __decorate([
    (0, common_1.Injectable)()
], FinalGradeService);
//# sourceMappingURL=final-grade.service.js.map