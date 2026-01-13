"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalGradeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const final_grade_entity_1 = require("./final-grade.entity");
const final_grade_service_1 = require("./final-grade.service");
const final_grade_controller_1 = require("./final-grade.controller");
let FinalGradeModule = class FinalGradeModule {
};
exports.FinalGradeModule = FinalGradeModule;
exports.FinalGradeModule = FinalGradeModule = __decorate([
    (0, common_1.Module)({
        exports: [typeorm_1.TypeOrmModule],
        imports: [typeorm_1.TypeOrmModule.forFeature([final_grade_entity_1.FinalGrade])],
        controllers: [final_grade_controller_1.FinalGradeController],
        providers: [final_grade_service_1.FinalGradeService],
    })
], FinalGradeModule);
//# sourceMappingURL=final-grade.module.js.map