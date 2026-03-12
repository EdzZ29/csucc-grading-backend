"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveRemarks = exports.transmuteGrade = exports.CO_PASS_THRESHOLD = exports.FAILING_GRADE = exports.TRANSMUTATION_TABLE = void 0;
exports.TRANSMUTATION_TABLE = [
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
exports.FAILING_GRADE = 5.0;
exports.CO_PASS_THRESHOLD = 0.6;
function transmuteGrade(weightedPercent) {
    for (const row of exports.TRANSMUTATION_TABLE) {
        if (weightedPercent >= row.minPercent)
            return row.grade;
    }
    return exports.FAILING_GRADE;
}
exports.transmuteGrade = transmuteGrade;
function deriveRemarks(numericalGrade, allCosPassed = true) {
    if (numericalGrade <= 3.0) {
        return allCosPassed ? 'PASSED' : 'INC';
    }
    return 'FAILED';
}
exports.deriveRemarks = deriveRemarks;
//# sourceMappingURL=transmutation-table.js.map