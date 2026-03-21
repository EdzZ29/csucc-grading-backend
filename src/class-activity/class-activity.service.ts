/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassActivity } from '../obe/class-activity.entity';
import { RawScore } from '../obe/raw-score.entity';
import { Masterlist } from '../masterlist/masterlist.entity';
import { FinalGrade } from '../obe/final-grade.entity';
import { CourseOutcome } from '../obe/course-outcome.entity';
import { TosWeight } from '../obe/tos-weight.entity';
import { AssessmentType } from '../obe/assessment-type.entity';
import { SaveGradebookDto } from './dto/save-gradebook.dto';
import { ComputeGradesDto } from './dto/compute-grades.dto';
import {
  transmuteGrade,
  deriveRemarks,
  CO_PASS_THRESHOLD,
} from '../shared/transmutation-table';

/* ════════════════════════════════════════════════════════════════
 *  RESPONSE INTERFACES
 * ════════════════════════════════════════════════════════════════ */

interface RawScoreCell {
  activity_id: number;
  activity_name: string;
  co_id: number;
  type_id: number;
  max_score: number;
  score: number | null;
}

interface PercentRatingCell {
  activity_id: number;
  percent: number | null;
}

interface WeightedRatingCell {
  activity_id: number;
  co_id: number;
  co_code: string;
  type_id: number;
  weight_percentage: number;
  percent_rating: number;
  weighted_value: number;
}

/** Per-CO summary in FINAL GRADE sheet */
interface CoGradeResult {
  co_id: number;
  co_code: string;
  sum_weighted: number;
  max_possible: number;
  passed: boolean;
}

export interface StudentGradeRow {
  masterlist_id: number;
  studid: string;
  student_name: string;
  raw_scores: RawScoreCell[];
  percent_ratings: PercentRatingCell[];
  weighted_ratings: WeightedRatingCell[];
  co_results: CoGradeResult[];
  total_weighted_percent: number;
  final_numerical_grade: number;
  remarks: string;
}

/* ════════════════════════════════════════════════════════════════ */

@Injectable()
export class ClassActivityService {
  private readonly logger = new Logger(ClassActivityService.name);

  constructor(
    @InjectRepository(ClassActivity)
    private activityRepo: Repository<ClassActivity>,
    @InjectRepository(RawScore)
    private scoreRepo: Repository<RawScore>,
    @InjectRepository(Masterlist)
    private masterlistRepo: Repository<Masterlist>,
    @InjectRepository(FinalGrade)
    private finalGradeRepo: Repository<FinalGrade>,
    @InjectRepository(CourseOutcome)
    private coRepo: Repository<CourseOutcome>,
    @InjectRepository(TosWeight)
    private tosRepo: Repository<TosWeight>,
    @InjectRepository(AssessmentType)
    private assessmentTypeRepo: Repository<AssessmentType>,
  ) {}

  /* ──────────────────────────────────────────────────────────────
   * 1. GRADEBOOK CRUD  (existing endpoints — preserved)
   * ────────────────────────────────────────────────────────────── */

  async getGradebook(subjcode: string, section: string, category: string) {
    return this.activityRepo.find({
      where: { subjcode, section, category },
      relations: ['scores', 'scores.student'],
      order: { activity_id: 'ASC' },
    });
  }

