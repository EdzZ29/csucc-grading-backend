/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, IsNull } from 'typeorm';
import { CourseOutcome } from './course-outcome.entity';
import { TosWeight } from './tos-weight.entity';
import { RawScore } from './raw-score.entity';
import { FinalGrade } from './final-grade.entity';
import { ClassActivity } from './class-activity.entity';
import { AssessmentType } from './assessment-type.entity';
import { transmuteGrade, deriveRemarks } from '../shared/transmutation-table';

@Injectable()
export class ObeService {
  constructor(
    @InjectRepository(CourseOutcome) private coRepo: Repository<CourseOutcome>,
    @InjectRepository(TosWeight) private tosRepo: Repository<TosWeight>,
    @InjectRepository(RawScore) private scoreRepo: Repository<RawScore>,
    @InjectRepository(FinalGrade) private gradeRepo: Repository<FinalGrade>,
    @InjectRepository(ClassActivity) private activityRepo: Repository<ClassActivity>,
    @InjectRepository(AssessmentType) private assessmentTypeRepo: Repository<AssessmentType>,
  ) {}

  async findAllAssessmentTypes(empid?: number): Promise<AssessmentType[]> {
    if (empid) {
      return this.assessmentTypeRepo.find({
        where: [
          { empid: IsNull() },
          { empid: empid }
        ],
        order: { name: 'ASC' }
      });
    }
    return this.assessmentTypeRepo.find({ order: { name: 'ASC' } });
  }

  async calculateStudentFinalGrade(masterlistId: number): Promise<FinalGrade> {
    const scores = await this.scoreRepo.find({
      where: { masterlist_id: masterlistId },
      relations: ['activity'],
    });

    if (!scores?.length) throw new NotFoundException('No scores found for student');

    const { empid, subjcode } = scores[0].activity;
    const weights = await this.tosRepo.find({ where: { empid, subjcode } as any });

    let totalWeightedScore = 0;

    for (const weight of weights) {
      const relevant = scores.filter(
        (s) => s.activity.co_id === weight.co_id && s.activity.type_id === weight.type_id,
      );
      if (relevant.length > 0) {
        const sumObtained = relevant.reduce((a, c) => a + c.score, 0);
        const sumMax = relevant.reduce((a, c) => a + c.activity.max_score, 0);
        totalWeightedScore += (sumObtained / sumMax) * weight.weight_percentage;
      }
    }

    let fg = await this.gradeRepo.findOne({ where: { masterlist_id: masterlistId } });
    if (!fg) fg = this.gradeRepo.create({ masterlist_id: masterlistId });

    // weight_percentage is stored as a whole number (e.g. 10 for 10%)
    // so totalWeightedScore is already in 0–100 range
    fg.final_weighted_score = Math.round(totalWeightedScore * 100) / 100;
    fg.final_numerical_grade = transmuteGrade(fg.final_weighted_score);
    fg.remarks = deriveRemarks(fg.final_numerical_grade);

    return this.gradeRepo.save(fg);
  }

  // ── Syllabus CRUD (unchanged) ──────────────────────────────

  async createCourseOutcome(data: any) {
    return this.coRepo.save(this.coRepo.create(data));
  }

  async saveTosWeights(weights: any[]) {
    return this.tosRepo.save(weights);
  }

  async createActivity(data: any) {
    return this.activityRepo.save(this.activityRepo.create(data));
  }

  async recordRawScore(data: any) {
    return this.scoreRepo.save(this.scoreRepo.create(data));
  }

  async getFullSyllabus(empid: number, subjcode: string, section: string) {
    const results = await this.coRepo.find({
      where: { empid, subjcode, section },
      relations: ['tosWeights'],
      order: { co_code: 'ASC' },
    });
    if (!results?.length) return [];

    const uniqueMap = new Map<number, CourseOutcome>();
    for (const co of results) {
      if (!uniqueMap.has(co.co_id)) uniqueMap.set(co.co_id, co);
    }
    return Array.from(uniqueMap.values());
  }

  async createAssessmentType(data: { name: string; code: string; empid: number }) {
    try {
      const newType = this.assessmentTypeRepo.create({ 
        name: data.name, 
        code: data.code.toUpperCase(),
        empid: data.empid
      });
      return await this.assessmentTypeRepo.save(newType);
    } catch (error) {
       console.error('[OBE] createAssessmentType Error:', error);
       // Attempt to fix Postgres sequence out of sync if error implies pk violation
       if (error.code === '23505' || String(error).includes('duplicate key')) {
         console.log('[OBE] Attempting to reset sequence for assessment_types and retrying...');
         try {
           await this.assessmentTypeRepo.query(
             `SELECT setval(pg_get_serial_sequence('assessment_types', 'type_id'), coalesce(max(type_id),0) + 1, false) FROM assessment_types;`
           );
           const retryType = this.assessmentTypeRepo.create({ 
             name: data.name, 
             code: data.code.toUpperCase(),
             empid: data.empid
           });
           return await this.assessmentTypeRepo.save(retryType);
         } catch (retryErr) {
           console.error('[OBE] Retry also failed:', retryErr);
           throw retryErr;
         }
       }
       throw error;
    }
  }

  async saveBatchSyllabus(payload: {
    subjcode: string; section: string; outcomes: any[]; weights: any[];
    empid: number; sy: string; sem: string;
  }) {
    const normalizedSection = payload.section?.trim().replace(/\s+/g, ' ');

    const existingCOs = await this.coRepo.find({
      where: { empid: payload.empid, subjcode: payload.subjcode, section: normalizedSection },
      select: ['co_id'],
    });
    const existingCoIds = existingCOs.map((co) => co.co_id);

    if (existingCoIds.length > 0) await this.tosRepo.delete({ co_id: In(existingCoIds) });

    // Nullify co_id on class_activity rows that reference these COs
    // so the FK constraint doesn't block the delete
    if (existingCoIds.length > 0) {
      await this.coRepo.manager.query(
        `UPDATE class_activity SET co_id = NULL WHERE co_id = ANY($1)`,
        [existingCoIds],
      );
    }

    await this.coRepo.delete({ empid: payload.empid, subjcode: payload.subjcode, section: normalizedSection });

    const createdOutcomes = await Promise.all(
      payload.outcomes.map((co) =>
        this.coRepo.save(this.coRepo.create({
          co_code: co.co_code, description: co.description,
          subjcode: payload.subjcode, section: normalizedSection,
          empid: payload.empid, sy: payload.sy, sem: payload.sem,
        })),
      ),
    );

    const outcomeMap = createdOutcomes.reduce((acc, co) => {
      acc[co.co_code] = co.co_id;
      return acc;
    }, {} as Record<string, number>);

    // Filter out weights whose co_code doesn't match any created outcome
    // This happens when a teacher deletes a CO but forgets to remove its weight row
    const validWeights = payload.weights.filter((w) => {
      if (!outcomeMap[w.co_code]) {
        console.warn(`[OBE] Skipping orphan weight: co_code="${w.co_code}" has no matching outcome`);
        return false;
      }
      return true;
    });

    if (validWeights.length === 0) {
      console.log('[OBE] No valid weights to save after filtering');
      return [];
    }

    const weightsToSave = validWeights.map((w) => ({
      empid: payload.empid, subjcode: payload.subjcode, section: normalizedSection,
      co_id: outcomeMap[w.co_code], type_id: w.type_id,
      weight_percentage: w.weight_percentage,
    }));

    return this.tosRepo.save(weightsToSave);
  }
}