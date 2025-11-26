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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const register_dto_1 = require("./dtos/register.dto");
const user_service_1 = require("../user/user.service");
const login_dto_1 = require("./dtos/login.dto");
const user_entity_1 = require("../user/user.entity");
const auth_guard_1 = require("./auth.guard");
const roles_decorator_1 = require("./roles.decorator");
const roles_guard_1 = require("./roles.guard");
let AuthController = class AuthController {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async loginUsers(body, response) {
        const { email, password } = body;
        const user = await this.userService.findOne({ email });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid)
            throw new common_1.BadRequestException('Invalid credentials');
        const token = await this.jwtService.signAsync({
            id: user.employee_id,
            role: user.role,
        });
        response.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        let redirectUrl = '/';
        switch (user.role) {
            case user_entity_1.Role.ADMIN:
                redirectUrl = 'auth/admin-dashboard';
                break;
            case user_entity_1.Role.INSTRUCTOR:
                redirectUrl = 'auth/instructor-dashboard';
                break;
            case user_entity_1.Role.DEAN:
                redirectUrl = 'auth/dean-dashboard';
                break;
            case user_entity_1.Role.CHANCELLOR:
                redirectUrl = 'auth/chancellor-dashboard';
                break;
            case user_entity_1.Role.GUIDANCE:
                redirectUrl = 'auth/guidance-dashboard';
                break;
        }
        return {
            message: 'Login successful',
            access_token: token,
            role: user.role,
            redirect: redirectUrl,
        };
    }
    async logout(response) {
        response.clearCookie('jwt');
        return { message: 'Logged out successfully' };
    }
    async createUser(body) {
        if (body.password !== body.password_confirm) {
            throw new common_1.BadRequestException('Passwords do not match!');
        }
        const existingUser = await this.userService.findOne({ email: body.email });
        if (existingUser) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const hashed = await bcrypt.hash(body.password, 12);
        return this.userService.save(Object.assign(Object.assign({}, body), { password: hashed }));
    }
    async updateInfo(firstname, lastname, middlename, extname, email, password, role, userId) {
        const updateData = { firstname, lastname, middlename, extname, email, role };
        if (password && password.trim() !== '') {
            const hashed = await bcrypt.hash(password, 12);
            updateData.password = hashed;
        }
        await this.userService.update(userId, updateData);
        return this.userService.findOne({ employee_id: userId });
    }
    async getAllUsers() {
        return this.userService.findAll();
    }
    async resetPassword(userId, password, password_confirm) {
        const user = await this.userService.findOne({ employee_id: userId });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (password !== password_confirm) {
            throw new common_1.BadRequestException('Passwords do not match!');
        }
        await this.userService.update(userId, {
            password: await bcrypt.hash(password, 12),
        });
        return { message: 'Password reset successfully' };
    }
    async deleteUser(userId) {
        const user = await this.userService.findOne({ employee_id: userId });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.userService.delete(userId);
        return { message: 'User deleted successfully' };
    }
    async checkAuth(request) {
        const cookie = request.cookies['jwt'];
        const { id, role } = await this.jwtService.verifyAsync(cookie);
        return {
            loggedIn: true,
            user: await this.userService.findOne({ employee_id: id }),
            role,
        };
    }
    async getUser(request) {
        const cookie = request.cookies['jwt'];
        const { id } = await this.jwtService.verifyAsync(cookie);
        return this.userService.findOne({ employee_id: id });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('auth/login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginUsers", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('auth/logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, common_1.Post)('auth/admin/create-users/store'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, common_1.Put)('auth/admin/users/update-info/:id'),
    __param(0, (0, common_1.Body)('firstname')),
    __param(1, (0, common_1.Body)('lastname')),
    __param(2, (0, common_1.Body)('middlename')),
    __param(3, (0, common_1.Body)('extname')),
    __param(4, (0, common_1.Body)('email')),
    __param(5, (0, common_1.Body)('password')),
    __param(6, (0, common_1.Body)('role')),
    __param(7, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateInfo", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, common_1.Get)('auth/admin/users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, common_1.Put)('auth/admin/user/reset-password/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('password')),
    __param(2, (0, common_1.Body)('password_confirm')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.Role.ADMIN),
    (0, common_1.Delete)('auth/admin/delete-users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('auth/check'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkAuth", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('auth/user'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUser", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map