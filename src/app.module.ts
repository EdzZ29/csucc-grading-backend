import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MasterlistModule } from './masterlist/masterlist.module';
import { GradeModule } from './grade/grade.module';




@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',   
      port: 3306,
      username: 'postgres',
      password: 'admin', 
      database: 'capstone-csucc',   
      autoLoadEntities: true,
      synchronize: true,   
    }),
    UserModule,
    AuthModule,
    MasterlistModule,
    GradeModule,

    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
