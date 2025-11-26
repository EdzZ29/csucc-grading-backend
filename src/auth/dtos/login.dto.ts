import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
  @IsEmail({}, {message: 'Please provide a valid email adress'})
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
