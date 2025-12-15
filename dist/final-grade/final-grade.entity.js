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
exports.FinalGrade = void 0;
const typeorm_1 = require("typeorm");
const masterlist_entity_1 = require("../masterlist/masterlist.entity");
let FinalGrade = class FinalGrade {
};
exports.FinalGrade = FinalGrade;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FinalGrade.prototype, "final_grade_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'masterlist_id' }),
    __metadata("design:type", Number)
], FinalGrade.prototype, "masterlist_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => masterlist_entity_1.Masterlist),
    (0, typeorm_1.JoinColumn)({ name: 'masterlist_id' }),
    __metadata("design:type", masterlist_entity_1.Masterlist)
], FinalGrade.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], FinalGrade.prototype, "final_semestral_grade", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FinalGrade.prototype, "remarks", void 0);
exports.FinalGrade = FinalGrade = __decorate([
    (0, typeorm_1.Entity)('final_grade')
], FinalGrade);
//# sourceMappingURL=final-grade.entity.js.map