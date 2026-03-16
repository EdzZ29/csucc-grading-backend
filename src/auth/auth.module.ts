import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmployeeModule } from 'src/employee/employee.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      // Use env variable — never hardcode secrets
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' }
    }),
    EmployeeModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}