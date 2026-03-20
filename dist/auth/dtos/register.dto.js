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
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const employee_entity_1 = require("../../employee/employee.entity");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Firstname should not be empty' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstname", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Lastname should not be empty' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastname", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Middlename should not be empty' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "middlename", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "extname", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email should not be empty' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Password should not be empty' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Password Confirm should not be empty' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password_confirm", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Role should not be empty' }),
    (0, class_validator_1.IsEnum)(employee_entity_1.EmpRole, {
        message: 'Role must be one of: Admin, Instructor, Dean, Chairperson, Guidance',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
//# sourceMappingURL=register.dto.js.map