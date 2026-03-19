/* eslint-disable prettier/prettier */
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
import { FinalGrade } from '../obe/final-grade.entity';
import { Masterlist } from '../masterlist/masterlist.entity';

const PYTHON_API = process.env.PYTHON_API_URL || 'http://127.0.0.1:5000';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(RawScore)
    private rawScoreRepo: Repository<RawScore>,
    @InjectRepository(FinalGrade)
    private finalGradeRepo: Repository<FinalGrade>,
    @InjectRepository(Masterlist)
    private masterlistRepo: Repository<Masterlist>,
  ) {}

  // ══════════════════════════════════════════════════════════════════
  // TRAIN
  // ══════════════════════════════════════════════════════════════════
  async trainModel() {
    this.logger.log('Fetching OBE training data...');

    const gradeRows = await this.finalGradeRepo
      .createQueryBuilder('fg')
      .innerJoin('fg.student', 'ml')
      .select([
        'ml.masterlist_id         AS masterlist_id',
        'ml.studid                AS studid',
        'fg.final_weighted_score  AS final_weighted_score',
        'fg.final_numerical_grade AS final_numerical_grade',
        'fg.remarks               AS remarks',
      ])
      .where('fg.final_numerical_grade IS NOT NULL')
      .andWhere('fg.final_numerical_grade > 0')
      .getRawMany();

    if (!gradeRows.length) {
      throw new InternalServerErrorException(
        'No completed grades found. Compute grades for at least one class first.',
      );
    }

    const masterlistIds = gradeRows.map((r) => Number(r.masterlist_id));
    const coFeatureMap  = await this._computeCoFeatures(masterlistIds);
    const below60Map    = await this._getActivitiesBelow60Map(masterlistIds);

    const trainingData = gradeRows.map((row) => {
      const mlId   = Number(row.masterlist_id);
      const coData = coFeatureMap[mlId] || this._emptyCoFeatures();

      return {
        studid:                  String(row.studid),
        total_weighted_percent:  parseFloat(row.final_weighted_score) || 0,
        co_pass_rate:            coData.co_pass_rate,
        num_cos_failed:          coData.num_cos_failed,
        min_co_score:            coData.min_co_score,
        avg_co_score:            coData.avg_co_score,
        activities_below_60_pct: below60Map[mlId] ?? 0,
        final_numerical_grade:   parseFloat(row.final_numerical_grade) || 5.0,
        is_partial:              false,
        cos_with_data:           coData._total_cos,
        total_cos:               coData._total_cos,
      };
    });

    try {
      const res = await firstValueFrom(
        this.httpService.post(`${PYTHON_API}/train`, trainingData),
      );
      return res.data;
    } catch (err) {
      this.logger.error('Python /train failed', err?.message);
      throw new InternalServerErrorException(
        'Failed to train model. Is the Python API running on port 5000?',
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // PREDICT SINGLE STUDENT
  // ══════════════════════════════════════════════════════════════════
  async predictRisk(masterlistId: number) {
    const gradeRow = await this.finalGradeRepo
      .createQueryBuilder('fg')
      .innerJoin('fg.student', 'ml')
      .select([
        'ml.studid                AS studid',
        'ml.studlastname          AS studlastname',
        'ml.studfirstname         AS studfirstname',
        'fg.final_weighted_score  AS final_weighted_score',
        'fg.final_numerical_grade AS final_numerical_grade',
        'fg.remarks               AS remarks',
      ])
      .where('ml.masterlist_id = :id', { id: masterlistId })
      .getRawOne();

    const mlId = Number(masterlistId);
    let twp = 0;
    let finalGrade = null;
    let remarks = null;

    if (gradeRow) {
      twp        = parseFloat(gradeRow.final_weighted_score) || 0;
      finalGrade = gradeRow.final_numerical_grade;
      remarks    = gradeRow.remarks;
    } else {
      const partial = await this._computePartialWeightedPercent([mlId]);
      twp = partial[mlId] ?? 0;

      const hasAnyScore = await this.rawScoreRepo
        .createQueryBuilder('rs')
        .where('rs.masterlist_id = :id', { id: mlId })
        .getCount();

      if (!hasAnyScore) {
        return { error: 'No grade data found for this student.' };
      }
    }

    const coData  = (await this._computeCoFeatures([mlId]))[mlId] || this._emptyCoFeatures();
    const below60 = (await this._getActivitiesBelow60Map([mlId]))[mlId] ?? 0;

    if (!coData.avg_co_score && !coData.weak_cos.length && twp === 0) {
      return { error: 'No score data found. Enter at least one assessment score first.' };
    }

    const payload = {
      studid:                  String(gradeRow?.studid ?? mlId),
      total_weighted_percent:  twp,
      co_pass_rate:            coData.co_pass_rate,
      num_cos_failed:          coData.num_cos_failed,
      min_co_score:            coData.min_co_score,
      avg_co_score:            coData.avg_co_score,
      activities_below_60_pct: below60,
      weak_cos:                coData.weak_cos,
      weak_co_details:         coData.weak_co_details,
      is_partial:              !gradeRow,
      cos_with_data:           coData._total_cos,
      total_cos:               coData._total_cos,
    };

    try {
      const res = await firstValueFrom(
        this.httpService.post(`${PYTHON_API}/predict`, payload),
      );
      const pred = Array.isArray(res.data) ? res.data[0] : res.data;
      return {
        ...pred,
        current_grade:   finalGrade,
        remarks,
        weak_cos:        coData.weak_cos,
        weak_co_details: coData.weak_co_details,
        is_partial:      !gradeRow,
      };
    } catch {
      return this._fallback(
        gradeRow?.studid ?? mlId,
        twp, finalGrade, remarks,
        coData.weak_cos,
        { is_partial: !gradeRow },
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // BATCH PREDICT — all students in a class
  //
  // Does NOT require final grades to exist.
  // Uses final grade when available, falls back to partial raw scores.
  // Passes is_partial + cos_with_data + total_cos to Python so the
  // model can scale its confidence based on how much data is available.
  //
  //   Example: syllabus has 4 COs, only CO1 has scores entered.
  //     cos_with_data = 1, total_cos = 4 → confidence = 0.25
  //     Model blends prediction 25% toward Warning centre.
  //     Student with 65% on CO1 shows Warning, not Critical.
  //
  // Students with zero raw scores are skipped entirely.
  // ══════════════════════════════════════════════════════════════════
  async predictBatch(subjcode: string, section: string, sy: string, sem: string) {

    // ── Step 1: Get ALL students in this class ──────────────────
    const allStudents = await this.masterlistRepo
      .createQueryBuilder('ml')
      .select([
        'ml.masterlist_id  AS masterlist_id',
        'ml.studid         AS studid',
        'ml.studlastname   AS studlastname',
        'ml.studfirstname  AS studfirstname',
      ])
      .where('ml.subjcode = :subjcode', { subjcode })
      .andWhere('ml.section = :section', { section })
      .andWhere('ml.sy      = :sy',      { sy })
      .andWhere('ml.sem     = :sem',     { sem })
      .getRawMany();

    if (!allStudents.length) {
      return { error: 'No students found in this class. Import the masterlist first.' };
    }

    const masterlistIds = allStudents.map((s) => Number(s.masterlist_id));

    // ── Step 2: Get final grades for students who have them ─────
    const finalGradeRows = await this.finalGradeRepo
      .createQueryBuilder('fg')
      .innerJoin('fg.student', 'ml')
      .select([
        'ml.masterlist_id         AS masterlist_id',
        'fg.final_weighted_score  AS final_weighted_score',
        'fg.final_numerical_grade AS final_numerical_grade',
        'fg.remarks               AS remarks',
      ])
      .where('ml.masterlist_id IN (:...ids)', { ids: masterlistIds })
      .andWhere('fg.final_numerical_grade IS NOT NULL')
      .andWhere('fg.final_numerical_grade > 0')
      .getRawMany();

    const finalGradeMap: Record<number, any> = {};
    finalGradeRows.forEach((r) => {
      finalGradeMap[Number(r.masterlist_id)] = r;
    });

    // ── Step 3: Partial weighted percent for all students ───────
    const partialTwpMap = await this._computePartialWeightedPercent(
      masterlistIds, subjcode, section, sy, sem,
    );

    // ── Step 4: Find students who have at least one raw score ───
    const rawScoreCountRows = await this.rawScoreRepo
      .createQueryBuilder('rs')
      .innerJoin('rs.activity', 'act')
      .select('rs.masterlist_id', 'masterlist_id')
      .addSelect('COUNT(rs.raw_score_id)', 'score_count')
      .where('rs.masterlist_id IN (:...ids)', { ids: masterlistIds })
      .andWhere('act.subjcode = :subjcode', { subjcode })
      .andWhere('act.section  = :section',  { section })
      .andWhere('act.sy       = :sy',       { sy })
      .andWhere('act.sem      = :sem',      { sem })
      .groupBy('rs.masterlist_id')
      .getRawMany();

    const studentsWithScores = new Set<number>(
      rawScoreCountRows
        .filter((r) => parseInt(r.score_count, 10) > 0)
        .map((r) => Number(r.masterlist_id)),
    );

    const eligibleStudents = allStudents.filter((s) =>
      studentsWithScores.has(Number(s.masterlist_id)),
    );

    if (!eligibleStudents.length) {
      return {
        error: 'No scores entered yet. Enter at least one assessment score in the Grading Module to enable predictions.',
      };
    }

    const eligibleIds = eligibleStudents.map((s) => Number(s.masterlist_id));

    // ── Step 5: CO features and below-60 map ────────────────────
    const coFeatureMap = await this._computeCoFeatures(eligibleIds);
    const below60Map   = await this._getActivitiesBelow60Map(eligibleIds);

    // ── Step 6: Total syllabus CO count for this class ──────────
    // Needed to calculate the confidence ratio: cos_with_data / total_cos
    // We query course_outcomes directly (not raw_score) so we get the
    // full syllabus count regardless of how many have been assessed.
    let totalSyllabusCos = 0;
    try {
      const coCountRow = await this.rawScoreRepo.manager
        .getRepository('course_outcomes')
        .createQueryBuilder('co')
        .select('COUNT(DISTINCT co.co_id)', 'total')
        .where('co.subjcode = :subjcode', { subjcode })
        .andWhere('co.section = :section', { section })
        .getRawOne();
      totalSyllabusCos = parseInt(coCountRow?.total ?? '0', 10) || 0;
    } catch {
      // If query fails (e.g. entity name mismatch), fall back gracefully
      totalSyllabusCos = 0;
    }

    // ── Step 7: Build payloads ───────────────────────────────────
    const payloads = eligibleStudents.map((student) => {
      const mlId   = Number(student.masterlist_id);
      const coData = coFeatureMap[mlId] || this._emptyCoFeatures();
      const fg     = finalGradeMap[mlId];

      const twp = fg
        ? parseFloat(fg.final_weighted_score) || 0
        : partialTwpMap[mlId] ?? 0;

      const cosWithData = coData._total_cos ?? 0;
      const totalCos    = totalSyllabusCos > 0 ? totalSyllabusCos : cosWithData;

      return {
        studid:                  String(student.studid),
        masterlist_id:           mlId,
        student_name:            `${student.studlastname}, ${student.studfirstname}`,
        total_weighted_percent:  twp,
        co_pass_rate:            coData.co_pass_rate,
        num_cos_failed:          coData.num_cos_failed,
        min_co_score:            coData.min_co_score,
        avg_co_score:            coData.avg_co_score,
        activities_below_60_pct: below60Map[mlId] ?? 0,
        weak_cos:                coData.weak_cos,
        weak_co_details:         coData.weak_co_details,
        current_grade:           fg?.final_numerical_grade ?? null,
        remarks:                 fg?.remarks ?? null,
        // ── Partial data confidence hints for model.py ────────────
        is_partial:              !fg,
        cos_with_data:           cosWithData,
        total_cos:               totalCos,
      };
    });

    // ── Step 8: Send to Python or use fallback ───────────────────
    try {
      const res = await firstValueFrom(
        this.httpService.post(`${PYTHON_API}/predict/batch`, payloads),
      );
      const predictions: any[] = Array.isArray(res.data) ? res.data : [res.data];

      return predictions.map((pred, idx) => ({
        ...pred,
        masterlist_id:          payloads[idx]?.masterlist_id,
        student_name:           payloads[idx]?.student_name,
        current_grade:          payloads[idx]?.current_grade,
        remarks:                payloads[idx]?.remarks,
        weak_cos:               payloads[idx]?.weak_cos,
        weak_co_details:        payloads[idx]?.weak_co_details,
        total_weighted_percent: payloads[idx]?.total_weighted_percent,
        co_pass_rate:           payloads[idx]?.co_pass_rate,
        is_partial:             payloads[idx]?.is_partial,
      }));
    } catch (err) {
      this.logger.warn('Python batch failed — rule-based fallback');
      return payloads.map((p) =>
        this._fallback(
          p.studid, p.total_weighted_percent,
          p.current_grade, p.remarks, p.weak_cos,
          {
            masterlist_id:          p.masterlist_id,
            student_name:           p.student_name,
            total_weighted_percent: p.total_weighted_percent,
            co_pass_rate:           p.co_pass_rate,
            is_partial:             p.is_partial,
          },
        ),
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // CO ATTAINMENT HEATMAP
  // ══════════════════════════════════════════════════════════════════
  async getCoHeatmap(subjcode: string, section: string, sy: string, sem: string) {
    const students = await this.masterlistRepo
      .createQueryBuilder('ml')
      .select([
        'ml.masterlist_id  AS masterlist_id',
        'ml.studid         AS studid',
        'ml.studlastname   AS studlastname',
        'ml.studfirstname  AS studfirstname',
      ])
      .where('ml.subjcode = :subjcode', { subjcode })
      .andWhere('ml.section = :section', { section })
      .andWhere('ml.sy      = :sy',      { sy })
      .andWhere('ml.sem     = :sem',     { sem })
      .getRawMany();

    if (!students.length) {
      return { error: 'No students found for this class.' };
    }

    const masterlistIds = students.map((s) => Number(s.masterlist_id));

    const coRows = await this.rawScoreRepo
      .createQueryBuilder('rs')
      .innerJoin('rs.activity', 'act')
      .innerJoin('act.courseOutcome', 'co')
      .select('rs.masterlist_id',   'masterlist_id')
      .addSelect('co.co_code',      'co_code')
      .addSelect(
        '(SUM(rs.score) * 1.0 / NULLIF(SUM(act.max_score), 0)) * 100',
        'co_pct',
      )
      .where('rs.masterlist_id IN (:...ids)', { ids: masterlistIds })
      .andWhere('act.co_id IS NOT NULL')
      .andWhere('act.subjcode = :subjcode', { subjcode })
      .andWhere('act.section  = :section',  { section })
      .andWhere('act.sy       = :sy',       { sy })
      .andWhere('act.sem      = :sem',      { sem })
      .groupBy('rs.masterlist_id')
      .addGroupBy('co.co_code')
      .getRawMany();

    if (!coRows.length) {
      return { error: 'No CO score data available yet. Enter at least one assessment score first.' };
    }

    const coMap: Record<number, Record<string, number>> = {};
    coRows.forEach((r) => {
      const mlId = Number(r.masterlist_id);
      if (!coMap[mlId]) coMap[mlId] = {};
      const pct = parseFloat(r.co_pct);
      coMap[mlId][r.co_code] = !isNaN(pct) ? Math.round(pct * 10) / 10 : 0;
    });

    const studentsWithData = students.filter((s) =>
      coMap[Number(s.masterlist_id)] && Object.keys(coMap[Number(s.masterlist_id)]).length > 0,
    );

    if (!studentsWithData.length) {
      return { error: 'No CO score data available yet. Enter at least one assessment score first.' };
    }

    const payload = studentsWithData.map((s) => ({
      studid:       String(s.studid),
      student_name: `${s.studlastname}, ${s.studfirstname}`,
      co_scores:    coMap[Number(s.masterlist_id)] || {},
    }));

    try {
      const res = await firstValueFrom(
        this.httpService.post(`${PYTHON_API}/heatmap`, payload),
      );
      return res.data;
    } catch (err) {
      this.logger.error('Python /heatmap failed, using local fallback', err?.message);
      return this._heatmapFallback(payload);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // STUDENT TRAJECTORY
  // ══════════════════════════════════════════════════════════════════
  async getTrajectory(subjcode: string, section: string, sy: string, sem: string) {
    const students = await this.masterlistRepo
      .createQueryBuilder('ml')
      .select([
        'ml.masterlist_id  AS masterlist_id',
        'ml.studid         AS studid',
        'ml.studlastname   AS studlastname',
        'ml.studfirstname  AS studfirstname',
      ])
      .where('ml.subjcode = :subjcode', { subjcode })
      .andWhere('ml.section = :section', { section })
      .andWhere('ml.sy      = :sy',      { sy })
      .andWhere('ml.sem     = :sem',     { sem })
      .getRawMany();

    if (!students.length) {
      return { error: 'No students found for this class.' };
    }

    const masterlistIds = students.map((s) => Number(s.masterlist_id));

    const activityRows = await this.rawScoreRepo
      .createQueryBuilder('rs')
      .innerJoin('rs.activity', 'act')
      .leftJoin('act.courseOutcome', 'co')
      .leftJoin('act.assessmentType', 'atype')
      .select('rs.masterlist_id',        'masterlist_id')
      .addSelect('act.activity_id',      'activity_id')
      .addSelect('act.activity_name',    'activity_name')
      .addSelect('act.grading_type',     'grading_type')
      .addSelect('act.category',         'category')
      .addSelect('COALESCE(atype.name, act.category)', 'type_name')
      .addSelect('co.co_code',           'co_code')
      .addSelect('rs.score',             'score')
      .addSelect('act.max_score',        'max_score')
      .where('rs.masterlist_id IN (:...ids)', { ids: masterlistIds })
      .andWhere('act.subjcode = :subjcode', { subjcode })
      .andWhere('act.section  = :section',  { section })
      .andWhere('act.sy       = :sy',       { sy })
      .andWhere('act.sem      = :sem',      { sem })
      .orderBy('act.grading_type', 'ASC')
      .addOrderBy('act.activity_id', 'ASC')
      .getRawMany();

    if (!activityRows.length) {
      return { error: 'No assessment scores found yet. Enter at least one score in the Grading Module.' };
    }

    const labelCounters: Record<string, number> = {};
    const actIdToLabel: Record<number, string> = {};
    const seenActIds = new Set<number>();

    for (const r of activityRows) {
      const actId = Number(r.activity_id);
      if (seenActIds.has(actId)) continue;
      seenActIds.add(actId);
      const typeName = r.type_name || r.category || 'Act';
      if (!labelCounters[typeName]) labelCounters[typeName] = 0;
      labelCounters[typeName]++;
      actIdToLabel[actId] = `${typeName} ${labelCounters[typeName]}`;
    }

    const actMap: Record<number, Array<{ label: string; co: string | null; pct: number | null }>> = {};
    for (const r of activityRows) {
      const mlId  = Number(r.masterlist_id);
      const actId = Number(r.activity_id);
      if (!actMap[mlId]) actMap[mlId] = [];

      const score    = parseFloat(r.score);
      const maxScore = parseFloat(r.max_score);
      let pct: number | null = null;
      if (!isNaN(score) && !isNaN(maxScore) && maxScore > 0) {
        pct = Math.round((score / maxScore) * 1000) / 10;
      }

      actMap[mlId].push({
        label: actIdToLabel[actId] || `Activity ${actId}`,
        co:    r.co_code || null,
        pct,
      });
    }

    const studentsWithData = students.filter((s) =>
      actMap[Number(s.masterlist_id)] && actMap[Number(s.masterlist_id)].length > 0,
    );

    if (!studentsWithData.length) {
      return { error: 'No assessment scores found yet. Enter at least one score in the Grading Module.' };
    }

    const payload = studentsWithData.map((s) => ({
      studid:       String(s.studid),
      student_name: `${s.studlastname}, ${s.studfirstname}`,
      assessments:  actMap[Number(s.masterlist_id)] || [],
    }));

    try {
      const res = await firstValueFrom(
        this.httpService.post(`${PYTHON_API}/trajectory`, payload),
      );
      return res.data;
    } catch (err) {
      this.logger.error('Python /trajectory failed, using local fallback', err?.message);
      return this._trajectoryFallback(payload);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // HELPER: Partial weighted percent from raw scores only
  // ══════════════════════════════════════════════════════════════════
  private async _computePartialWeightedPercent(
    masterlistIds: number[],
    subjcode?: string,
    section?: string,
    sy?: string,
    sem?: string,
  ): Promise<Record<number, number>> {
    if (!masterlistIds.length) return {};

    let qb = this.rawScoreRepo
      .createQueryBuilder('rs')
      .innerJoin('rs.activity', 'act')
      .select('rs.masterlist_id', 'masterlist_id')
      .addSelect(
        '(SUM(rs.score)::float / NULLIF(SUM(act.max_score), 0)) * 100',
        'partial_pct',
      )
      .where('rs.masterlist_id IN (:...ids)', { ids: masterlistIds })
      .andWhere('act.max_score > 0');

    if (subjcode) qb = qb.andWhere('act.subjcode = :subjcode', { subjcode });
    if (section)  qb = qb.andWhere('act.section  = :section',  { section });
    if (sy)       qb = qb.andWhere('act.sy       = :sy',       { sy });
    if (sem)      qb = qb.andWhere('act.sem      = :sem',      { sem });

    const rows = await qb.groupBy('rs.masterlist_id').getRawMany();

    const map: Record<number, number> = {};
    rows.forEach((r) => {
      const pct = parseFloat(r.partial_pct);
      map[Number(r.masterlist_id)] = isNaN(pct) ? 0 : Math.round(pct * 10) / 10;
    });
    return map;
  }

  // ══════════════════════════════════════════════════════════════════
  // HELPER: CO-level features per student
  //
  // IMPORTANT: Only COs that have actual raw score entries are included.
  // COs with no scores are completely ignored — they do NOT count as
  // failed. This prevents penalising students for assessments not yet
  // held.
  //
  // _total_cos = count of COs with score data (not total syllabus COs).
  // Used by predictBatch to calculate the confidence ratio.
  // ══════════════════════════════════════════════════════════════════
  private async _computeCoFeatures(masterlistIds: number[]) {
    if (!masterlistIds.length) return {};

    const coRows = await this.rawScoreRepo
      .createQueryBuilder('rs')
      .innerJoin('rs.activity', 'act')
      .innerJoin('act.courseOutcome', 'co')
      .select('rs.masterlist_id',  'masterlist_id')
      .addSelect('co.co_id',       'co_id')
      .addSelect('co.co_code',     'co_code')
      .addSelect('SUM(rs.score)',   'sum_score')
      .addSelect('SUM(act.max_score)', 'sum_max')
      .addSelect(
        '(SUM(rs.score)::float / NULLIF(SUM(act.max_score), 0)) * 100',
        'co_pct',
      )
      .where('rs.masterlist_id IN (:...ids)', { ids: masterlistIds })
      .andWhere('act.co_id IS NOT NULL')
      .groupBy('rs.masterlist_id')
      .addGroupBy('co.co_id')
      .addGroupBy('co.co_code')
      .getRawMany();

    const coTypeRows = await this.rawScoreRepo
      .createQueryBuilder('rs')
      .innerJoin('rs.activity', 'act')
      .innerJoin('act.courseOutcome', 'co')
      .leftJoin('act.assessmentType', 'atype')
      .select('rs.masterlist_id',  'masterlist_id')
      .addSelect('co.co_code',     'co_code')
      .addSelect('COALESCE(atype.name, act.category, act.activity_name)', 'assess_name')
      .addSelect('SUM(rs.score)',   'sum_score')
      .addSelect('SUM(act.max_score)', 'sum_max')
      .addSelect(
        '(SUM(rs.score)::float / NULLIF(SUM(act.max_score), 0)) * 100',
        'type_pct',
      )
      .where('rs.masterlist_id IN (:...ids)', { ids: masterlistIds })
      .andWhere('act.co_id IS NOT NULL')
      .groupBy('rs.masterlist_id')
      .addGroupBy('co.co_code')
      .addGroupBy('atype.name')
      .addGroupBy('act.category')
      .addGroupBy('act.activity_name')
      .getRawMany();

    const grouped: Record<number, Array<{ co_code: string; co_pct: number }>> = {};
    coRows.forEach((r) => {
      const mlId = Number(r.masterlist_id);
      if (!grouped[mlId]) grouped[mlId] = [];
      grouped[mlId].push({ co_code: r.co_code, co_pct: parseFloat(r.co_pct) || 0 });
    });

    const typeGrouped: Record<number, Record<string, string[]>> = {};
    const TYPE_THRESHOLD = 60;
    coTypeRows.forEach((r) => {
      const mlId = Number(r.masterlist_id);
      const pct  = parseFloat(r.type_pct) || 0;
      if (pct >= TYPE_THRESHOLD) return;
      if (!typeGrouped[mlId]) typeGrouped[mlId] = {};
      if (!typeGrouped[mlId][r.co_code]) typeGrouped[mlId][r.co_code] = [];
      const name = r.assess_name || 'Unknown';
      if (!typeGrouped[mlId][r.co_code].includes(name)) {
        typeGrouped[mlId][r.co_code].push(name);
      }
    });

    const CO_PASS_THRESHOLD = 60;
    const result: Record<number, ReturnType<typeof this._emptyCoFeatures>> = {};

    for (const mlId of masterlistIds) {
      const cos = grouped[mlId] || [];
      if (!cos.length) { result[mlId] = this._emptyCoFeatures(); continue; }

      const scores = cos.map((c) => c.co_pct);
      const failed  = cos.filter((c) => c.co_pct < CO_PASS_THRESHOLD);
      const passed  = cos.length - failed.length;

      const weakCoDetails: Record<string, string[]> = {};
      failed.forEach((c) => {
        weakCoDetails[c.co_code] = (typeGrouped[mlId]?.[c.co_code]) || [];
      });

      result[mlId] = {
        co_pass_rate:    passed / cos.length,
        num_cos_failed:  failed.length,
        min_co_score:    Math.min(...scores),
        avg_co_score:    scores.reduce((a, b) => a + b, 0) / scores.length,
        weak_cos:        failed.map((c) => c.co_code),
        weak_co_details: weakCoDetails,
        _total_cos:      cos.length,   // COs that have score data
      };
    }
    return result;
  }

  private async _getActivitiesBelow60Map(masterlistIds: number[]) {
    if (!masterlistIds.length) return {} as Record<number, number>;

    const rows = await this.rawScoreRepo
      .createQueryBuilder('rs')
      .innerJoin('rs.activity', 'act')
      .select('rs.masterlist_id', 'masterlist_id')
      .addSelect(
        `COUNT(CASE WHEN act.max_score > 0 AND (rs.score::float / act.max_score) * 100 < 60 THEN 1 END)`,
        'below_count',
      )
      .where('rs.masterlist_id IN (:...ids)', { ids: masterlistIds })
      .groupBy('rs.masterlist_id')
      .getRawMany();

    const map: Record<number, number> = {};
    rows.forEach((r) => {
      map[Number(r.masterlist_id)] = parseInt(r.below_count, 10) || 0;
    });
    return map;
  }

  private _emptyCoFeatures() {
    return {
      co_pass_rate:    0,
      num_cos_failed:  0,
      min_co_score:    0,
      avg_co_score:    0,
      weak_cos:        [] as string[],
      weak_co_details: {} as Record<string, string[]>,
      _total_cos:      0,
    };
  }

  private _fallback(
    studid: any,
    twp: number,
    grade: any,
    remarks: any,
    weakCos: string[],
    extra: any = {},
  ) {
    let risk_level = 'Safe';
    let risk_score = 0;
    if (twp < 60)      { risk_level = 'Critical'; risk_score = 2; }
    else if (twp < 75) { risk_level = 'Warning';  risk_score = 1; }

    return {
      studid:           String(studid),
      risk_level,
      risk_score,
      fail_probability: risk_score === 2 ? 85 : risk_score === 1 ? 45 : 10,
      prob_safe:        risk_score === 0 ? 80 : 15,
      prob_warning:     risk_score === 1 ? 45 : 15,
      prob_critical:    risk_score === 2 ? 80 : 5,
      current_grade:    grade,
      remarks,
      weak_cos:         weakCos,
      weak_co_details:  {},
      source:           'fallback',
      ...extra,
    };
  }

  // ── Heatmap local fallback ─────────────────────────────────────────
  private _heatmapFallback(
    payload: Array<{ studid: string; student_name: string; co_scores: Record<string, number> }>,
  ) {
    const PASS_THRESHOLD = 60;
    const coSet = new Set<string>();
    for (const s of payload) {
      for (const co of Object.keys(s.co_scores)) coSet.add(co);
    }
    const cos = Array.from(coSet).sort();
    const coTotals: Record<string, number[]> = {};

    const studentsOut = payload.map((s) => {
      const scores = cos.map((co) => {
        const val = s.co_scores[co];
        const pct = val !== undefined ? Math.round(val * 10) / 10 : null;
        if (pct !== null) {
          if (!coTotals[co]) coTotals[co] = [];
          coTotals[co].push(pct);
        }
        return {
          co, pct,
          status: pct !== null ? (pct >= PASS_THRESHOLD ? 'pass' : 'fail') : 'missing',
        };
      });
      const validScores = scores.filter((s) => s.pct !== null);
      const avg = validScores.length > 0
        ? Math.round(validScores.reduce((sum, s) => sum + s.pct!, 0) / validScores.length * 10) / 10
        : 0;
      return { studid: s.studid, student_name: s.student_name, scores, avg_score: avg };
    });

    studentsOut.sort((a, b) => a.avg_score - b.avg_score);

    const coSummary = cos.map((co) => {
      const vals = coTotals[co] || [];
      const passCount = vals.filter((v) => v >= PASS_THRESHOLD).length;
      return {
        co,
        class_avg:  vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : null,
        pass_count: passCount,
        total:      vals.length,
        pass_rate:  vals.length > 0 ? Math.round(passCount / vals.length * 1000) / 10 : 0,
      };
    });

    return { cos, students: studentsOut, co_summary: coSummary };
  }

  // ── Trajectory local fallback ──────────────────────────────────────
  private _trajectoryFallback(
    payload: Array<{ studid: string; student_name: string; assessments: Array<{ label: string; co: string | null; pct: number | null }> }>,
  ) {
    const PASS_THRESHOLD = 60;
    const allLabels: string[] = [];
    const seenLabels = new Set<string>();
    for (const student of payload) {
      for (const a of student.assessments) {
        if (a.label && !seenLabels.has(a.label)) {
          allLabels.push(a.label);
          seenLabels.add(a.label);
        }
      }
    }

    const results = payload.map((student) => {
      const labelMap: Record<string, { label: string; co: string | null; pct: number | null }> = {};
      for (const a of student.assessments) { labelMap[a.label] = a; }

      const points: Array<{ label: string; co: string | null; pct: number | null; running_avg: number; status: string }> = [];
      let runningTotal = 0;
      let runningCount = 0;

      for (const label of allLabels) {
        const a = labelMap[label];
        if (a && a.pct !== null) {
          runningTotal += a.pct;
          runningCount++;
          points.push({
            label, co: a.co,
            pct:         Math.round(a.pct * 10) / 10,
            running_avg: Math.round((runningTotal / runningCount) * 10) / 10,
            status:      a.pct >= PASS_THRESHOLD ? 'pass' : 'fail',
          });
        } else {
          points.push({
            label, co: null, pct: null,
            running_avg: runningCount > 0 ? Math.round((runningTotal / runningCount) * 10) / 10 : 0,
            status: 'missing',
          });
        }
      }

      const pcts = points.filter((p) => p.pct !== null).map((p) => p.pct!);
      const mid  = Math.floor(pcts.length / 2);
      let trend  = 'stable';
      if (mid > 0 && pcts.length > mid) {
        const firstAvg  = pcts.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
        const secondAvg = pcts.slice(mid).reduce((a, b) => a + b, 0) / (pcts.length - mid);
        const diff      = secondAvg - firstAvg;
        trend = diff > 5 ? 'improving' : diff < -5 ? 'declining' : 'stable';
      }

      const lastThree = pcts.slice(-3);
      return {
        studid:       student.studid,
        student_name: student.student_name,
        points, trend,
        latest_avg:  lastThree.length > 0 ? Math.round(lastThree.reduce((a, b) => a + b, 0) / lastThree.length * 10) / 10 : 0,
        overall_avg: pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length * 10) / 10 : 0,
      };
    });

    const trendOrder: Record<string, number> = { declining: 0, stable: 1, improving: 2 };
    results.sort(
      (a, b) => (trendOrder[a.trend] ?? 1) - (trendOrder[b.trend] ?? 1) || a.latest_avg - b.latest_avg,
    );

    return { labels: allLabels, students: results };
  }
}