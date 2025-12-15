"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeWeightModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const grade_weight_entity_1 = require("./grade-weight.entity");
const grade_weight_service_1 = require("./grade-weight.service");
const grade_weight_controller_1 = require("./grade-weight.controller");
const employee_entity_1 = require("../employee/employee.entity");
let GradeWeightModule = class GradeWeightModule {
};
exports.GradeWeightModule = GradeWeightModule;
exports.GradeWeightModule = GradeWeightModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([grade_weight_entity_1.GradeWeight, employee_entity_1.Employee])],
        controllers: [grade_weight_controller_1.GradeWeightController],
        providers: [grade_weight_service_1.GradeWeightService],
        exports: [grade_weight_service_1.GradeWeightService],
    })
], GradeWeightModule);
//# sourceMappingURL=grade-weight.module.js.map