/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassActivity } from '../obe/class-activity.entity'; // ← UNIFIED entity from obe/
import { RawScore } from '../obe/raw-score.entity';
import { Masterlist } from '../masterlist/masterlist.entity';
import { FinalGrade } from '../obe/final-grade.entity';
import { CourseOutcome } from '../obe/course-outcome.entity';
import { TosWeight } from '../obe/tos-weight.entity';
import { AssessmentType } from '../obe/assessment-type.entity';
import { SaveGradebookDto } from './dto/save-gradebook.dto';
import { ComputeGradesDto } from './dto/compute-grades.dto';
import { transmuteGrade, deriveRemarks } from '../shared/transmutation-table';

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
  activity_name: string;
  co_id: number;
  type_id: number;
  percent: number | null; // 0–100
}

/** One cell in the WEIGHTED % RATING sheet (one per CO × Type group) */
interface WeightedRatingCell {
  co_id: number;
  co_code: string;
  type_id: number;
  type_code: string;
  weight_percentage: number;
  avg_percent: number;
  weighted_value: number;
}

export interface StudentGradeRow {
  masterlist_id: number;
  studid: string;
  student_name: string;
  raw_scores: RawScoreCell[];
  percent_ratings: PercentRatingCell[];
  weighted_ratings: WeightedRatingCell[];
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

    // Resolve type_id from category code if not provided per-activity
    let resolvedTypeId: number | null = null;
    if (dto.category) {
      const assessmentType = await this.assessmentTypeRepo.findOne({
        where: { code: dto.category },
      });
      resolvedTypeId = assessmentType?.type_id ?? null;
    }

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

      // Populate OBE FK columns so the computation pipeline can use them
      if (actDto.co_id != null) activity.co_id = actDto.co_id;
      if (actDto.type_id != null) activity.type_id = actDto.type_id;
      else if (resolvedTypeId != null) activity.type_id = resolvedTypeId;

      const savedActivity = await this.activityRepo.save(activity);

      // Upsert scores
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
    }

    this.logger.log('[SUCCESS] Gradebook saved.');
    return { success: true, message: 'Scores saved successfully' };
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
   *    Excel flow: RAW SCORE → % RATING → WEIGHTED % RATING → FINAL GRADE
   * ────────────────────────────────────────────────────────────── */

  async computeAllGrades(dto: ComputeGradesDto): Promise<StudentGradeRow[]> {
    const { empid, subjcode, section, sy, sem } = dto;

    // ── Load reference data ─────────────────────────────────────
    const students = await this.masterlistRepo.find({
      where: { subjcode, section, sy, sem },
    });
    if (!students.length) throw new NotFoundException('No students enrolled');

    // Load ALL activities for this class with their scores
    const activities = await this.activityRepo.find({
      where: { subjcode, section },
      relations: ['scores'],
      order: { activity_id: 'ASC' },
    });

    // Load Course Outcomes for label lookup
    const courseOutcomes = await this.coRepo.find({
      where: { empid, subjcode, section },
    });
    const coIdToCode = new Map(courseOutcomes.map((co) => [co.co_id, co.co_code]));

    // Load Assessment Types for label lookup
    const assessmentTypes = await this.assessmentTypeRepo.find();
    const typeIdToCode = new Map(assessmentTypes.map((at) => [at.type_id, at.code]));

    // Load TOS weights (the weight matrix)
    const tosWeights = await this.tosRepo.find({
      where: { empid, subjcode, section },
    });

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

      // ─── STEP B: % RATING sheet ─────────────────────────────
      //   Excel: = 'RAW SCORE'!D7 / TOS!D$2 * 100
      const percentRatings: PercentRatingCell[] = rawScores.map((rs) => ({
        activity_id: rs.activity_id,
        activity_name: rs.activity_name,
        co_id: rs.co_id,
        type_id: rs.type_id,
        percent:
          rs.score !== null && rs.max_score > 0
            ? (rs.score / rs.max_score) * 100
            : null,
      }));

      // ─── STEP C: WEIGHTED % RATING sheet ─────────────────────
      //   For each TOS weight row (one per CO × AssessmentType):
      //     1. Find all activities matching co_id AND type_id
      //     2. avg% = sum(scores) / sum(max_scores) * 100
      //     3. weighted = avg% × weight_percentage / 100
      const weightedRatings: WeightedRatingCell[] = [];

      for (const tw of tosWeights) {
        // Find raw scores for activities that match this weight's CO and type
        const matchingRaw = rawScores.filter(
          (rs) => rs.co_id === tw.co_id && rs.type_id === tw.type_id,
        );

        let avgPercent = 0;
        if (matchingRaw.length > 0) {
          const sumScores = matchingRaw.reduce(
            (a, r) => a + (r.score ?? 0),
            0,
          );
          const sumMax = matchingRaw.reduce((a, r) => a + r.max_score, 0);
          avgPercent = sumMax > 0 ? (sumScores / sumMax) * 100 : 0;
        }

        const weightedValue = (avgPercent * tw.weight_percentage) / 100;

        weightedRatings.push({
          co_id: tw.co_id,
          co_code: coIdToCode.get(tw.co_id) ?? `CO?`,
          type_id: tw.type_id,
          type_code: typeIdToCode.get(tw.type_id) ?? `T?`,
          weight_percentage: tw.weight_percentage,
          avg_percent: Math.round(avgPercent * 100) / 100,
          weighted_value: Math.round(weightedValue * 100) / 100,
        });
      }

      // ─── STEP D: FINAL GRADE sheet ───────────────────────────
      //   total = SUM of all weighted_value
      //   grade = VLOOKUP on Transmutation Table
      //   remarks = IF(grade<=3,"PASSED","FAILED")
      const totalWeighted = weightedRatings.reduce(
        (sum, wr) => sum + wr.weighted_value,
        0,
      );
      const totalRounded = Math.round(totalWeighted * 100) / 100;
      const numericalGrade = transmuteGrade(totalRounded);
      const remarks = deriveRemarks(numericalGrade);

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