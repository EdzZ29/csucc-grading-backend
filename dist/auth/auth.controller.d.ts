import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from 'src/user/user.service';
import { Response, Request } from 'express';
import { LoginDto } from './dtos/login.dto';
import { Role, Employee } from 'src/user/user.entity';
export declare class AuthController {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    loginUsers(body: LoginDto, response: Response): Promise<{
        message: string;
        access_token: string;
        role: string;
        redirect: string;
    }>;
    logout(response: Response): Promise<{
        message: string;
    }>;
    createUser(body: RegisterDto): Promise<any>;
    updateInfo(firstname: string, lastname: string, middlename: string, extname: string, email: string, password: string, role: Role, userId: number): Promise<Employee>;
    getAllUsers(): Promise<Employee[]>;
    resetPassword(userId: number, password: string, password_confirm: string): Promise<{
        message: string;
    }>;
    deleteUser(userId: number): Promise<{
        message: string;
    }>;
    checkAuth(request: Request): Promise<{
        loggedIn: boolean;
        user: Employee;
        role: any;
    }>;
    getUser(request: Request): Promise<Employee>;
}
