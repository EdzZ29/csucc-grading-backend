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
exports.ClassActivity = void 0;
const typeorm_1 = require("typeorm");
const course_outcome_entity_1 = require("./course-outcome.entity");
const assessment_type_entity_1 = require("./assessment-type.entity");
let ClassActivity = class ClassActivity {
};
exports.ClassActivity = ClassActivity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClassActivity.prototype, "activity_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ClassActivity.prototype, "empid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ClassActivity.prototype, "subjcode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ClassActivity.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClassActivity.prototype, "sy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClassActivity.prototype, "sem", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ClassActivity.prototype, "co_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ClassActivity.prototype, "type_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], ClassActivity.prototype, "grading_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ClassActivity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ClassActivity.prototype, "activity_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ClassActivity.prototype, "max_score", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_outcome_entity_1.CourseOutcome, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'co_id' }),
    __metadata("design:type", course_outcome_entity_1.CourseOutcome)
], ClassActivity.prototype, "courseOutcome", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => assessment_type_entity_1.AssessmentType, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'type_id' }),
    __metadata("design:type", assessment_type_entity_1.AssessmentType)
], ClassActivity.prototype, "assessmentType", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('RawScore', 'activity'),
    __metadata("design:type", Object)
], ClassActivity.prototype, "scores", void 0);
exports.ClassActivity = ClassActivity = __decorate([
    (0, typeorm_1.Entity)('class_activity')
], ClassActivity);
//# sourceMappingURL=class-activity.entity.js.map