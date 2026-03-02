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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TosWeight = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../employee/employee.entity");
const course_outcome_entity_1 = require("./course-outcome.entity");
const assessment_type_entity_1 = require("./assessment-type.entity");
let TosWeight = class TosWeight {
};
exports.TosWeight = TosWeight;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TosWeight.prototype, "tos_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TosWeight.prototype, "empid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], TosWeight.prototype, "subjcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], TosWeight.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TosWeight.prototype, "co_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TosWeight.prototype, "type_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], TosWeight.prototype, "weight_percentage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'empid' }),
    __metadata("design:type", employee_entity_1.Employee)
], TosWeight.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_outcome_entity_1.CourseOutcome),
    (0, typeorm_1.JoinColumn)({ name: 'co_id' }),
    __metadata("design:type", course_outcome_entity_1.CourseOutcome)
], TosWeight.prototype, "courseOutcome", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => assessment_type_entity_1.AssessmentType),
    (0, typeorm_1.JoinColumn)({ name: 'type_id' }),
    __metadata("design:type", assessment_type_entity_1.AssessmentType)
], TosWeight.prototype, "assessmentType", void 0);
exports.TosWeight = TosWeight = __decorate([
    (0, typeorm_1.Entity)('tos_weights')
], TosWeight);
//# sourceMappingURL=tos-weight.entity.js.map