  async saveGradebook(dto: SaveGradebookDto) {
    this.logger.log(
      `[START] Saving gradebook for ${dto.subjcode} - ${dto.section}`,
    );

    const allStudents = await this.masterlistRepo.find({
      where: {
        subjcode: dto.subjcode,
        section: dto.section,
        sy: dto.sy,
        sem: dto.sem,
      },
    });
    const studentMap = new Map(allStudents.map((s) => [s.studid, s]));

    let resolvedTypeId: number | null = null;
    if (dto.category) {
      const assessmentType = await this.assessmentTypeRepo.findOne({
        where: { code: dto.category },
      });
      resolvedTypeId = assessmentType?.type_id ?? null;
    }

    const returnedActivities = [];

    for (const actDto of dto.activities ?? []) {
      let activity: ClassActivity | null = null;

      if (actDto.activity_id) {
        activity = await this.activityRepo.findOne({
          where: { activity_id: actDto.activity_id },
        });
      }

      if (!activity) {
        activity = this.activityRepo.create({
          subjcode: dto.subjcode,
          section: dto.section,
          category: dto.category,
          grading_type: dto.grading_type,
          empid: dto.empid,
          sy: dto.sy,
          sem: dto.sem,
        });
      }

      activity.activity_name = actDto.name;
      activity.max_score = actDto.maxScore;

      if (actDto.co_id != null) activity.co_id = actDto.co_id;
      if (actDto.type_id != null) activity.type_id = actDto.type_id;
      else if (resolvedTypeId != null) activity.type_id = resolvedTypeId;

      const savedActivity = await this.activityRepo.save(activity);

      const existingScores = await this.scoreRepo.find({
        where: { activity: { activity_id: savedActivity.activity_id } },
        relations: ['student'],
      });
      const existingScoreMap = new Map(
        existingScores.map((s) => [s.student.studid, s]),
      );

      const scoresToSave: RawScore[] = [];
      for (const se of actDto.scores) {
        const student = studentMap.get(se.studentId);
        if (!student || se.score === undefined) continue;

        let rawScore = existingScoreMap.get(se.studentId);
        if (!rawScore) {
          rawScore = this.scoreRepo.create({
            activity: savedActivity,
            student,
            masterlist_id: student.masterlist_id,
            score: se.score,
          });
        } else {
          rawScore.score = se.score;
        }
        scoresToSave.push(rawScore);
      }

      if (scoresToSave.length > 0) await this.scoreRepo.save(scoresToSave);
      
      returnedActivities.push({
        name: savedActivity.activity_name,
        activity_id: savedActivity.activity_id
      });
    }

    this.logger.log('[SUCCESS] Gradebook saved.');
    return { success: true, message: 'Scores saved successfully', activities: returnedActivities };
  }

  async deleteActivity(activityId: number) {
    await this.scoreRepo.delete({ activity: { activity_id: activityId } });
    const result = await this.activityRepo.delete(activityId);
    if (result.affected === 0)
      throw new NotFoundException(`Activity ID ${activityId} not found`);
    return { success: true, message: 'Activity deleted successfully' };
  }

  /* ──────────────────────────────────────────────────────────────
   * 2. FULL OBE COMPUTATION PIPELINE
   *
   *    Matches Excel exactly:
   *      RAW SCORE → % RATING → WEIGHTED % RATING → FINAL GRADE
   *
   *    KEY CHANGES from previous version:
   *    - Weight is per ACTIVITY (not per CO×Type group)
   *    - Per-CO pass/fail check (60% threshold)
   *    - INC logic: passed overall but failed ≥1 CO = "INC"
   *
   *    How weights work (matching Course Details sheet):
   *    - Each activity belongs to a CO and has an assessment type
   *    - TOS weight defines: for this CO × Type, the total weight is X%
   *    - If there are N activities under the same CO × Type,
   *      each activity gets X/N % of the weight
   *    - All weights across ALL activities sum to 100%
   *
   *    WEIGHTED % RATING formula (per activity):
   *      = (raw_score / max_score * 100) * per_activity_weight%
   *      = percent_rating * per_activity_weight / 100
   *
   *    FINAL GRADE per CO:
   *      = SUMIF(all weighted values where CO matches)
   *      PASSED if sum > (max_possible_for_CO * 0.6 * 100) - 0.01
   *
   *    FINAL GRADE total:
   *      = SUM of all CO sums, rounded to whole number
   *      VLOOKUP → numerical grade (1.00–5.00)
   *      IF grade ≤ 3.00 AND all COs passed → "PASSED"
   *      IF grade ≤ 3.00 AND missed ≥1 CO  → "INC"
   *      IF grade > 3.00                    → "FAILED"
   * ────────────────────────────────────────────────────────────── */

