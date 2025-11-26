import { Role } from "../../user/user.entity";
export declare class RegisterDto {
    firstname: string;
    lastname: string;
    middlename: string;
    extname?: string;
    email: string;
    password: string;
    password_confirm: string;
    role: Role;
}
