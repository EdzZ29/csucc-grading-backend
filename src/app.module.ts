import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MasterlistModule } from './masterlist/masterlist.module';
import { EmployeeModule } from './employee/employee.module';
import { GradeWeightModule } from './grade-weight/grade-weight.module';
import { ClassActivityModule } from './class-activity/class-activity.module';
import { RawScoreModule } from './raw-score/raw-score.module';
import { FinalGradeModule } from './final-grade/final-grade.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'csucc-grading',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    MasterlistModule,
    EmployeeModule,
    GradeWeightModule,
    ClassActivityModule,
    RawScoreModule,
    FinalGradeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
