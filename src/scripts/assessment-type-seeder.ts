/* eslint-disable prettier/prettier */
// src/scripts/assessment-type-seeder.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { AssessmentType } from '../obe/assessment-type.entity';

dotenv.config();

const seedAssessmentTypes = async () => {
  // ✅ Explicitly define the full DataSourceOptions
  const AppDataSource = new DataSource({
    type: 'postgres', // This resolves the 'SpannerConnectionOptions' error
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_DATABASE || 'csucc-grading',
    entities: [AssessmentType],
    synchronize: false,
  });

  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(AssessmentType);

    const types = [
      { name: 'Case Analysis', code: 'CA' },
      { name: 'Community Immersion', code: 'CIS' },
      { name: 'Debate/Oral Defense', code: 'DBT' },
      { name: 'E-Portfolio', code: 'EPF' },
      { name: 'Final Examination', code: 'FE' },
      { name: 'Focus Group/Interview', code: 'FG' },
      { name: 'Group Project', code: 'GP' },
      { name: 'Laboratory Task', code: 'LAB' },
      { name: 'Mapping Task', code: 'MP' },
      { name: 'Midterm Examination', code: 'ME' },
      { name: 'Peer Assessment', code: 'PA' },
      { name: 'Position Paper', code: 'PP' },
      { name: 'Practicum/Internship', code: 'PRC' },
      { name: 'Presentation/Demo', code: 'PR' },
      { name: 'Problem Set', code: 'PS' },
      { name: 'Project/Capstone', code: 'PRJ' },
      { name: 'Quiz/Test', code: 'QZ' },
      { name: 'Reflection Paper', code: 'RP' },
      { name: 'Research Writing/Study', code: 'RS' },
      { name: 'Self-Assessment', code: 'SAS' },
      { name: 'Short Answer Exam', code: 'SA' },
      { name: 'Simulation/Role-play', code: 'SIM' },
    ];

    console.log('🚀 Starting Assessment Type seeding...');

    for (const t of types) {
      const exists = await repo.findOneBy({ code: t.code });
      if (!exists) {
        await repo.save(repo.create(t));
        console.log(`✅ Seeded: ${t.name} (${t.code})`);
      } else {
        console.log(`⚠️  Skipped: ${t.code} (Already exists)`);
      }
    }
    console.log('✨ Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

seedAssessmentTypes();
