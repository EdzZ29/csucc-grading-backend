/**
 * ═══════════════════════════════════════════════════════════════
 * TRANSMUTATION TABLE — matches OBE Excel VLOOKUP in FINAL GRADE!$AA$23:$AC$40
 *
 * Excel table:
 *   %   | Grade | Letter
 *   97  | 1.00  | A
 *   93  | 1.25  | A-
 *   89  | 1.50  | B+
 *   85  | 1.75  | B
 *   80  | 2.00  | B-
 *   75  | 2.25  | C+
 *   70  | 2.50  | C
 *   65  | 2.75  | C-
 *   60  | 3.00  | D
 *   <60 | 5.00  | E
 * ═══════════════════════════════════════════════════════════════
 */
export const TRANSMUTATION_TABLE: { minPercent: number; grade: number }[] = [
  { minPercent: 97, grade: 1.0 },
  { minPercent: 93, grade: 1.25 },
  { minPercent: 89, grade: 1.5 },
  { minPercent: 85, grade: 1.75 },
  { minPercent: 80, grade: 2.0 },
  { minPercent: 75, grade: 2.25 },
  { minPercent: 70, grade: 2.5 },
  { minPercent: 65, grade: 2.75 },
  { minPercent: 60, grade: 3.0 },
];

export const FAILING_GRADE = 5.0;

/** CO pass threshold — Excel: IF(G23 > ($G$21 * 0.6 * 100) - 0.01, "PASSED", "-") */
export const CO_PASS_THRESHOLD = 0.6;

export function transmuteGrade(weightedPercent: number): number {
  for (const row of TRANSMUTATION_TABLE) {
    if (weightedPercent >= row.minPercent) return row.grade;
  }
  return FAILING_GRADE;
}

/**
 * OBE remarks logic from Excel:
 *   =IF(E23 < 3.01, IF(COUNTIF(H23:V23,"PASSED") = numCOs, "PASSED", "INC"), "FAILED")
 *
 * - Grade ≤ 3.00 AND all COs passed → "PASSED"
 * - Grade ≤ 3.00 BUT missed 1+ COs → "INC"
 * - Grade > 3.00                    → "FAILED"
 */
export function deriveRemarks(numericalGrade: number, allCosPassed: boolean = true): string {
  if (numericalGrade <= 3.0) {
    return allCosPassed ? 'PASSED' : 'INC';
  }
  return 'FAILED';
}