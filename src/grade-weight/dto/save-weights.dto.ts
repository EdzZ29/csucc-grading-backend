export class WeightItemDto {
  category: string;
  percentage: number;
}

export class SaveWeightsDto {
  modified_by_empid: number;
  // Dynamic keys like "LECTURE", "LEC_LAB"
  weights: Record<string, WeightItemDto[]>;
}