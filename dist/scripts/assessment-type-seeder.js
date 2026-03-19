"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
const assessment_type_entity_1 = require("../obe/assessment-type.entity");
dotenv.config();
const seedAssessmentTypes = async () => {
    const AppDataSource = new typeorm_1.DataSource(process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [assessment_type_entity_1.AssessmentType],
            synchronize: false,
            ssl: { rejectUnauthorized: false },
        }
        : {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3000,
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'admin',
            database: process.env.DB_NAME || 'csucc-grading',
            entities: [assessment_type_entity_1.AssessmentType],
            synchronize: false,
            ssl: false,
        });
    try {
        await AppDataSource.initialize();
        console.log('✅ Connected to database');
        const repo = AppDataSource.getRepository(assessment_type_entity_1.AssessmentType);
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
            }
            else {
                console.log(`⚠️  Skipped: ${t.code} (Already exists)`);
            }
        }
        console.log('✨ Seeding complete!');
    }
    catch (err) {
        console.error('❌ Seeding failed:', err);
    }
    finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
};
seedAssessmentTypes();
//# sourceMappingURL=assessment-type-seeder.js.map