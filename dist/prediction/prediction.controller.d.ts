import { PredictionService } from './prediction.service';
export declare class PredictionController {
    private readonly predictionService;
    constructor(predictionService: PredictionService);
    trainModel(): Promise<any>;
    getRisk(id: number): Promise<any>;
}
