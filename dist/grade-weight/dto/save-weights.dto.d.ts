export declare class WeightItemDto {
    category: string;
    percentage: number;
}
export declare class SaveWeightsDto {
    modified_by_empid: number;
    weights: Record<string, WeightItemDto[]>;
}
