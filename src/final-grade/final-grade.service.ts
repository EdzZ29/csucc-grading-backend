import { Injectable } from '@nestjs/common';

@Injectable()
export class FinalGradeService {
  create(createFinalGradeDto: any) {
    return 'This action adds a new finalGrade';
  }

  findAll() {
    return `This action returns all finalGrade`;
  }

  findOne(id: number) {
    return `This action returns a #${id} finalGrade`;
  }

  update(id: number, updateFinalGradeDto: any) {
    return `This action updates a #${id} finalGrade`;
  }

  remove(id: number) {
    return `This action removes a #${id} finalGrade`;
  }
}
