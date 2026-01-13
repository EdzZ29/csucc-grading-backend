import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { RawScore } from '../raw-score/raw-score.entity';
export declare class PredictionService {
    private readonly httpService;
    private rawScoreRepo;
    private readonly logger;
    constructor(httpService: HttpService, rawScoreRepo: Repository<RawScore>);
    trainModel(): Promise<any>;
    predictRisk(masterlistId: number): Promise<any>;
}
