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
exports.PredictionController = void 0;
const common_1 = require("@nestjs/common");
const prediction_service_1 = require("./prediction.service");
const auth_guard_1 = require("../auth/auth.guard");
let PredictionController = class PredictionController {
    constructor(predictionService) {
        this.predictionService = predictionService;
    }
    trainModel() {
        return this.predictionService.trainModel();
    }
    getRisk(id) {
        return this.predictionService.predictRisk(id);
    }
    getBatch(subjcode, section, sy, sem) {
        return this.predictionService.predictBatch(subjcode, section, sy, sem);
    }
    getHeatmap(subjcode, section, sy, sem) {
        return this.predictionService.getCoHeatmap(subjcode, section, sy, sem);
    }
    getTrajectory(subjcode, section, sy, sem) {
        return this.predictionService.getTrajectory(subjcode, section, sy, sem);
    }
};
exports.PredictionController = PredictionController;
__decorate([
    (0, common_1.Post)('train'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PredictionController.prototype, "trainModel", null);
__decorate([
    (0, common_1.Get)('risk/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PredictionController.prototype, "getRisk", null);
__decorate([
    (0, common_1.Get)('batch'),
    __param(0, (0, common_1.Query)('subjcode')),
    __param(1, (0, common_1.Query)('section')),
    __param(2, (0, common_1.Query)('sy')),
    __param(3, (0, common_1.Query)('sem')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PredictionController.prototype, "getBatch", null);
__decorate([
    (0, common_1.Get)('heatmap'),
    __param(0, (0, common_1.Query)('subjcode')),
    __param(1, (0, common_1.Query)('section')),
    __param(2, (0, common_1.Query)('sy')),
    __param(3, (0, common_1.Query)('sem')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PredictionController.prototype, "getHeatmap", null);
__decorate([
    (0, common_1.Get)('trajectory'),
    __param(0, (0, common_1.Query)('subjcode')),
    __param(1, (0, common_1.Query)('section')),
    __param(2, (0, common_1.Query)('sy')),
    __param(3, (0, common_1.Query)('sem')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PredictionController.prototype, "getTrajectory", null);
exports.PredictionController = PredictionController = __decorate([
    (0, common_1.Controller)('prediction'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [prediction_service_1.PredictionService])
], PredictionController);
//# sourceMappingURL=prediction.controller.js.map