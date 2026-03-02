"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveRemarks = exports.transmuteGrade = exports.FAILING_GRADE = exports.TRANSMUTATION_TABLE = void 0;
exports.TRANSMUTATION_TABLE = [
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
exports.FAILING_GRADE = 5.0;
function transmuteGrade(weightedPercent) {
    for (const row of exports.TRANSMUTATION_TABLE) {
        if (weightedPercent >= row.minPercent)
            return row.grade;
    }
    return exports.FAILING_GRADE;
}
exports.transmuteGrade = transmuteGrade;
function deriveRemarks(numericalGrade) {
    return numericalGrade <= 3.0 ? 'PASSED' : 'FAILED';
}
exports.deriveRemarks = deriveRemarks;
//# sourceMappingURL=transmutation-table.js.map