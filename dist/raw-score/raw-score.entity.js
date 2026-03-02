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
exports.RawScore = void 0;
const typeorm_1 = require("typeorm");
const masterlist_entity_1 = require("../masterlist/masterlist.entity");
const class_activity_entity_1 = require("../obe/class-activity.entity");
let RawScore = class RawScore {
};
exports.RawScore = RawScore;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RawScore.prototype, "raw_score_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RawScore.prototype, "masterlist_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RawScore.prototype, "activity_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], RawScore.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => masterlist_entity_1.Masterlist, (m) => m.rawScores),
    (0, typeorm_1.JoinColumn)({ name: 'masterlist_id' }),
    __metadata("design:type", masterlist_entity_1.Masterlist)
], RawScore.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_activity_entity_1.ClassActivity, (a) => a.scores),
    (0, typeorm_1.JoinColumn)({ name: 'activity_id' }),
    __metadata("design:type", class_activity_entity_1.ClassActivity)
], RawScore.prototype, "activity", void 0);
exports.RawScore = RawScore = __decorate([
    (0, typeorm_1.Entity)('raw_score')
], RawScore);
//# sourceMappingURL=raw-score.entity.js.map