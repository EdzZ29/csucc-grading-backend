import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { RawScore } from '../raw-score/raw-score.entity';
import { FinalGrade } from '../obe/final-grade.entity';
import { Masterlist } from '../masterlist/masterlist.entity';
export declare class PredictionService {
    private readonly httpService;
    private rawScoreRepo;
    private finalGradeRepo;
    private masterlistRepo;
    private readonly logger;
    constructor(httpService: HttpService, rawScoreRepo: Repository<RawScore>, finalGradeRepo: Repository<FinalGrade>, masterlistRepo: Repository<Masterlist>);
    trainModel(): Promise<any>;
    predictRisk(masterlistId: number): Promise<any>;
    predictBatch(subjcode: string, section: string, sy: string, sem: string): Promise<any[] | {
        error: string;
    }>;
    getCoHeatmap(subjcode: string, section: string, sy: string, sem: string): Promise<any>;
    getTrajectory(subjcode: string, section: string, sy: string, sem: string): Promise<any>;
    private _computePartialWeightedPercent;
    private _computeCoFeatures;
    private _getActivitiesBelow60Map;
    private _emptyCoFeatures;
    private _fallback;
    private _heatmapFallback;
    private _trajectoryFallback;
}
