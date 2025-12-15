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
exports.Masterlist = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../employee/employee.entity");
let Masterlist = class Masterlist {
};
exports.Masterlist = Masterlist;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'masterlist_id' }),
    __metadata("design:type", Number)
], Masterlist.prototype, "masterlist_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'empid' }),
    __metadata("design:type", Number)
], Masterlist.prototype, "empid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: '' }),
    __metadata("design:type", String)
], Masterlist.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sy', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Masterlist.prototype, "sy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sem', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Masterlist.prototype, "sem", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'subjcode',
        type: 'varchar',
        length: 50,
        default: '',
        nullable: true,
    }),
    __metadata("design:type", String)
], Masterlist.prototype, "subjcode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'section',
        type: 'varchar',
        length: 50,
        default: '',
        nullable: true,
    }),
    __metadata("design:type", String)
], Masterlist.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'studid', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Masterlist.prototype, "studid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'studlastname', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Masterlist.prototype, "studlastname", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'studfirstname', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Masterlist.prototype, "studfirstname", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'studmiddlename', type: 'varchar', length: 100, default: '' }),
    __metadata("design:type", String)
], Masterlist.prototype, "studmiddlename", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'studextname', type: 'varchar', length: 20, default: '' }),
    __metadata("design:type", String)
], Masterlist.prototype, "studextname", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'studmajor', type: 'varchar', length: 100, default: '' }),
    __metadata("design:type", String)
], Masterlist.prototype, "studmajor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'studlevel', type: 'integer' }),
    __metadata("design:type", Number)
], Masterlist.prototype, "studlevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department', type: 'varchar', length: 100, default: '' }),
    __metadata("design:type", String)
], Masterlist.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'college', type: 'varchar', length: 100, default: '' }),
    __metadata("design:type", String)
], Masterlist.prototype, "college", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Masterlist.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'empid' }),
    __metadata("design:type", employee_entity_1.Employee)
], Masterlist.prototype, "employee", void 0);
exports.Masterlist = Masterlist = __decorate([
    (0, typeorm_1.Entity)('masterlist')
], Masterlist);
//# sourceMappingURL=masterlist.entity.js.map