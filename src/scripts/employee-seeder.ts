/* eslint-disable prettier/prettier */
// src/scripts/employee-seeder.ts
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Employee, EmpRole } from '../employee/employee.entity';
import { Masterlist } from '../masterlist/masterlist.entity';

// ✅ 1. Import the new OBE entities to prevent relation errors
import { CourseOutcome } from '../obe/course-outcome.entity';
import { TosWeight } from '../obe/tos-weight.entity';
import { AssessmentType } from '../obe/assessment-type.entity';
import { ClassActivity } from '../obe/class-activity.entity';
import { RawScore } from '../obe/raw-score.entity';
import { FinalGrade } from '../obe/final-grade.entity';

dotenv.config();

const seedEmployees = async () => {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3000,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_DATABASE || 'csucc-grading',
    // ✅ 2. Add ALL entities here.
    // TypeORM needs the full graph to resolve relations in Employee/Masterlist.
    entities: [
      Employee,
      Masterlist,
      CourseOutcome,
      TosWeight,
      AssessmentType,
      ClassActivity,
      RawScore,
      FinalGrade,
    ],
    synchronize: false, // Keep false to avoid accidental schema wipes
  });

  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected for Employee seeding...');

    try {
      // Fix PostgreSQL enum for Chairperson role dynamically
      await AppDataSource.query(`ALTER TYPE employee_role_enum RENAME VALUE 'Chancellor' TO 'Chairperson'`);
      console.log('✅ Migrated enum Chancellor to Chairperson');
    } catch (e) {
      // Ignore error if already renamed or type does not exist
    }

    const employeeRepo = AppDataSource.getRepository(Employee);

    // 3. Prepare Data
    // Note: Salt rounds 10 is standard for performance vs security
    const hashedPassword = await bcrypt.hash('123456', 10);

    const employeesToSeed = [
      {
        firstname: 'Edz',
        lastname: 'Ederio',
        email: 'admin@csucc.edu.ph',
        role: EmpRole.ADMIN,
        password: hashedPassword,
        isactive: true,
      },
      {
        firstname: 'Juan',
        lastname: 'Dela Cruz',
        email: 'instructor@csucc.edu.ph',
        role: EmpRole.INSTRUCTOR,
        password: hashedPassword,
        isactive: true,
      },
      {
        firstname: 'Maria',
        lastname: 'Clara',
        email: 'dean@csucc.edu.ph',
        role: EmpRole.DEAN,
        password: hashedPassword,
        isactive: true,
      },
      {
        firstname: 'Andres',
        lastname: 'Bonifacio',
        email: 'chairperson@csucc.edu.ph',
        role: EmpRole.CHAIRPERSON,
        password: hashedPassword,
        isactive: true,
      },
      {
        firstname: 'Jose',
        lastname: 'Rizal',
        email: 'guidance@csucc.edu.ph',
        role: EmpRole.GUIDANCE,
        password: hashedPassword,
        isactive: true,
      },
    ];

    // 4. Insert Data
    for (const data of employeesToSeed) {
      const existing = await employeeRepo.findOneBy({ email: data.email });
      if (!existing) {
        const newEmployee = employeeRepo.create(data);
        await employeeRepo.save(newEmployee);
        console.log(`✅ Created employee: ${data.email} [${data.role}]`);
      } else {
        console.log(`⚠️  Skipped: ${data.email} (Already exists)`);
      }
    }

    console.log('🚀 Employee seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

seedEmployees();
