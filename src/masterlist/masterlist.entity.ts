import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../user/user.entity';
import { Grade } from 'src/grade/grade.entity'; 

@Entity({ name: 'masterlist' })
export class Masterlist {
  @PrimaryGeneratedColumn()
  masterlist_id: number;

  @ManyToOne(() => Employee, (employee) => employee.masterlists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'varchar', length: 50 })
  sy: string;

  @Column({ type: 'varchar', length: 50 })
  sem: string;

  @Column({ type: 'varchar', length: 50 })
  subjcode: string;

  @Column({ type: 'varchar', length: 50 })
  section: string;

  @Column({ type: 'varchar', length: 50 })
  studid: string;

  @Column({ type: 'varchar', length: 100 })
  stud_lastname: string;

  @Column({ type: 'varchar', length: 100 })
  stud_firstname: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stud_middlename: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  stud_extname: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => Grade, (grade) => grade.masterlist)
  grades: Grade[];
}
