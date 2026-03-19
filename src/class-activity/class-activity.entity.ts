/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RawScore } from '../obe/raw-score.entity';
import { CourseOutcome } from '../obe/course-outcome.entity';
import { AssessmentType } from '../obe/assessment-type.entity';

@Entity('class_activity')
export class ClassActivity {
  @PrimaryGeneratedColumn()
  activity_id: number;

  // ── Class identifiers ─────────────────────────────────────────
  // These are stored directly on each activity row so that
  // prediction queries can filter by class without any extra joins.
  @Column({ nullable: false })
  subjcode: string;

  @Column({ nullable: false })
  section: string;

  @Column({ nullable: true })
  sy: string;

  @Column({ nullable: true })
  sem: string;

  // ── Instructor / ownership ────────────────────────────────────
  @Column({ nullable: true })
  empid: number;

  // ── Course Outcome link ───────────────────────────────────────
  // Nullable because an activity can exist before a CO is assigned.
  // The prediction service filters with `act.co_id IS NOT NULL`
  // so activities without a CO are excluded from CO-feature computation.
  @Column({ nullable: true })
  co_id: number;

  // ── Assessment type link ──────────────────────────────────────
  @Column({ nullable: true })
  type_id: number;

  // ── Grading metadata ─────────────────────────────────────────
  // grading_type: e.g. "Prelim", "Midterm", "Finals"
  @Column({ nullable: true })
  grading_type: string;

  // category: the assessment type CODE (e.g. "QZ", "EXAM")
  // Kept for backward compatibility with older save-gradebook payloads.
  @Column({ nullable: true })
  category: string;

  // ── Activity details ──────────────────────────────────────────
  @Column({ nullable: false })
  activity_name: string;

  @Column({ nullable: false })
  max_score: number;

  // ── Relations ─────────────────────────────────────────────────
  @OneToMany(() => RawScore, (rs) => rs.activity, {
    cascade: true,
    eager: false,
  })
  scores: RawScore[];

  // Optional relation to CourseOutcome — used by prediction service
  // when it joins act.courseOutcome to get co_code.
  @ManyToOne(() => CourseOutcome, { nullable: true, eager: false })
  @JoinColumn({ name: 'co_id' })
  courseOutcome: CourseOutcome;

  // Optional relation to AssessmentType — used by prediction service
  // when it joins act.assessmentType to get type name for weak_co_details.
  @ManyToOne(() => AssessmentType, { nullable: true, eager: false })
  @JoinColumn({ name: 'type_id' })
  assessmentType: AssessmentType;
}