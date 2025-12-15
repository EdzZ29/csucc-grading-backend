import { RawScoreService } from './raw-score.service';
export declare class RawScoreController {
    private readonly rawScoreService;
    constructor(rawScoreService: RawScoreService);
    create(createRawScoreDto: any): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateRawScoreDto: any): string;
    remove(id: string): string;
}
