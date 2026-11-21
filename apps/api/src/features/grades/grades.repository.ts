import { eq, and, lte, isNotNull } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { grades, courses, enrollments } from '../../db/schema/index.js';

export const gradesRepository = {
  async findStudentGradesByTerm(
    studentId: string,
    academicYear = '2026-2027',
    semester = 1
  ) {
    const rows = await db
      .select({
        id: grades.id,
        courseId: courses.id,
        courseCode: courses.code,
        courseTitle: courses.title,
        units: courses.units,
        period: grades.period,
        grade: grades.grade,
        academicYear: grades.academicYear,
        semester: grades.semester,
      })
      .from(grades)
      .innerJoin(courses, eq(grades.courseId, courses.id))
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.academicYear, academicYear),
          eq(grades.semester, semester)
        )
      );

    return rows;
  },

  async findStudentEnrollments(
    studentId: string,
    academicYear = '2026-2027',
    semester = 1
  ) {
    const rows = await db
      .select({
        courseId: courses.id,
        courseCode: courses.code,
        courseTitle: courses.title,
        units: courses.units,
        academicYear: enrollments.academicYear,
        semester: enrollments.semester,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.academicYear, academicYear),
          eq(enrollments.semester, semester)
        )
      );

    return rows;
  },

  async findAllCompletedGrades(studentId: string) {
    const rows = await db
      .select({
        grade: grades.grade,
        units: courses.units,
        period: grades.period,
      })
      .from(grades)
      .innerJoin(courses, eq(grades.courseId, courses.id))
      .where(
        and(
          eq(grades.studentId, studentId),
          isNotNull(grades.grade)
        )
      );

    return rows;
  },
};
