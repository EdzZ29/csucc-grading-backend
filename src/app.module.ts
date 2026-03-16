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
import { PredictionModule } from './prediction/prediction.module';
import { ObeModule } from './obe/obe.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL
        ? // ── Production (Railway) — use the full connection URL ──────────────
          {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          }
        : // ── Local development — use individual variables ──────────────────
          {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 3000,
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'admin',
            database: process.env.DB_NAME || 'csucc-grading',
            autoLoadEntities: true,
            synchronize: true,
            ssl: false,
          },
    ),
    AuthModule,
    MasterlistModule,
    EmployeeModule,
    GradeWeightModule,
    ClassActivityModule,
    RawScoreModule,
    FinalGradeModule,
    PredictionModule,
    ObeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}