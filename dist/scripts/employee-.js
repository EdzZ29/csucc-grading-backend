"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../user/user.entity");
const grade_entity_1 = require("../grade/grade.entity");
const masterlist_entity_1 = require("../masterlist/masterlist.entity");
const dotenv = require("dotenv");
dotenv.config();
const seedUsers = async () => {
    const AppDataSource = new typeorm_1.DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_DATABASE || 'csucc_grading_db',
        entities: [user_entity_1.Employee, grade_entity_1.Grade, masterlist_entity_1.Masterlist],
        synchronize: false,
    });
    try {
        await AppDataSource.initialize();
        console.log('📦 Database connected for seeding...');
        const employeeRepo = AppDataSource.getRepository(user_entity_1.Employee);
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('password', salt);
        const usersToSeed = [
            {
                employee_id: 1,
                firstname: 'Edz',
                lastname: 'Ederio',
                email: 'admin@csucc.edu.ph',
                role: user_entity_1.Role.ADMIN,
                password: hashedPassword,
                is_active: true,
            },
            {
                firstname: 'Juan',
                lastname: 'Cruz',
                email: 'instructor@csucc.edu.ph',
                role: user_entity_1.Role.INSTRUCTOR,
                password: hashedPassword,
                is_active: true,
            },
            {
                firstname: 'Maria',
                lastname: 'Clara',
                email: 'dean@csucc.edu.ph',
                role: user_entity_1.Role.DEAN,
                password: hashedPassword,
                is_active: true,
            },
            {
                firstname: 'Andres',
                lastname: 'Bonifacio',
                email: 'chancellor@csucc.edu.ph',
                role: user_entity_1.Role.CHANCELLOR,
                password: hashedPassword,
                is_active: true,
            },
            {
                firstname: 'Jose',
                lastname: 'Rizal',
                email: 'guidance@csucc.edu.ph',
                role: user_entity_1.Role.GUIDANCE,
                password: hashedPassword,
                is_active: true,
            },
        ];
        for (const userData of usersToSeed) {
            const existingUser = await employeeRepo.findOneBy({
                email: userData.email,
            });
            if (!existingUser) {
                const newUser = employeeRepo.create(userData);
                await employeeRepo.save(newUser);
                console.log(`✅ Created user: ${userData.email} [${userData.role}]`);
            }
            else {
                console.log(`⚠️  Skipped: ${userData.email} (Already exists)`);
            }
        }
        console.log('🚀 Seeding complete!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
    }
    finally {
        await AppDataSource.destroy();
    }
};
seedUsers();
//# sourceMappingURL=employee-.js.map