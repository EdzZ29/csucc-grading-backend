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

    console.log('[OBE] saveBatchSyllabus: Starting SMART MERGE for', payload.subjcode, normalizedSection);

    // ── STEP 1: Load existing Course Outcomes ──
    const existingCOs = await this.coRepo.find({
      where: { empid: payload.empid, subjcode: payload.subjcode, section: normalizedSection },
    });

    // Map old COs by co_code for quick lookup
    const existingCoMap = new Map<string, any>();
    existingCOs.forEach((co) => existingCoMap.set(co.co_code, co));

    console.log('[OBE] Existing COs:', Array.from(existingCoMap.keys()));
    console.log('[OBE] New COs:', payload.outcomes.map((o) => o.co_code));

    // ── STEP 2: Identify COs to delete, update, and create ──
    const newCoCodes = new Set(payload.outcomes.map((o) => o.co_code));
    const cosToDelte: string[] = [];
    const cosToUpdate: { co_code: string; description: string }[] = [];
    const cosToCreate: { co_code: string; description: string }[] = [];

    // Find COs to delete (exist in DB but not in new payload)
    existingCoMap.forEach((co, coCode) => {
      if (!newCoCodes.has(coCode)) {
        cosToDelte.push(coCode);
      }
    });

    // Find COs to update or create
    payload.outcomes.forEach((newCo) => {
      const existing = existingCoMap.get(newCo.co_code);
      if (existing) {
        cosToUpdate.push({ co_code: newCo.co_code, description: newCo.description });
      } else {
        cosToCreate.push({ co_code: newCo.co_code, description: newCo.description });
      }
    });

    console.log('[OBE] COs to delete:', cosToDelte);
    console.log('[OBE] COs to update:', cosToUpdate.map((c) => c.co_code));
    console.log('[OBE] COs to create:', cosToCreate.map((c) => c.co_code));

    // ── STEP 3: Delete only the COs that were removed ──
    if (cosToDelte.length > 0) {
      const coIdsToDelete = cosToDelte
        .map((coCode) => existingCoMap.get(coCode)?.co_id)
        .filter((id): id is number => id != null);

      if (coIdsToDelete.length > 0) {
        // Find activities linked to deleted COs
        const activitiesToDelete = await this.activityRepo.find({
          where: { co_id: In(coIdsToDelete) },
        });
        const activityIdsToDelete = activitiesToDelete.map((a) => a.activity_id);

        console.log('[OBE] Deleting activities for removed COs:', activityIdsToDelete);

        if (activityIdsToDelete.length > 0) {
          // Find affected students
          const affectedScores = await this.scoreRepo.find({
            where: { activity: { activity_id: In(activityIdsToDelete) } },
            select: ['masterlist_id'],
          });
          const affectedMasterlistIds = Array.from(
            new Set(affectedScores.map((s) => s.masterlist_id).filter((id) => id != null))
          );

          console.log('[OBE] Deleting scores for removed CO activities, affected students:', affectedMasterlistIds);

          // Delete scores
          await this.scoreRepo.delete({ activity: { activity_id: In(activityIdsToDelete) } });

          // Delete activities
          await this.activityRepo.delete({ activity_id: In(activityIdsToDelete) });

          // Delete and recalculate final grades for affected students
          if (affectedMasterlistIds.length > 0) {
            await this.gradeRepo.delete({ masterlist_id: In(affectedMasterlistIds) });
            console.log('[OBE] Deleted final grades for affected students');
          }
        }

        // Delete TosWeights for removed COs
        await this.tosRepo.delete({ co_id: In(coIdsToDelete) });

        // Delete CourseOutcomes
        await this.coRepo.delete({ co_id: In(coIdsToDelete) });
        console.log('[OBE] Deleted removed CourseOutcomes');
      }
    }

    // ── STEP 4: Update existing COs (in case description changed) ──
    if (cosToUpdate.length > 0) {
      for (const co of cosToUpdate) {
        const existing = existingCoMap.get(co.co_code);
        if (existing && existing.description !== co.description) {
          existing.description = co.description;
          await this.coRepo.save(existing);
          console.log(`[OBE] Updated description for CO: ${co.co_code}`);
        }
      }
    }

    // ── STEP 5: Create new COs ──
    const createdOutcomes = await Promise.all(
      cosToCreate.map((co) =>
        this.coRepo.save(this.coRepo.create({
          co_code: co.co_code, description: co.description,
          subjcode: payload.subjcode, section: normalizedSection,
          empid: payload.empid, sy: payload.sy, sem: payload.sem,
        })),
      ),
    );

    console.log('[OBE] Created new COs:', createdOutcomes.map((c) => c.co_code));

    // ── STEP 6: Build complete outcome map (existing + created) ──
    const outcomeMap = new Map<string, number>();
    existingCOs.forEach((co) => {
      if (!cosToDelte.includes(co.co_code)) {
        outcomeMap.set(co.co_code, co.co_id);
      }
    });
    createdOutcomes.forEach((co) => {
      outcomeMap.set(co.co_code, co.co_id);
    });

    // ── STEP 7: Smart weight update (only delete old weights, then insert new ones) ──
    // Load existing weights for this class
    const existingWeights = await this.tosRepo.find({
      where: {
        empid: payload.empid,
        subjcode: payload.subjcode,
        section: normalizedSection,
      },
    });

    // Find weights to delete (for removed COs or changed CO-Type combinations)
    const coIdsToDelete = cosToDelte
      .map((coCode) => existingCoMap.get(coCode)?.co_id)
      .filter((id): id is number => id != null);

    if (coIdsToDelete.length > 0) {
      await this.tosRepo.delete({ co_id: In(coIdsToDelete) });
      console.log('[OBE] Deleted weights for removed COs');
    }

    // Build new weight list from payload
    const validWeights = payload.weights.filter((w) => {
      const coId = outcomeMap.get(w.co_code);
      if (!coId) {
        console.warn(`[OBE] Skipping orphan weight: co_code="${w.co_code}" has no matching outcome`);
        return false;
      }
      return true;
    });

    if (validWeights.length === 0) {
      console.log('[OBE] No valid weights to save after filtering');
      return [];
    }

    // Delete ALL old weights (they will be recreated below)
    const allCoIds = Array.from(outcomeMap.values());
    if (allCoIds.length > 0) {
      await this.tosRepo.delete({
        empid: payload.empid,
        subjcode: payload.subjcode,
        section: normalizedSection,
        co_id: In(allCoIds),
      });
      console.log('[OBE] Cleared old weights for existing COs (will be replaced with new weights)');
    }

    // ── STEP 8: Insert new weights ──
    const weightsToSave = validWeights.map((w) => ({
      empid: payload.empid,
      subjcode: payload.subjcode,
      section: normalizedSection,
      co_id: outcomeMap.get(w.co_code),
      type_id: w.type_id,
      weight_percentage: w.weight_percentage,
    }));

    const savedWeights = await this.tosRepo.save(weightsToSave);
    console.log('[OBE] saveBatchSyllabus: SMART MERGE complete - preserved student scores where possible');
    
    return savedWeights;
  }
}