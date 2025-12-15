import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassActivity } from './class-activity.entity';
import { RawScore } from '../raw-score/raw-score.entity';
import { Masterlist } from '../masterlist/masterlist.entity';
import { SaveGradebookDto } from './dto/save-gradebook.dto';

@Injectable()
export class ClassActivityService {
  constructor(
    @InjectRepository(ClassActivity)
    private activityRepo: Repository<ClassActivity>,

    @InjectRepository(RawScore)
    private scoreRepo: Repository<RawScore>,

    @InjectRepository(Masterlist)
    private masterlistRepo: Repository<Masterlist>,
  ) {}

  // 1. Fetch Data for the Frontend Grid
  async getGradebook(subjcode: string, section: string, category: string) {
    return this.activityRepo.find({
      where: { subjcode, section, category },
      relations: ['scores', 'scores.student'], // Eager load scores + student info
      order: { activity_id: 'ASC' },
    });
  }

  // 2. Save Data from the Frontend Grid
  async saveGradebook(dto: SaveGradebookDto) {
    const { subjcode, section, category, grading_type, activities } = dto;

    for (const actDto of activities) {
      // ---------------------------------------------------------
      // Step A: Upsert the Activity Column (Quiz 1, Quiz 2...)
      // ---------------------------------------------------------
      let activity: ClassActivity;

      // If frontend sent an ID, try to find it
      if (actDto.activity_id) {
        activity = await this.activityRepo.findOne({
          where: { activity_id: actDto.activity_id },
        });
      }

      // If not found or new, create it
      if (!activity) {
        activity = this.activityRepo.create({
          subjcode,
          section,
          category,
          grading_type,
        });
      }

      // Update name and max score
      activity.activity_name = actDto.name;
      activity.max_score = actDto.maxScore;

      const savedActivity = await this.activityRepo.save(activity);

      // ---------------------------------------------------------
      // Step B: Save the Scores (The Cells)
      // ---------------------------------------------------------
      for (const scoreEntry of actDto.scores) {
        // ➤ CRITICAL: Get the masterlist_id based on Student ID + Class Context
        // This ensures we are grading the correct student for THIS specific class.
        const studentRecord = await this.masterlistRepo.findOne({
          where: {
            studid: scoreEntry.studentId, // From payload
            subjcode: subjcode, // From payload context
            section: section, // From payload context
          },
        });

        // Only save if the student actually exists in this class
        if (studentRecord) {
          // Check if a score already exists for this Activity + Student
          let rawScore = await this.scoreRepo.findOne({
            where: {
              activity_id: savedActivity.activity_id,
              masterlist_id: studentRecord.masterlist_id, // ➤ Uses the PK we just found
            },
          });

          // If new score, create instance
          if (!rawScore) {
            rawScore = this.scoreRepo.create({
              activity: savedActivity,
              student: studentRecord, // TypeORM handles the relationship via object or ID
              masterlist_id: studentRecord.masterlist_id,
            });
          }

          // Update the score value
          // We allow 0, but check for null/undefined to skip empty inputs
          if (scoreEntry.score !== null && scoreEntry.score !== undefined) {
            rawScore.score = scoreEntry.score;
            await this.scoreRepo.save(rawScore);
          }
        } else {
          console.warn(
            `Student ${scoreEntry.studentId} not found in ${subjcode} - ${section}`,
          );
        }
      }
    }

    return { success: true, message: 'Gradebook saved successfully' };
  }

  async deleteActivity(activityId: number) {
    // 1. First delete scores linked to this activity (if cascade isn't set in DB)
    await this.scoreRepo.delete({ activity: { activity_id: activityId } });

    // 2. Delete the activity itself
    const result = await this.activityRepo.delete(activityId);

    if (result.affected === 0) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }

    return { success: true, message: 'Activity deleted successfully' };
  }
}
