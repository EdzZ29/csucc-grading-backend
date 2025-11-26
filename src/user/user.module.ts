import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';


@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
