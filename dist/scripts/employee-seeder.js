"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const employee_entity_1 = require("../employee/employee.entity");
const masterlist_entity_1 = require("../masterlist/masterlist.entity");
dotenv.config();
const seedEmployees = async () => {
    const AppDataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'admin',
        database: process.env.DB_DATABASE || 'csucc-grading',
        entities: [employee_entity_1.Employee, masterlist_entity_1.Masterlist],
        synchronize: false,
    });
    try {
        await AppDataSource.initialize();
        console.log('📦 Database connected for Employee seeding...');
        const employeeRepo = AppDataSource.getRepository(employee_entity_1.Employee);
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('123456', salt);
        const employeesToSeed = [
            {
                firstname: 'Edz',
                lastname: 'Ederio',
                email: 'admin@csucc.edu.ph',
                role: employee_entity_1.EmpRole.ADMIN,
                password: hashedPassword,
                isactive: true,
            },
            {
                firstname: 'Juan',
                lastname: 'Dela Cruz',
                email: 'instructor@csucc.edu.ph',
                role: employee_entity_1.EmpRole.INSTRUCTOR,
                password: hashedPassword,
                isactive: true,
            },
            {
                firstname: 'Maria',
                lastname: 'Clara',
                email: 'dean@csucc.edu.ph',
                role: employee_entity_1.EmpRole.DEAN,
                password: hashedPassword,
                isactive: true,
            },
            {
                firstname: 'Andres',
                lastname: 'Bonifacio',
                email: 'chancellor@csucc.edu.ph',
                role: employee_entity_1.EmpRole.CHANCELLOR,
                password: hashedPassword,
                isactive: true,
            },
            {
                firstname: 'Jose',
                lastname: 'Rizal',
                email: 'guidance@csucc.edu.ph',
                role: employee_entity_1.EmpRole.GUIDANCE,
                password: hashedPassword,
                isactive: true,
            },
        ];
        for (const data of employeesToSeed) {
            const existing = await employeeRepo.findOneBy({ email: data.email });
            if (!existing) {
                const newEmployee = employeeRepo.create(data);
                await employeeRepo.save(newEmployee);
                console.log(`✅ Created employee: ${data.email} [${data.role}]`);
            }
            else {
                console.log(`⚠️  Skipped: ${data.email} (Already exists)`);
            }
        }
        console.log('🚀 Employee seeding complete!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
    }
    finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
};
seedEmployees();
//# sourceMappingURL=employee-seeder.js.map