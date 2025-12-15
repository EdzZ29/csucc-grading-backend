import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Employee } from '../employee/employee.entity';
import { Masterlist } from './masterlist.entity';
import { MasterlistService } from './masterlist.service';
import { MasterlistController } from './masterlist.controller';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Masterlist, Employee]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [MasterlistService, AuthGuard],
  controllers: [MasterlistController],
})
export class MasterlistModule {}
