import { EmpRole } from 'src/employee/employee.entity';
export declare class RegisterDto {
    firstname: string;
    lastname: string;
    middlename: string;
    extname?: string;
    email: string;
    password: string;
    password_confirm: string;
    role: EmpRole;
}