  async computeAllGrades(dto: ComputeGradesDto): Promise<StudentGradeRow[]> {
    const { empid, subjcode, section, sy, sem } = dto;

    // ── Load reference data ─────────────────────────────────────
    const students = await this.masterlistRepo.find({
      where: { subjcode, section, sy, sem },
    });
    if (!students.length) throw new NotFoundException('No students enrolled');

    const activities = await this.activityRepo.find({
      where: { subjcode, section },
      relations: ['scores'],
      order: { activity_id: 'ASC' },
    });

    const courseOutcomes = await this.coRepo.find({
      where: { empid, subjcode, section },
    });
    const coIdToCode = new Map(
      courseOutcomes.map((co) => [co.co_id, co.co_code]),
    );
    const numCOs = courseOutcomes.length;

    const tosWeights = await this.tosRepo.find({
      where: { empid, subjcode, section },
    });

    // ── Build per-activity weight map ───────────────────────────
    // Excel assigns weight per activity column. We distribute the TOS
    // cell weight equally among all activities in that CO × Type group.
    //
    // Example: TOS says CO1 × QZ = 30%. There are 3 quizzes under CO1.
    //          Each quiz gets 30% / 3 = 10% per-activity weight.
    //
    // This matches the Excel's Course Details sheet where each activity
    // row has its own weight % that sums to 100% total.

    const activityWeightMap = new Map<number, number>(); // activity_id → weight%

    for (const tw of tosWeights) {
      // Find activities matching this TOS cell
      const matchingActivities = activities.filter(
        (a) => a.co_id === tw.co_id && a.type_id === tw.type_id,
      );

      if (matchingActivities.length === 0) continue;

      // Distribute weight equally among activities in this group
      const perActivityWeight =
        tw.weight_percentage / matchingActivities.length;

      for (const act of matchingActivities) {
        // Accumulate in case an activity somehow matches multiple TOS rows
        const existing = activityWeightMap.get(act.activity_id) || 0;
        activityWeightMap.set(act.activity_id, existing + perActivityWeight);
      }
    }

    // ── Build max-possible weight per CO (for pass threshold) ───
    // Excel: G21 = SUMIF(weighted_headers, "CO1", weighted_row22) / 100
    // This is the sum of per-activity weights for each CO
    const maxWeightPerCo = new Map<number, number>(); // co_id → total weight%
    for (const act of activities) {
      const w = activityWeightMap.get(act.activity_id) || 0;
      if (w > 0 && act.co_id) {
        const existing = maxWeightPerCo.get(act.co_id) || 0;
        maxWeightPerCo.set(act.co_id, existing + w);
      }
    }

    // ── Build per-student grade rows ────────────────────────────
    const results: StudentGradeRow[] = [];

    for (const student of students) {
      // ─── STEP A: RAW SCORE sheet ─────────────────────────────
      const rawScores: RawScoreCell[] = activities.map((act) => {
        const scoreRow = act.scores?.find(
          (s) => s.masterlist_id === student.masterlist_id,
        );
        return {
          activity_id: act.activity_id,
          activity_name: act.activity_name,
          co_id: act.co_id,
          type_id: act.type_id,
          max_score: act.max_score,
          score: scoreRow?.score ?? null,
        };
      });

      // ─── STEP B: % RATING sheet ──────────────────────────────
      // Excel: = (raw / max) * 100
      const percentRatings: PercentRatingCell[] = rawScores.map((rs) => ({
        activity_id: rs.activity_id,
        percent:
          rs.score !== null && rs.max_score > 0
            ? (rs.score / rs.max_score) * 100
            : null,
      }));

      // ─── STEP C: WEIGHTED % RATING sheet ──────────────────────
      // Excel: = ((raw / max) * 100) * weight%
      // where weight% is the per-activity weight (with % operator = /100)
      const weightedRatings: WeightedRatingCell[] = [];

      for (const rs of rawScores) {
        const weight = activityWeightMap.get(rs.activity_id) || 0;
        if (weight === 0) continue; // skip activities with no TOS weight

        const pctRating =
          rs.score !== null && rs.max_score > 0
            ? (rs.score / rs.max_score) * 100
            : 0;

        // Excel: pctRating * weight%  (the % operator divides by 100)
        const weightedValue = (pctRating * weight) / 100;

        weightedRatings.push({
          activity_id: rs.activity_id,
          co_id: rs.co_id,
          co_code: coIdToCode.get(rs.co_id) ?? 'CO?',
          type_id: rs.type_id,
          weight_percentage: Math.round(weight * 100) / 100,
          percent_rating: Math.round(pctRating * 100) / 100,
          weighted_value: Math.round(weightedValue * 100) / 100,
        });
      }

      // ─── STEP D: FINAL GRADE sheet — per-CO sums + pass check ─
      // Excel: G23 = SUMIF(headers, "CO1", student_weighted_row)
      //         H23 = IF(G23 > (G21 * 0.6 * 100) - 0.01, "PASSED", "-")
      const coResults: CoGradeResult[] = [];
      let allCosPassed = true;

      for (const co of courseOutcomes) {
        // Sum weighted values for this CO
        const coWeighted = weightedRatings
          .filter((wr) => wr.co_id === co.co_id)
          .reduce((sum, wr) => sum + wr.weighted_value, 0);

        // Max possible for this CO (the sum of per-activity weights)
        const coMax = maxWeightPerCo.get(co.co_id) || 0;

        // Excel threshold: sum > (maxWeight * 0.6 * 100) - 0.01
        // When coMax = 0 (no activities for this CO):
        //   threshold = (0 * 0.6) - 0.01 = -0.01
        //   0 > -0.01 → TRUE → "PASSED"
        // This means COs with no activities auto-pass in the Excel.
        // The -0.01 grace margin is intentional.
        const threshold = coMax * CO_PASS_THRESHOLD - 0.01;
        const passed = coWeighted > threshold;

        if (!passed) allCosPassed = false;

        coResults.push({
          co_id: co.co_id,
          co_code: co.co_code,
          sum_weighted: Math.round(coWeighted * 100) / 100,
          max_possible: Math.round(coMax * 100) / 100,
          passed,
        });
      }

      // ─── STEP E: Total + Transmutation + Remarks ──────────────
      // Excel: D23 = ROUND(SUM(G23,I23,K23,...), 0)
      const totalWeighted = coResults.reduce(
        (sum, cr) => sum + cr.sum_weighted,
        0,
      );
      const totalRounded = Math.round(totalWeighted);

      // Excel: E23 = VLOOKUP(D23, transmutation_table, 2, TRUE)
      const numericalGrade = transmuteGrade(totalRounded);

      // Excel: F23 = IF(E23<3.01, IF(COUNTIF(..."PASSED")=numCOs, "PASSED", "INC"), "")
      const remarks = deriveRemarks(numericalGrade, allCosPassed);

      // Persist to final_grade table
      let fg = await this.finalGradeRepo.findOne({
        where: { masterlist_id: student.masterlist_id },
      });
      if (!fg) {
        fg = this.finalGradeRepo.create({
          masterlist_id: student.masterlist_id,
        });
      }
      fg.final_weighted_score = totalRounded;
      fg.final_numerical_grade = numericalGrade;
      fg.remarks = remarks;
      await this.finalGradeRepo.save(fg);

      results.push({
        masterlist_id: student.masterlist_id,
        studid: student.studid,
        student_name: `${student.studlastname}, ${student.studfirstname}`,
        raw_scores: rawScores,
        percent_ratings: percentRatings,
        weighted_ratings: weightedRatings,
        co_results: coResults,
        total_weighted_percent: totalRounded,
        final_numerical_grade: numericalGrade,
        remarks,
      });
    }

    this.logger.log(
      `[COMPUTE] Grades computed for ${results.length} students in ${subjcode}-${section}`,
    );
    return results;
  }

