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
exports.Employee = exports.EmpRole = void 0;
const typeorm_1 = require("typeorm");
const masterlist_entity_1 = require("../masterlist/masterlist.entity");
const course_outcome_entity_1 = require("../obe/course-outcome.entity");
const tos_weight_entity_1 = require("../obe/tos-weight.entity");
var EmpRole;
(function (EmpRole) {
    EmpRole["ADMIN"] = "Admin";
    EmpRole["INSTRUCTOR"] = "Instructor";
    EmpRole["DEAN"] = "Dean";
    EmpRole["CHAIRPERSON"] = "Chairperson";
    EmpRole["GUIDANCE"] = "Guidance";
})(EmpRole || (exports.EmpRole = EmpRole = {}));
let Employee = class Employee {
};
exports.Employee = Employee;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Employee.prototype, "empid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EmpRole,
        default: EmpRole.INSTRUCTOR,
    }),
    __metadata("design:type", String)
], Employee.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "lastname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "firstname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: '' }),
    __metadata("design:type", String)
], Employee.prototype, "middlename", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 5, default: '' }),
    __metadata("design:type", String)
], Employee.prototype, "extname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Employee.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Employee.prototype, "isactive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Employee.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => masterlist_entity_1.Masterlist, (masterlist) => masterlist.employee),
    __metadata("design:type", Array)
], Employee.prototype, "masterlists", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => course_outcome_entity_1.CourseOutcome, (co) => co.employee),
    __metadata("design:type", Array)
], Employee.prototype, "courseOutcomes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tos_weight_entity_1.TosWeight, (tw) => tw.employee),
    __metadata("design:type", Array)
], Employee.prototype, "tosWeights", void 0);
exports.Employee = Employee = __decorate([
    (0, typeorm_1.Entity)('employee')
], Employee);
//# sourceMappingURL=employee.entity.js.map