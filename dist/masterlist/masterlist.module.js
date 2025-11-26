"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterlistModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const masterlist_entity_1 = require("./masterlist.entity");
const masterlist_service_1 = require("./masterlist.service");
const masterlist_controller_1 = require("./masterlist.controller");
const auth_guard_1 = require("../auth/auth.guard");
let MasterlistModule = class MasterlistModule {
};
exports.MasterlistModule = MasterlistModule;
exports.MasterlistModule = MasterlistModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([masterlist_entity_1.Masterlist]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'secret',
                signOptions: { expiresIn: '1d' },
            }),
        ],
        providers: [masterlist_service_1.MasterlistService, auth_guard_1.AuthGuard],
        controllers: [masterlist_controller_1.MasterlistController],
    })
], MasterlistModule);
//# sourceMappingURL=masterlist.module.js.map