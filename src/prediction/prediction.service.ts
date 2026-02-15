import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawScore } from '../raw-score/raw-score.entity';
import { FinalGrade } from '../final-grade/final-grade.entity';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(RawScore) private rawScoreRepo: Repository<RawScore>,
  ) {}

  // 1. Fetch Data & Train Model
  async trainModel() {
    this.logger.log('Fetching training data...');

    const rawData = await this.rawScoreRepo
      .createQueryBuilder('rs')
      .leftJoin('rs.activity', 'act')
      .leftJoin('rs.student', 'student')
      .leftJoin('student.finalGrade', 'fg')
      .select([
        "AVG(CASE WHEN UPPER(act.category) LIKE '%WRITTEN%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS written_avg",
        "AVG(CASE WHEN UPPER(act.category) LIKE '%PERFORMANCE%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS perf_avg",
        "AVG(CASE WHEN UPPER(act.category) LIKE '%MIDTERM%' OR UPPER(act.category) LIKE '%EXAM%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS midterm_score",
        'fg.remarks AS remarks',
        'fg.final_numerical_grade AS final_grade',
      ])
      .where('fg.remarks IS NOT NULL')
      .groupBy('student.masterlist_id')
      .addGroupBy('fg.remarks')
      .addGroupBy('fg.final_numerical_grade')
      .getRawMany();

    const trainingPayload = rawData.map((row) => {
      const grade = parseFloat(row.final_grade) || 0;

      // Create Multinomial Target (0=Safe, 1=Warning, 2=Critical)
      // Adjust these thresholds based on your school policy
      let risk = 0;
      if (grade > 3.0) risk = 2; // Failed (Critical)
      else if (grade > 2.5) risk = 1; // Low Grades (Warning)
      else risk = 0; // Good Grades (Safe)

      return {
        written_avg: parseFloat(row.written_avg) || 0,
        perf_avg: parseFloat(row.perf_avg) || 0,
        midterm_score: parseFloat(row.midterm_score) || 0,
        is_passed:
          row.remarks && row.remarks.toUpperCase() === 'PASSED' ? 1 : 0,
        risk_level: risk, // Field for Multinomial Model
      };
    });

    if (trainingPayload.length === 0)
      throw new InternalServerErrorException('No data to train.');

    try {
      const response = await firstValueFrom(
        this.httpService.post('http://127.0.0.1:5000/train', trainingPayload),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Training Failed');
      throw new InternalServerErrorException('Failed to train AI model');
    }
  }

  // 2. Predict Risk (No changes needed, but ensuring consistency)
  async predictRisk(masterlistId: number) {
    const studentData = await this.rawScoreRepo
      .createQueryBuilder('rs')
      .leftJoin('rs.activity', 'act')
      .leftJoin('rs.student', 'student')
      .select([
        "AVG(CASE WHEN UPPER(act.category) LIKE '%WRITTEN%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS written_avg",
        "AVG(CASE WHEN UPPER(act.category) LIKE '%PERFORMANCE%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS perf_avg",
        "AVG(CASE WHEN UPPER(act.category) LIKE '%MIDTERM%' OR UPPER(act.category) LIKE '%EXAM%' THEN rs.score / NULLIF(act.max_score, 0) ELSE NULL END) AS midterm_score",
      ])
      .where('student.masterlist_id = :id', { id: masterlistId })
      .getRawOne();

    const payload = {
      written_avg: parseFloat(studentData.written_avg) || 0,
      perf_avg: parseFloat(studentData.perf_avg) || 0,
      midterm_score: parseFloat(studentData.midterm_score) || 0,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post('http://127.0.0.1:5000/predict', payload),
      );
      return response.data;
    } catch (error) {
      return { binary_fail_prob: 0, multinomial_status: 'Unknown' };
    }
  }
}
