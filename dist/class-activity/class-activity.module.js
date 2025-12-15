"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassActivityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const class_activity_service_1 = require("./class-activity.service");
const class_activity_controller_1 = require("./class-activity.controller");
const class_activity_entity_1 = require("./class-activity.entity");
const raw_score_entity_1 = require("../raw-score/raw-score.entity");
const masterlist_entity_1 = require("../masterlist/masterlist.entity");
let ClassActivityModule = class ClassActivityModule {
};
exports.ClassActivityModule = ClassActivityModule;
exports.ClassActivityModule = ClassActivityModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([class_activity_entity_1.ClassActivity, raw_score_entity_1.RawScore, masterlist_entity_1.Masterlist])],
        controllers: [class_activity_controller_1.ClassActivityController],
        providers: [class_activity_service_1.ClassActivityService],
    })
], ClassActivityModule);
//# sourceMappingURL=class-activity.module.js.map