import { gradesRepository } from './grades.repository.js';

export interface CourseGradeItem {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  units: number;
  prelimGrade: string | null;
  midtermGrade: string | null;
  finalGrade: string | null;
  status: 'passed' | 'failed' | 'in_progress';
}

export interface StudentGradesSummary {
  academicYear: string;
  semester: number;
  termGwa: string | null;
  cumulativeGwa: string | null;
  completedUnits: number;
  totalEnrolledUnits: number;
  curriculumRequiredUnits: number;
  curriculumProgressPercent: number;
  courses: CourseGradeItem[];
}

const TOTAL_CURRICULUM_UNITS = 146; // QCU CCS standard curriculum units

export const gradesService = {
  async getStudentGrades(
    studentId: string,
    academicYear = '2026-2027',
    semester = 1
  ): Promise<StudentGradesSummary> {
    const [enrolled, termGrades, allCompleted] = await Promise.all([
      gradesRepository.findStudentEnrollments(studentId, academicYear, semester),
      gradesRepository.findStudentGradesByTerm(studentId, academicYear, semester),
      gradesRepository.findAllCompletedGrades(studentId),
    ]);

    // Map courses by courseId
    const courseMap = new Map<string, CourseGradeItem>();

    for (const item of enrolled) {
      courseMap.set(item.courseId, {
        courseId: item.courseId,
        courseCode: item.courseCode,
        courseTitle: item.courseTitle,
        units: item.units,
        prelimGrade: null,
        midtermGrade: null,
        finalGrade: null,
        status: 'in_progress',
      });
    }

    // Attach grade records
    for (const g of termGrades) {
      const existing = courseMap.get(g.courseId);
      if (existing) {
        if (g.period === 'Prelims') existing.prelimGrade = g.grade;
        if (g.period === 'Midterms') existing.midtermGrade = g.grade;
        if (g.period === 'Finals') {
          existing.finalGrade = g.grade;
          if (g.grade) {
            const num = parseFloat(g.grade);
            existing.status = num <= 3.0 ? 'passed' : 'failed';
          }
        }
      }
    }

    const courseList = Array.from(courseMap.values());

    // 1. Calculate Term GWA (based on Finals where available, or Midterms if Finals not yet released)
    let termGradePoints = 0;
    let termGradedUnits = 0;
    let totalEnrolledUnits = 0;

    for (const c of courseList) {
      totalEnrolledUnits += c.units;
      const effectiveGradeStr = c.finalGrade ?? c.midtermGrade;
      if (effectiveGradeStr) {
        const gradeVal = parseFloat(effectiveGradeStr);
        if (!isNaN(gradeVal)) {
          termGradePoints += gradeVal * c.units;
          termGradedUnits += c.units;
        }
      }
    }

    const termGwa =
      termGradedUnits > 0
        ? (termGradePoints / termGradedUnits).toFixed(2)
        : null;

    // 2. Cumulative GWA and Total Passed Units
    let cumulativePoints = 0;
    let cumulativeUnits = 0;
    let totalPassedUnits = 0;

    // Filter to finals
    const finalGrades = allCompleted.filter((g) => g.period === 'Finals' && g.grade);
    for (const g of finalGrades) {
      const val = parseFloat(g.grade!);
      if (!isNaN(val)) {
        cumulativePoints += val * g.units;
        cumulativeUnits += g.units;
        if (val <= 3.0) {
          totalPassedUnits += g.units;
        }
      }
    }

    const cumulativeGwa =
      cumulativeUnits > 0
        ? (cumulativePoints / cumulativeUnits).toFixed(2)
        : termGwa;

    const curriculumProgressPercent = Math.min(
      100,
      Math.round((totalPassedUnits / TOTAL_CURRICULUM_UNITS) * 100)
    );

    return {
      academicYear,
      semester,
      termGwa,
      cumulativeGwa,
      completedUnits: totalPassedUnits,
      totalEnrolledUnits,
      curriculumRequiredUnits: TOTAL_CURRICULUM_UNITS,
      curriculumProgressPercent,
      courses: courseList,
    };
  },
};
