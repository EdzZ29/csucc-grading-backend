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
const class_activity_entity_1 = require("./class-activity.entity");
const raw_score_entity_1 = require("../raw-score/raw-score.entity");
const masterlist_entity_1 = require("../masterlist/masterlist.entity");
const final_grade_entity_1 = require("../final-grade/final-grade.entity");
let ClassActivityService = ClassActivityService_1 = class ClassActivityService {
    constructor(activityRepo, scoreRepo, masterlistRepo, finalGradeRepo) {
        this.activityRepo = activityRepo;
        this.scoreRepo = scoreRepo;
        this.masterlistRepo = masterlistRepo;
        this.finalGradeRepo = finalGradeRepo;
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
        this.logger.log(`[START] Saving gradebook for ${dto.subjcode} - ${dto.section}`);
        try {
            this.logger.debug('Step 1: Fetching students...');
            const allStudents = await this.masterlistRepo.find({
                where: {
                    subjcode: dto.subjcode,
                    section: dto.section,
                    sy: dto.sy,
                    sem: dto.sem,
                },
            });
            this.logger.debug(`Step 1 Done. Found ${allStudents.length} students.`);
            const studentMap = new Map(allStudents.map((s) => [s.studid, s]));
            for (const actDto of dto.activities) {
                this.logger.debug(`Step 2: Processing Activity: ${actDto.name}`);
                let activity;
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
                    });
                }
                activity.activity_name = actDto.name;
                activity.max_score = actDto.maxScore;
                const savedActivity = await this.activityRepo.save(activity);
                const scoresToSave = [];
                const existingScores = await this.scoreRepo.find({
                    where: { activity: { activity_id: savedActivity.activity_id } },
                    relations: ['student'],
                });
                const existingScoreMap = new Map(existingScores.map((s) => [s.student.studid, s]));
                for (const scoreEntry of actDto.scores) {
                    const student = studentMap.get(scoreEntry.studentId);
                    if (student) {
                        if (scoreEntry.score !== undefined) {
                            let rawScore = existingScoreMap.get(scoreEntry.studentId);
                            if (!rawScore) {
                                rawScore = this.scoreRepo.create({
                                    activity: savedActivity,
                                    student: student,
                                    masterlist_id: student.masterlist_id,
                                    score: scoreEntry.score,
                                });
                            }
                            else {
                                rawScore.score = scoreEntry.score;
                            }
                            scoresToSave.push(rawScore);
                        }
                    }
                }
                if (scoresToSave.length > 0) {
                    await this.scoreRepo.save(scoresToSave);
                }
            }
            this.logger.log('[SUCCESS] Gradebook saved.');
            return { success: true, message: 'Scores saved successfully' };
        }
        catch (error) {
            this.logger.error('[ERROR] Failed to save gradebook', error.stack);
            throw error;
        }
    }
    async saveFinalGradesOnly(dto) {
        this.logger.log(`Saving final grades for ${dto.subjcode}`);
        try {
            const { subjcode, section, sy, sem, finalGrades } = dto;
            if (!finalGrades || finalGrades.length === 0)
                return { success: true };
            const students = await this.masterlistRepo.find({
                where: { subjcode, section, sy, sem },
            });
            const studentMap = new Map(students.map((s) => [s.studid, s]));
            for (const fg of finalGrades) {
                const student = studentMap.get(fg.studentId);
                if (student) {
                    let finalGradeEntry = await this.finalGradeRepo.findOne({
                        where: { masterlist_id: student.masterlist_id },
                    });
                    if (!finalGradeEntry) {
                        finalGradeEntry = this.finalGradeRepo.create({
                            masterlist_id: student.masterlist_id,
                            student: student,
                        });
                    }
                    finalGradeEntry.final_weighted_score = fg.weightedScore;
                    finalGradeEntry.final_numerical_grade = fg.numericalGrade;
                    finalGradeEntry.remarks = fg.remarks;
                    await this.finalGradeRepo.save(finalGradeEntry);
                }
            }
            return { success: true, message: 'Final grades saved' };
        }
        catch (error) {
            this.logger.error('Failed to save final grades', error.stack);
            throw error;
        }
    }
    async deleteActivity(activityId) {
        await this.scoreRepo.delete({ activity: { activity_id: activityId } });
        const result = await this.activityRepo.delete(activityId);
        if (result.affected === 0)
            throw new common_1.NotFoundException(`Activity ID ${activityId} not found`);
        return { success: true, message: 'Activity deleted successfully' };
    }
};
exports.ClassActivityService = ClassActivityService;
exports.ClassActivityService = ClassActivityService = ClassActivityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_activity_entity_1.ClassActivity)),
    __param(1, (0, typeorm_1.InjectRepository)(raw_score_entity_1.RawScore)),
    __param(2, (0, typeorm_1.InjectRepository)(masterlist_entity_1.Masterlist)),
    __param(3, (0, typeorm_1.InjectRepository)(final_grade_entity_1.FinalGrade)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ClassActivityService);
//# sourceMappingURL=class-activity.service.js.map