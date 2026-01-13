"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const prediction_service_1 = require("./prediction.service");
const prediction_controller_1 = require("./prediction.controller");
const masterlist_entity_1 = require("../masterlist/masterlist.entity");
const auth_guard_1 = require("../auth/auth.guard");
const jwt_1 = require("@nestjs/jwt");
const raw_score_entity_1 = require("../raw-score/raw-score.entity");
const final_grade_entity_1 = require("../final-grade/final-grade.entity");
let PredictionModule = class PredictionModule {
};
exports.PredictionModule = PredictionModule;
exports.PredictionModule = PredictionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            typeorm_1.TypeOrmModule.forFeature([masterlist_entity_1.Masterlist, raw_score_entity_1.RawScore, final_grade_entity_1.FinalGrade]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'secret',
                signOptions: { expiresIn: '1d' },
            }),
        ],
        controllers: [prediction_controller_1.PredictionController],
        providers: [prediction_service_1.PredictionService, auth_guard_1.AuthGuard],
    })
], PredictionModule);
//# sourceMappingURL=prediction.module.js.map