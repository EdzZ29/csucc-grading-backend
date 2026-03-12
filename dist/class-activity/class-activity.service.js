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
var ClassActivityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassActivityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_activity_entity_1 = require("../obe/class-activity.entity");
const raw_score_entity_1 = require("../obe/raw-score.entity");
const masterlist_entity_1 = require("../masterlist/masterlist.entity");
const final_grade_entity_1 = require("../obe/final-grade.entity");
const course_outcome_entity_1 = require("../obe/course-outcome.entity");
const tos_weight_entity_1 = require("../obe/tos-weight.entity");
const assessment_type_entity_1 = require("../obe/assessment-type.entity");
const transmutation_table_1 = require("../shared/transmutation-table");
let ClassActivityService = ClassActivityService_1 = class ClassActivityService {
    constructor(activityRepo, scoreRepo, masterlistRepo, finalGradeRepo, coRepo, tosRepo, assessmentTypeRepo) {
        this.activityRepo = activityRepo;
        this.scoreRepo = scoreRepo;
        this.masterlistRepo = masterlistRepo;
        this.finalGradeRepo = finalGradeRepo;
        this.coRepo = coRepo;
        this.tosRepo = tosRepo;
        this.assessmentTypeRepo = assessmentTypeRepo;
        this.logger = new common_1.Logger(ClassActivityService_1.name);
    }
    async getGradebook(subjcode, section, category) {
        return this.activityRepo.find({
            where: { subjcode, section, category },
            relations: ['scores', 'scores.student'],
            order: { activity_id: 'ASC' },
        });
    }
    async saveGradebook(dto) {
        var _a, _b;
        this.logger.log(`[START] Saving gradebook for ${dto.subjcode} - ${dto.section}`);
        const allStudents = await this.masterlistRepo.find({
            where: {
                subjcode: dto.subjcode,
                section: dto.section,
                sy: dto.sy,
                sem: dto.sem,
            },
        });
        const studentMap = new Map(allStudents.map((s) => [s.studid, s]));
        let resolvedTypeId = null;
        if (dto.category) {
            const assessmentType = await this.assessmentTypeRepo.findOne({
                where: { code: dto.category },
            });
            resolvedTypeId = (_a = assessmentType === null || assessmentType === void 0 ? void 0 : assessmentType.type_id) !== null && _a !== void 0 ? _a : null;
        }
        for (const actDto of (_b = dto.activities) !== null && _b !== void 0 ? _b : []) {
            let activity = null;
            if (actDto.activity_id) {
                activity = await this.activityRepo.findOne({
                    where: { activity_id: actDto.activity_id },
                });
            }
            if (!activity) {
                activity = this.activityRepo.create({
                    subjcode: dto.subjcode,
                    section: dto.section,
                    category: dto.category,
                    grading_type: dto.grading_type,
                    empid: dto.empid,
                    sy: dto.sy,
                    sem: dto.sem,
                });
            }
            activity.activity_name = actDto.name;
            activity.max_score = actDto.maxScore;
            if (actDto.co_id != null)
                activity.co_id = actDto.co_id;
            if (actDto.type_id != null)
                activity.type_id = actDto.type_id;
            else if (resolvedTypeId != null)
                activity.type_id = resolvedTypeId;
            const savedActivity = await this.activityRepo.save(activity);
            const existingScores = await this.scoreRepo.find({
                where: { activity: { activity_id: savedActivity.activity_id } },
                relations: ['student'],
            });
            const existingScoreMap = new Map(existingScores.map((s) => [s.student.studid, s]));
            const scoresToSave = [];
            for (const se of actDto.scores) {
                const student = studentMap.get(se.studentId);
                if (!student || se.score === undefined)
                    continue;
                let rawScore = existingScoreMap.get(se.studentId);
                if (!rawScore) {
                    rawScore = this.scoreRepo.create({
                        activity: savedActivity,
                        student,
                        masterlist_id: student.masterlist_id,
                        score: se.score,
                    });
                }
                else {
                    rawScore.score = se.score;
                }
                scoresToSave.push(rawScore);
            }
            if (scoresToSave.length > 0)
                await this.scoreRepo.save(scoresToSave);
        }
        this.logger.log('[SUCCESS] Gradebook saved.');
        return { success: true, message: 'Scores saved successfully' };
    }
    async deleteActivity(activityId) {
        await this.scoreRepo.delete({ activity: { activity_id: activityId } });
        const result = await this.activityRepo.delete(activityId);
        if (result.affected === 0)
            throw new common_1.NotFoundException(`Activity ID ${activityId} not found`);
        return { success: true, message: 'Activity deleted successfully' };
    }
    async computeAllGrades(dto) {
        var _a;
        const { empid, subjcode, section, sy, sem } = dto;
        const students = await this.masterlistRepo.find({
            where: { subjcode, section, sy, sem },
        });
        if (!students.length)
            throw new common_1.NotFoundException('No students enrolled');
        const activities = await this.activityRepo.find({
            where: { subjcode, section },
            relations: ['scores'],
            order: { activity_id: 'ASC' },
        });
        const courseOutcomes = await this.coRepo.find({
            where: { empid, subjcode, section },
        });
        const coIdToCode = new Map(courseOutcomes.map((co) => [co.co_id, co.co_code]));
        const numCOs = courseOutcomes.length;
        const tosWeights = await this.tosRepo.find({
            where: { empid, subjcode, section },
        });
        const activityWeightMap = new Map();
        for (const tw of tosWeights) {
            const matchingActivities = activities.filter((a) => a.co_id === tw.co_id && a.type_id === tw.type_id);
            if (matchingActivities.length === 0)
                continue;
            const perActivityWeight = tw.weight_percentage / matchingActivities.length;
            for (const act of matchingActivities) {
                const existing = activityWeightMap.get(act.activity_id) || 0;
                activityWeightMap.set(act.activity_id, existing + perActivityWeight);
            }
        }
        const maxWeightPerCo = new Map();
        for (const act of activities) {
            const w = activityWeightMap.get(act.activity_id) || 0;
            if (w > 0 && act.co_id) {
                const existing = maxWeightPerCo.get(act.co_id) || 0;
                maxWeightPerCo.set(act.co_id, existing + w);
            }
        }
        const results = [];
        for (const student of students) {
            const rawScores = activities.map((act) => {
                var _a, _b;
                const scoreRow = (_a = act.scores) === null || _a === void 0 ? void 0 : _a.find((s) => s.masterlist_id === student.masterlist_id);
                return {
                    activity_id: act.activity_id,
                    activity_name: act.activity_name,
                    co_id: act.co_id,
                    type_id: act.type_id,
                    max_score: act.max_score,
                    score: (_b = scoreRow === null || scoreRow === void 0 ? void 0 : scoreRow.score) !== null && _b !== void 0 ? _b : null,
                };
            });
            const percentRatings = rawScores.map((rs) => ({
                activity_id: rs.activity_id,
                percent: rs.score !== null && rs.max_score > 0
                    ? (rs.score / rs.max_score) * 100
                    : null,
            }));
            const weightedRatings = [];
            for (const rs of rawScores) {
                const weight = activityWeightMap.get(rs.activity_id) || 0;
                if (weight === 0)
                    continue;
                const pctRating = rs.score !== null && rs.max_score > 0
                    ? (rs.score / rs.max_score) * 100
                    : 0;
                const weightedValue = (pctRating * weight) / 100;
                weightedRatings.push({
                    activity_id: rs.activity_id,
                    co_id: rs.co_id,
                    co_code: (_a = coIdToCode.get(rs.co_id)) !== null && _a !== void 0 ? _a : 'CO?',
                    type_id: rs.type_id,
                    weight_percentage: Math.round(weight * 100) / 100,
                    percent_rating: Math.round(pctRating * 100) / 100,
                    weighted_value: Math.round(weightedValue * 100) / 100,
                });
            }
            const coResults = [];
            let allCosPassed = true;
            for (const co of courseOutcomes) {
                const coWeighted = weightedRatings
                    .filter((wr) => wr.co_id === co.co_id)
                    .reduce((sum, wr) => sum + wr.weighted_value, 0);
                const coMax = maxWeightPerCo.get(co.co_id) || 0;
                const threshold = coMax * transmutation_table_1.CO_PASS_THRESHOLD - 0.01;
                const passed = coWeighted > threshold;
                if (!passed)
                    allCosPassed = false;
                coResults.push({
                    co_id: co.co_id,
                    co_code: co.co_code,
                    sum_weighted: Math.round(coWeighted * 100) / 100,
                    max_possible: Math.round(coMax * 100) / 100,
                    passed,
                });
            }
            const totalWeighted = coResults.reduce((sum, cr) => sum + cr.sum_weighted, 0);
            const totalRounded = Math.round(totalWeighted);
            const numericalGrade = (0, transmutation_table_1.transmuteGrade)(totalRounded);
            const remarks = (0, transmutation_table_1.deriveRemarks)(numericalGrade, allCosPassed);
            let fg = await this.finalGradeRepo.findOne({
                where: { masterlist_id: student.masterlist_id },
            });
            if (!fg) {
                fg = this.finalGradeRepo.create({
                    masterlist_id: student.masterlist_id,
                });
            }
            fg.final_weighted_score = totalRounded;
            fg.final_numerical_grade = numericalGrade;
            fg.remarks = remarks;
            await this.finalGradeRepo.save(fg);
            results.push({
                masterlist_id: student.masterlist_id,
                studid: student.studid,
                student_name: `${student.studlastname}, ${student.studfirstname}`,
                raw_scores: rawScores,
                percent_ratings: percentRatings,
                weighted_ratings: weightedRatings,
                co_results: coResults,
                total_weighted_percent: totalRounded,
                final_numerical_grade: numericalGrade,
                remarks,
            });
        }
        this.logger.log(`[COMPUTE] Grades computed for ${results.length} students in ${subjcode}-${section}`);
        return results;
    }
    async getRawScoreSheet(subjcode, section, sy, sem) {
        const students = await this.masterlistRepo.find({
            where: { subjcode, section, sy, sem },
        });
        const activities = await this.activityRepo.find({
            where: { subjcode, section },
            relations: ['scores'],
            order: { activity_id: 'ASC' },
        });
        return students.map((s) => ({
            masterlist_id: s.masterlist_id,
            studid: s.studid,
            student_name: `${s.studlastname}, ${s.studfirstname}`,
            scores: activities.map((act) => {
                var _a, _b;
                const scoreRow = (_a = act.scores) === null || _a === void 0 ? void 0 : _a.find((sc) => sc.masterlist_id === s.masterlist_id);
                return {
                    activity_id: act.activity_id,
                    activity_name: act.activity_name,
                    co_id: act.co_id,
                    type_id: act.type_id,
                    max_score: act.max_score,
                    score: (_b = scoreRow === null || scoreRow === void 0 ? void 0 : scoreRow.score) !== null && _b !== void 0 ? _b : null,
                };
            }),
        }));
    }
    async getPercentRatingSheet(subjcode, section, sy, sem) {
        const raw = await this.getRawScoreSheet(subjcode, section, sy, sem);
        return raw.map((row) => (Object.assign(Object.assign({}, row), { scores: row.scores.map((s) => (Object.assign(Object.assign({}, s), { percent_rating: s.score !== null && s.max_score > 0
                    ? Math.round((s.score / s.max_score) * 10000) / 100
                    : null }))) })));
    }
    async getFinalGradeSheet(subjcode, section, sy, sem) {
        var _a, _b, _c;
        const students = await this.masterlistRepo.find({
            where: { subjcode, section, sy, sem },
        });
        const rows = [];
        for (const s of students) {
            const fg = await this.finalGradeRepo.findOne({
                where: { masterlist_id: s.masterlist_id },
            });
            rows.push({
                masterlist_id: s.masterlist_id,
                studid: s.studid,
                student_name: `${s.studlastname}, ${s.studfirstname}`,
                total_weighted_percent: (_a = fg === null || fg === void 0 ? void 0 : fg.final_weighted_score) !== null && _a !== void 0 ? _a : null,
                final_numerical_grade: (_b = fg === null || fg === void 0 ? void 0 : fg.final_numerical_grade) !== null && _b !== void 0 ? _b : null,
                remarks: (_c = fg === null || fg === void 0 ? void 0 : fg.remarks) !== null && _c !== void 0 ? _c : null,
            });
        }
        return rows;
    }
    async saveFinalGradesOnly(dto) {
        this.logger.log(`Saving final grades for ${dto.subjcode}`);
        const { subjcode, section, sy, sem, finalGrades } = dto;
        if (!finalGrades || finalGrades.length === 0)
            return { success: true };
        const students = await this.masterlistRepo.find({
            where: { subjcode, section, sy, sem },
        });
        const studentMap = new Map(students.map((s) => [s.studid, s]));
        for (const fg of finalGrades) {
            const student = studentMap.get(fg.studentId);
            if (!student)
                continue;
            let entry = await this.finalGradeRepo.findOne({
                where: { masterlist_id: student.masterlist_id },
            });
            if (!entry) {
                entry = this.finalGradeRepo.create({
                    masterlist_id: student.masterlist_id,
                });
            }
            entry.final_weighted_score = fg.weightedScore;
            entry.final_numerical_grade = fg.numericalGrade;
            entry.remarks = fg.remarks;
            await this.finalGradeRepo.save(entry);
        }
        return { success: true, message: 'Final grades saved' };
    }
};
exports.ClassActivityService = ClassActivityService;
exports.ClassActivityService = ClassActivityService = ClassActivityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_activity_entity_1.ClassActivity)),
    __param(1, (0, typeorm_1.InjectRepository)(raw_score_entity_1.RawScore)),
    __param(2, (0, typeorm_1.InjectRepository)(masterlist_entity_1.Masterlist)),
    __param(3, (0, typeorm_1.InjectRepository)(final_grade_entity_1.FinalGrade)),
    __param(4, (0, typeorm_1.InjectRepository)(course_outcome_entity_1.CourseOutcome)),
    __param(5, (0, typeorm_1.InjectRepository)(tos_weight_entity_1.TosWeight)),
    __param(6, (0, typeorm_1.InjectRepository)(assessment_type_entity_1.AssessmentType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ClassActivityService);
//# sourceMappingURL=class-activity.service.js.map