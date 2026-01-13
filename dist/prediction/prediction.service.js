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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PredictionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const raw_score_entity_1 = require("../raw-score/raw-score.entity");
let PredictionService = PredictionService_1 = class PredictionService {
    constructor(httpService, rawScoreRepo) {
        this.httpService = httpService;
        this.rawScoreRepo = rawScoreRepo;
        this.logger = new common_1.Logger(PredictionService_1.name);
    }
    async trainModel() {
        this.logger.log('Fetching training data...');
        const rawData = await this.rawScoreRepo
            .createQueryBuilder('rs')
            .leftJoin('rs.activity', 'act')
            .leftJoin('rs.student', 'student')
            .leftJoin('student.finalGrade', 'fg')
            .select([
            "AVG(CASE WHEN UPPER(act.category) LIKE '%WRITTEN%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS written_avg",
            "AVG(CASE WHEN UPPER(act.category) LIKE '%PERFORMANCE%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS perf_avg",
            "AVG(CASE WHEN UPPER(act.category) LIKE '%MIDTERM%' OR UPPER(act.category) LIKE '%EXAM%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS midterm_score",
            'fg.remarks AS remarks',
            'fg.final_numerical_grade AS final_grade',
        ])
            .where('fg.remarks IS NOT NULL')
            .groupBy('student.masterlist_id')
            .addGroupBy('fg.remarks')
            .addGroupBy('fg.final_numerical_grade')
            .getRawMany();
        const trainingPayload = rawData.map((row) => {
            const grade = parseFloat(row.final_grade) || 0;
            let risk = 0;
            if (grade > 3.0)
                risk = 2;
            else if (grade > 2.5)
                risk = 1;
            else
                risk = 0;
            return {
                written_avg: parseFloat(row.written_avg) || 0,
                perf_avg: parseFloat(row.perf_avg) || 0,
                midterm_score: parseFloat(row.midterm_score) || 0,
                is_passed: row.remarks && row.remarks.toUpperCase() === 'PASSED' ? 1 : 0,
                risk_level: risk,
            };
        });
        if (trainingPayload.length === 0)
            throw new common_1.InternalServerErrorException('No data to train.');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('http://127.0.0.1:5000/train', trainingPayload));
            return response.data;
        }
        catch (error) {
            this.logger.error('Training Failed');
            throw new common_1.InternalServerErrorException('Failed to train AI model');
        }
    }
    async predictRisk(masterlistId) {
        const studentData = await this.rawScoreRepo
            .createQueryBuilder('rs')
            .leftJoin('rs.activity', 'act')
            .leftJoin('rs.student', 'student')
            .select([
            "AVG(CASE WHEN UPPER(act.category) LIKE '%WRITTEN%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS written_avg",
            "AVG(CASE WHEN UPPER(act.category) LIKE '%PERFORMANCE%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS perf_avg",
            "AVG(CASE WHEN UPPER(act.category) LIKE '%MIDTERM%' OR UPPER(act.category) LIKE '%EXAM%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS midterm_score",
        ])
            .where('student.masterlist_id = :id', { id: masterlistId })
            .getRawOne();
        const payload = {
            written_avg: parseFloat(studentData.written_avg) || 0,
            perf_avg: parseFloat(studentData.perf_avg) || 0,
            midterm_score: parseFloat(studentData.midterm_score) || 0,
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('http://127.0.0.1:5000/predict', payload));
            return response.data;
        }
        catch (error) {
            return { binary_fail_prob: 0, multinomial_status: 'Unknown' };
        }
    }
};
exports.PredictionService = PredictionService;
exports.PredictionService = PredictionService = PredictionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(raw_score_entity_1.RawScore)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        typeorm_2.Repository])
], PredictionService);
//# sourceMappingURL=prediction.service.js.map