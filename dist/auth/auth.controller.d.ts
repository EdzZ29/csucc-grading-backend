import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { EmpRole, Employee } from 'src/employee/employee.entity';
export declare class AuthController {
    private readonly employeeService;
    private readonly jwtService;
    constructor(employeeService: EmployeeService, jwtService: JwtService);
    loginUsers(body: LoginDto, response: Response): Promise<{
        message: string;
        access_token: string;
        role: EmpRole;
        redirect: string;
    }>;
    logout(response: Response): Promise<{
        message: string;
    }>;
    createUser(body: RegisterDto): Promise<any>;
    updateInfo(firstname: string, lastname: string, middlename: string, extname: string, email: string, password: string, role: EmpRole, userId: number): Promise<Employee>;
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
