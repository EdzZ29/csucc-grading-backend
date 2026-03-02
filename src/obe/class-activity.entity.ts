import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Relation,
} from 'typeorm';
import { CourseOutcome } from './course-outcome.entity';
import { AssessmentType } from './assessment-type.entity';
import type { RawScore } from './raw-score.entity';

/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED ClassActivity entity — single source of truth for the
 * `class_activity` table. Used by BOTH the obe/ module (syllabus
 * setup) and the class-activity/ module (gradebook CRUD + grading).
 *
 * Import path from class-activity module:
 *   import { ClassActivity } from '../obe/class-activity.entity';
 * ═══════════════════════════════════════════════════════════════
 */
@Entity('class_activity')
export class ClassActivity {
  @PrimaryGeneratedColumn()
  activity_id: number;

  // ── Context columns ────────────────────────────────────────
  @Column({ nullable: true })
  empid: number;

  @Column()
  subjcode: string;

  @Column()
  section: string;

  @Column({ nullable: true })
  sy: string;

  @Column({ nullable: true })
  sem: string;

  // ── OBE FK links (used by computation pipeline) ────────────
  @Column({ nullable: true })
  co_id: number;

  @Column({ nullable: true })
  type_id: number;

  // ── Descriptive fields (used by gradebook UI) ──────────────
  @Column({ type: 'varchar', length: 20, nullable: true })
  grading_type: string; // "Midterm" | "Final"

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string; // Assessment type code for quick filtering: "QZ","EX","CA"

  @Column()
  activity_name: string;

  @Column()
  max_score: number;

  // ── Relations ──────────────────────────────────────────────
  @ManyToOne(() => CourseOutcome, { nullable: true })
  @JoinColumn({ name: 'co_id' })
  courseOutcome: CourseOutcome;

  @ManyToOne(() => AssessmentType, { nullable: true })
  @JoinColumn({ name: 'type_id' })
  assessmentType: AssessmentType;

  @OneToMany('RawScore', 'activity')
  scores: Relation<RawScore[]>;
}
