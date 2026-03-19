import { PredictionService } from './prediction.service';
export declare class PredictionController {
    private readonly predictionService;
    constructor(predictionService: PredictionService);
    trainModel(): Promise<any>;
    getRisk(id: number): Promise<any>;
    getBatch(subjcode: string, section: string, sy: string, sem: string): Promise<any[] | {
        error: string;
    }>;
    getHeatmap(subjcode: string, section: string, sy: string, sem: string): Promise<any>;
    getTrajectory(subjcode: string, section: string, sy: string, sem: string): Promise<any>;
}
