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
import { RegisterDto } from './dtos/register.dto';
import { UserService } from 'src/user/user.service';
import { Response, Request } from 'express';
import { LoginDto } from './dtos/login.dto';
import { Role, Employee } from 'src/user/user.entity';
import { AuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // ================= LOGIN & LOGOUT ==================

  @Post('auth/login')
  async loginUsers(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = body;
    const user = await this.userService.findOne({ email });

    if (!user) throw new NotFoundException('User not found');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new BadRequestException('Invalid credentials');

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
      case Role.ADMIN:
        redirectUrl = 'auth/admin-dashboard';
        break;
      case Role.INSTRUCTOR:
        redirectUrl = 'auth/instructor-dashboard';
        break;
      case Role.DEAN:
        redirectUrl = 'auth/dean-dashboard';
        break;
      case Role.CHANCELLOR:
        redirectUrl = 'auth/chancellor-dashboard';
        break;
      case Role.GUIDANCE:
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

  @UseGuards(AuthGuard)
  @Post('auth/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return { message: 'Logged out successfully' };
  }

  // ================= ADMIN ONLY ROUTES ==================

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('auth/admin/create-users/store')
  async createUser(@Body() body: RegisterDto) {
    if (body.password !== body.password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }

    const existingUser = await this.userService.findOne({ email: body.email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashed = await bcrypt.hash(body.password, 12);

    return this.userService.save({
      ...body,
      password: hashed,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('auth/admin/users/update-info/:id')
  async updateInfo(
    @Body('firstname') firstname: string,
    @Body('lastname') lastname: string,
    @Body('middlename') middlename: string,
    @Body('extname') extname: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role: Role,
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

    await this.userService.update(userId, updateData);
    return this.userService.findOne({ employee_id: userId }); // 👈 fix id usage
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('auth/admin/users')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('auth/admin/user/reset-password/:id')
  async resetPassword(
    @Param('id') userId: number,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string,
  ) {
    const user = await this.userService.findOne({ employee_id: userId });
    if (!user) throw new NotFoundException('User not found');

    if (password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }

    await this.userService.update(userId, {
      password: await bcrypt.hash(password, 12),
    });

    return { message: 'Password reset successfully' };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('auth/admin/delete-users/:id')
  async deleteUser(@Param('id') userId: number) {
    const user = await this.userService.findOne({ employee_id: userId });
    if (!user) throw new NotFoundException('User not found');

    await this.userService.delete(userId);
    return { message: 'User deleted successfully' };
  }

  @UseGuards(AuthGuard)
  @Get('auth/check')
  async checkAuth(@Req() request: Request) {
    const cookie = request.cookies['jwt'];
    const { id, role } = await this.jwtService.verifyAsync(cookie);

    return {
      loggedIn: true,
      user: await this.userService.findOne({ employee_id: id }),
      role,
    };
  }

  // ================= ANY LOGGED USER ==================

  @UseGuards(AuthGuard)
  @Get('auth/user')
  async getUser(@Req() request: Request): Promise<Employee> {
    const cookie = request.cookies['jwt'];
    const { id } = await this.jwtService.verifyAsync(cookie);

    return this.userService.findOne({ employee_id: id });
  }
}
