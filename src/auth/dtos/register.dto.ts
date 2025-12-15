import { IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { EmpRole } from 'src/employee/employee.entity'; // ✅ Changed from user.entity

export class RegisterDto {
  @IsNotEmpty({ message: 'Firstname should not be empty' })
  firstname: string;

  @IsNotEmpty({ message: 'Lastname should not be empty' })
  lastname: string;

  @IsNotEmpty({ message: 'Middlename should not be empty' })
  middlename: string;

  @IsOptional()
  extname?: string;

  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @IsNotEmpty({ message: 'Password Confirm should not be empty' })
  password_confirm: string;

  @IsNotEmpty({ message: 'Role should not be empty' })
  @IsEnum(EmpRole, {
    message:
      'Role must be one of: Admin, Instructor, Dean, Chancellor, Guidance',
  })
  role: EmpRole;
}
