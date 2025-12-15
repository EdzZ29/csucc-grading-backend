// src/scripts/employee-seeder.ts
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Employee, EmpRole } from '../employee/employee.entity';
import { Masterlist } from '../masterlist/masterlist.entity'; // ✅ 1. Import Masterlist

dotenv.config();

const seedEmployees = async () => {
  // 1. Setup Data Source
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_DATABASE || 'csucc-grading',
    entities: [Employee, Masterlist],
    synchronize: false,
  });

  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected for Employee seeding...');

    const employeeRepo = AppDataSource.getRepository(Employee);

    // 2. Prepare Data
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('123456', salt);

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
        email: 'chancellor@csucc.edu.ph',
        role: EmpRole.CHANCELLOR,
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

    // 3. Insert Data
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
    // Check if initialized before destroying to avoid the second error in your logs
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

seedEmployees();