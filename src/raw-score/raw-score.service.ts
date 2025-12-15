import { Injectable } from '@nestjs/common';

@Injectable()
export class RawScoreService {
  create(createRawScoreDto: any) {
    return 'This action adds a new rawScore';
  }

  findAll() {
    return `This action returns all rawScore`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rawScore`;
  }

  update(id: number, updateRawScoreDto: any) {
    return `This action updates a #${id} rawScore`;
  }

  remove(id: number) {
    return `This action removes a #${id} rawScore`;
  }
}
