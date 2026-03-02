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
exports.CourseOutcome = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../employee/employee.entity");
const tos_weight_entity_1 = require("./tos-weight.entity");
let CourseOutcome = class CourseOutcome {
};
exports.CourseOutcome = CourseOutcome;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CourseOutcome.prototype, "co_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CourseOutcome.prototype, "empid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CourseOutcome.prototype, "subjcode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CourseOutcome.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CourseOutcome.prototype, "sy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CourseOutcome.prototype, "sem", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CourseOutcome.prototype, "co_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], CourseOutcome.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, (emp) => emp.courseOutcomes),
    (0, typeorm_1.JoinColumn)({ name: 'empid' }),
    __metadata("design:type", employee_entity_1.Employee)
], CourseOutcome.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tos_weight_entity_1.TosWeight, (tw) => tw.courseOutcome),
    __metadata("design:type", Array)
], CourseOutcome.prototype, "tosWeights", void 0);
exports.CourseOutcome = CourseOutcome = __decorate([
    (0, typeorm_1.Entity)('course_outcomes')
], CourseOutcome);
//# sourceMappingURL=course-outcome.entity.js.map