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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassActivityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_activity_entity_1 = require("./class-activity.entity");
const raw_score_entity_1 = require("../raw-score/raw-score.entity");
const masterlist_entity_1 = require("../masterlist/masterlist.entity");
let ClassActivityService = class ClassActivityService {
    constructor(activityRepo, scoreRepo, masterlistRepo) {
        this.activityRepo = activityRepo;
        this.scoreRepo = scoreRepo;
        this.masterlistRepo = masterlistRepo;
    }
    async getGradebook(subjcode, section, category) {
        return this.activityRepo.find({
            where: { subjcode, section, category },
            relations: ['scores', 'scores.student'],
            order: { activity_id: 'ASC' },
        });
    }
    async saveGradebook(dto) {
        const { subjcode, section, category, grading_type, activities } = dto;
        for (const actDto of activities) {
            let activity;
            if (actDto.activity_id) {
                activity = await this.activityRepo.findOne({
                    where: { activity_id: actDto.activity_id },
                });
            }
            if (!activity) {
                activity = this.activityRepo.create({
                    subjcode,
                    section,
                    category,
                    grading_type,
                });
            }
            activity.activity_name = actDto.name;
            activity.max_score = actDto.maxScore;
            const savedActivity = await this.activityRepo.save(activity);
            for (const scoreEntry of actDto.scores) {
                const studentRecord = await this.masterlistRepo.findOne({
                    where: {
                        studid: scoreEntry.studentId,
                        subjcode: subjcode,
                        section: section,
                    },
                });
                if (studentRecord) {
                    let rawScore = await this.scoreRepo.findOne({
                        where: {
                            activity_id: savedActivity.activity_id,
                            masterlist_id: studentRecord.masterlist_id,
                        },
                    });
                    if (!rawScore) {
                        rawScore = this.scoreRepo.create({
                            activity: savedActivity,
                            student: studentRecord,
                            masterlist_id: studentRecord.masterlist_id,
                        });
                    }
                    if (scoreEntry.score !== null && scoreEntry.score !== undefined) {
                        rawScore.score = scoreEntry.score;
                        await this.scoreRepo.save(rawScore);
                    }
                }
                else {
                    console.warn(`Student ${scoreEntry.studentId} not found in ${subjcode} - ${section}`);
                }
            }
        }
        return { success: true, message: 'Gradebook saved successfully' };
    }
    async deleteActivity(activityId) {
        await this.scoreRepo.delete({ activity: { activity_id: activityId } });
        const result = await this.activityRepo.delete(activityId);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Activity with ID ${activityId} not found`);
        }
        return { success: true, message: 'Activity deleted successfully' };
    }
};
exports.ClassActivityService = ClassActivityService;
exports.ClassActivityService = ClassActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_activity_entity_1.ClassActivity)),
    __param(1, (0, typeorm_1.InjectRepository)(raw_score_entity_1.RawScore)),
    __param(2, (0, typeorm_1.InjectRepository)(masterlist_entity_1.Masterlist)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ClassActivityService);
//# sourceMappingURL=class-activity.service.js.map