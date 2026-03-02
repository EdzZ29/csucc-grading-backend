"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const obe_service_1 = require("./obe.service");
const obe_controller_1 = require("./obe.controller");
const jwt_1 = require("@nestjs/jwt");
const course_outcome_entity_1 = require("./course-outcome.entity");
const tos_weight_entity_1 = require("./tos-weight.entity");
const raw_score_entity_1 = require("./raw-score.entity");
const final_grade_entity_1 = require("./final-grade.entity");
const class_activity_entity_1 = require("./class-activity.entity");
const assessment_type_entity_1 = require("./assessment-type.entity");
let ObeModule = class ObeModule {
};
exports.ObeModule = ObeModule;
exports.ObeModule = ObeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                course_outcome_entity_1.CourseOutcome,
                tos_weight_entity_1.TosWeight,
                raw_score_entity_1.RawScore,
                final_grade_entity_1.FinalGrade,
                class_activity_entity_1.ClassActivity,
                assessment_type_entity_1.AssessmentType,
            ]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'secretKey',
                signOptions: { expiresIn: '1d' },
            }),
        ],
        controllers: [obe_controller_1.ObeController],
        providers: [obe_service_1.ObeService],
        exports: [obe_service_1.ObeService],
    })
], ObeModule);
//# sourceMappingURL=obe.module.js.map