/* eslint-disable prettier/prettier */
/**
 * ═══════════════════════════════════════════════════════════════
 * TRANSMUTATION TABLE — mirrors the OBE Excel "Transmutation Table" sheet
 * ═══════════════════════════════════════════════════════════════
 * Sorted descending so the first match wins.
 */
export const TRANSMUTATION_TABLE: { minPercent: number; grade: number }[] = [
  { minPercent: 97, grade: 1.0 },
  { minPercent: 94, grade: 1.25 },
  { minPercent: 91, grade: 1.5 },
  { minPercent: 88, grade: 1.75 },
  { minPercent: 85, grade: 2.0 },
  { minPercent: 82, grade: 2.25 },
  { minPercent: 79, grade: 2.5 },
  { minPercent: 76, grade: 2.75 },
  { minPercent: 75, grade: 3.0 },
];

export const FAILING_GRADE = 5.0;

export function transmuteGrade(weightedPercent: number): number {
  for (const row of TRANSMUTATION_TABLE) {
    if (weightedPercent >= row.minPercent) return row.grade;
  }
  return FAILING_GRADE;
}

export function deriveRemarks(numericalGrade: number): string {
  return numericalGrade <= 3.0 ? 'PASSED' : 'FAILED';
}