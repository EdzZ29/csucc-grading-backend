import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('assessment_types')
export class AssessmentType {
  @PrimaryGeneratedColumn()
  type_id: number;

  @Column({ type: 'varchar', length: 20 })
  code: string; // QZ, CA, ME

  @Column({ type: 'varchar', length: 100 })
  name: string; // Quiz, Case Analysis

  @Column({ type: 'int', nullable: true })
  empid?: number;
}
