import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassActivity } from './class-activity.entity';
import { RawScore } from '../raw-score/raw-score.entity';
import { Masterlist } from '../masterlist/masterlist.entity';
import { FinalGrade } from 'src/final-grade/final-grade.entity';
import { SaveGradebookDto } from './dto/save-gradebook.dto';

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
  ) {}

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

    try {
      // STEP 1: Fetch Students
      this.logger.debug('Step 1: Fetching students...');
      const allStudents = await this.masterlistRepo.find({
        where: {
          subjcode: dto.subjcode,
          section: dto.section,
          sy: dto.sy,
          sem: dto.sem,
        },
      });
      this.logger.debug(`Step 1 Done. Found ${allStudents.length} students.`);

      const studentMap = new Map(allStudents.map((s) => [s.studid, s]));

      // STEP 2: Loop Activities
      for (const actDto of dto.activities) {
        this.logger.debug(`Step 2: Processing Activity: ${actDto.name}`);

        let activity: ClassActivity;

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
          });
        }

        activity.activity_name = actDto.name;
        activity.max_score = actDto.maxScore;
        const savedActivity = await this.activityRepo.save(activity);

        // STEP 3: Collect Scores
        const scoresToSave: RawScore[] = [];

        // Fetch existing scores for this activity to enable updates
        const existingScores = await this.scoreRepo.find({
          where: { activity: { activity_id: savedActivity.activity_id } },
          relations: ['student'],
        });
        const existingScoreMap = new Map(
          existingScores.map((s) => [s.student.studid, s]),
        );

        for (const scoreEntry of actDto.scores) {
          const student = studentMap.get(scoreEntry.studentId);
          if (student) {
            // Check if score is provided (accepts 0 and null)
            if (scoreEntry.score !== undefined) {
              let rawScore = existingScoreMap.get(scoreEntry.studentId);

              if (!rawScore) {
                // Create new if doesn't exist
                rawScore = this.scoreRepo.create({
                  activity: savedActivity,
                  student: student,
                  masterlist_id: student.masterlist_id,
                  score: scoreEntry.score,
                });
              } else {
                // Update existing
                rawScore.score = scoreEntry.score;
              }
              scoresToSave.push(rawScore);
            }
          }
        }

        // STEP 4: Bulk Save Scores
        if (scoresToSave.length > 0) {
          await this.scoreRepo.save(scoresToSave);
        }
      }

      this.logger.log('[SUCCESS] Gradebook saved.');
      return { success: true, message: 'Scores saved successfully' };
    } catch (error) {
      this.logger.error('[ERROR] Failed to save gradebook', error.stack);
      throw error;
    }
  }

  async saveFinalGradesOnly(dto: SaveGradebookDto) {
    this.logger.log(`Saving final grades for ${dto.subjcode}`);
    // [Optimization] Use save directly if IDs are handled, or findOne logic as before
    // Keeping your logic but wrapping in try/catch
    try {
      const { subjcode, section, sy, sem, finalGrades } = dto;
      if (!finalGrades || finalGrades.length === 0) return { success: true };

      const students = await this.masterlistRepo.find({
        where: { subjcode, section, sy, sem },
      });
      const studentMap = new Map(students.map((s) => [s.studid, s]));

      for (const fg of finalGrades) {
        const student = studentMap.get(fg.studentId);
        if (student) {
          let finalGradeEntry = await this.finalGradeRepo.findOne({
            where: { masterlist_id: student.masterlist_id },
          });

          if (!finalGradeEntry) {
            finalGradeEntry = this.finalGradeRepo.create({
              masterlist_id: student.masterlist_id,
              student: student,
            });
          }
          finalGradeEntry.final_weighted_score = fg.weightedScore;
          finalGradeEntry.final_numerical_grade = fg.numericalGrade;
          finalGradeEntry.remarks = fg.remarks;
          await this.finalGradeRepo.save(finalGradeEntry);
        }
      }
      return { success: true, message: 'Final grades saved' };
    } catch (error) {
      this.logger.error('Failed to save final grades', error.stack);
      throw error;
    }
  }

  async deleteActivity(activityId: number) {
    await this.scoreRepo.delete({ activity: { activity_id: activityId } });
    const result = await this.activityRepo.delete(activityId);
    if (result.affected === 0)
      throw new NotFoundException(`Activity ID ${activityId} not found`);
    return { success: true, message: 'Activity deleted successfully' };
  }
}