  /* ──────────────────────────────────────────────────────────────
   * 3. READ-ONLY SHEET VIEWS
   * ────────────────────────────────────────────────────────────── */

  async getRawScoreSheet(
    subjcode: string,
    section: string,
    sy: string,
    sem: string,
  ) {
    const students = await this.masterlistRepo.find({
      where: { subjcode, section, sy, sem },
    });
    const activities = await this.activityRepo.find({
      where: { subjcode, section },
      relations: ['scores'],
      order: { activity_id: 'ASC' },
    });

    return students.map((s) => ({
      masterlist_id: s.masterlist_id,
      studid: s.studid,
      student_name: `${s.studlastname}, ${s.studfirstname}`,
      scores: activities.map((act) => {
        const scoreRow = act.scores?.find(
          (sc) => sc.masterlist_id === s.masterlist_id,
        );
        return {
          activity_id: act.activity_id,
          activity_name: act.activity_name,
          co_id: act.co_id,
          type_id: act.type_id,
          max_score: act.max_score,
          score: scoreRow?.score ?? null,
        };
      }),
    }));
  }

  async getPercentRatingSheet(
    subjcode: string,
    section: string,
    sy: string,
    sem: string,
  ) {
    const raw = await this.getRawScoreSheet(subjcode, section, sy, sem);
    return raw.map((row) => ({
      ...row,
      scores: row.scores.map((s) => ({
        ...s,
        percent_rating:
          s.score !== null && s.max_score > 0
            ? Math.round((s.score / s.max_score) * 10000) / 100
            : null,
      })),
    }));
  }

