/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  Res,
  Get,
  Delete,
  Put,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response, Request } from 'express';


import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { EmployeeService } from 'src/employee/employee.service';
import {  EmpRole, Employee } from 'src/employee/employee.entity';
import { AuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly jwtService: JwtService,
  ) {}

  // ================= LOGIN & LOGOUT ==================
@Post('auth/login')
  async loginUsers(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = body;
    const user = await this.employeeService.findOne({ email });

    if (!user) throw new NotFoundException('User not found');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new BadRequestException('Invalid credentials');

    //  Add 'empid' to the payload
    const payload = {
      id: user.empid,      // For backward compatibility
      empid: user.empid,
      role: user.role,
    };

    // Sign the token with the new payload
    const token = await this.jwtService.signAsync(payload);

    // NEW — allows cross-domain cookies on Railway
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    let redirectUrl = '/';
    switch (user.role) {
      case EmpRole.ADMIN: redirectUrl = 'auth/admin-dashboard'; break;
      case EmpRole.INSTRUCTOR: redirectUrl = 'auth/instructor-dashboard'; break;
      case EmpRole.CHANCELLOR: redirectUrl = 'auth/chancellor-dashboard'; break;
      case EmpRole.GUIDANCE: redirectUrl = 'auth/guidance-dashboard'; break;
      case EmpRole.DEAN: redirectUrl = 'auth/dean-dashboard'; break;
    }

    return {
      message: 'Login successful',
      access_token: token,
      role: user.role,
      redirect: redirectUrl,
    };
  }

  @UseGuards(AuthGuard)
  @Post('auth/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return { message: 'Logged out successfully' };
  }

  // ================= ADMIN ONLY ROUTES ==================

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(EmpRole.ADMIN)
  @Post('auth/admin/create-users/store')
  async createUser(@Body() body: RegisterDto) {
    if (body.password !== body.password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }

    const existingUser = await this.employeeService.findOne({ email: body.email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashed = await bcrypt.hash(body.password, 12);

    return this.employeeService.save({
      ...body,
      password: hashed,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(EmpRole.ADMIN)
  @Put('auth/admin/users/update-info/:id')
  async updateInfo(
    @Body('firstname') firstname: string,
    @Body('lastname') lastname: string,
    @Body('middlename') middlename: string,
    @Body('extname') extname: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role: EmpRole,
    @Param('id') userId: number,
  ) {
    const updateData: any = {
      firstname,
      lastname,
      middlename,
      extname,
      email,
      role,
    };

    if (password && password.trim() !== '') {
      const hashed = await bcrypt.hash(password, 12);
      updateData.password = hashed;
    }

    await this.employeeService.update(userId, updateData);
    return this.employeeService.findOne({ employee_id: userId });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(EmpRole.ADMIN)
  @Get('auth/admin/users')
  async getAllUsers() {
    return this.employeeService.findAll();
  }

  // ================= USER SELF-SERVICE ==================

  @UseGuards(AuthGuard) // Accessible by any logged-in user
  @Put('auth/user/update-password') // New Route
  async updateOwnPassword(
    @Req() req: Request,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string
  ) {
    // 1. Get the ID from the logged-in user's token (Secure)
    // Note: Use the 'user' object attached by your AuthGuard
    const userPayload = req['user'] as any;
    const userId = userPayload.empid || userPayload.id;

    if (!userId) throw new NotFoundException('User identity missing');

    // 2. Validate Match
    if (password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }

    // 3. Update Password
    const hashed = await bcrypt.hash(password, 12);
    await this.employeeService.update(userId, {
      password: hashed,
    });

    return { message: 'Password updated successfully' };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(EmpRole.ADMIN)
  @Put('auth/admin/user/reset-password/:id')
  async resetPassword(
    @Param('id') userId: number,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string,
  ) {
    const user = await this.employeeService.findOne({ employee_id: userId });
    if (!user) throw new NotFoundException('User not found');

    if (password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }

    await this.employeeService.update(userId, {
      password: await bcrypt.hash(password, 12),
    });

    return { message: 'Password reset successfully' };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(EmpRole.ADMIN)
  @Delete('auth/admin/delete-users/:id')
  async deleteUser(@Param('id') userId: number) {
    const user = await this.employeeService.findOne({ employee_id: userId });
    if (!user) throw new NotFoundException('User not found');

    await this.employeeService.delete(userId);
    return { message: 'User deleted successfully' };
  }

  @UseGuards(AuthGuard)
  @Get('auth/check')
  async checkAuth(@Req() request: Request) {
    const cookie = request.cookies['jwt'];
    const { id, role } = await this.jwtService.verifyAsync(cookie);

    return {
      loggedIn: true,
      user: await this.employeeService.findOne({ employee_id: id }),
      role,
    };
  }

  // ================= ANY LOGGED USER ==================

  @UseGuards(AuthGuard)
  @Get('auth/user')
  async getUser(@Req() request: Request): Promise<Employee> {
    const cookie = request.cookies['jwt'];
    const { id } = await this.jwtService.verifyAsync(cookie);

    return this.employeeService.findOne({ empid: id });
  }
}