  async getFinalGradeSheet(
    subjcode: string,
    section: string,
    sy: string,
    sem: string,
  ) {
    const students = await this.masterlistRepo.find({
      where: { subjcode, section, sy, sem },
    });

    const rows = [];
    for (const s of students) {
      const fg = await this.finalGradeRepo.findOne({
        where: { masterlist_id: s.masterlist_id },
      });
      rows.push({
        masterlist_id: s.masterlist_id,
        studid: s.studid,
        student_name: `${s.studlastname}, ${s.studfirstname}`,
        total_weighted_percent: fg?.final_weighted_score ?? null,
        final_numerical_grade: fg?.final_numerical_grade ?? null,
        remarks: fg?.remarks ?? null,
      });
    }
    return rows;
  }

  /* ──────────────────────────────────────────────────────────────
   * 4. SAVE FINAL GRADES (frontend-computed fallback — preserved)
   * ────────────────────────────────────────────────────────────── */

  async saveFinalGradesOnly(dto: SaveGradebookDto) {
    this.logger.log(`Saving final grades for ${dto.subjcode}`);
    const { subjcode, section, sy, sem, finalGrades } = dto;
    if (!finalGrades || finalGrades.length === 0) return { success: true };

    const students = await this.masterlistRepo.find({
      where: { subjcode, section, sy, sem },
    });
    const studentMap = new Map(students.map((s) => [s.studid, s]));

    for (const fg of finalGrades) {
      const student = studentMap.get(fg.studentId);
      if (!student) continue;

      let entry = await this.finalGradeRepo.findOne({
        where: { masterlist_id: student.masterlist_id },
      });
      if (!entry) {
        entry = this.finalGradeRepo.create({
          masterlist_id: student.masterlist_id,
        });
      }
      entry.final_weighted_score = fg.weightedScore;
      entry.final_numerical_grade = fg.numericalGrade;
      entry.remarks = fg.remarks;
      await this.finalGradeRepo.save(entry);
    }
    return { success: true, message: 'Final grades saved' };
  }
}
