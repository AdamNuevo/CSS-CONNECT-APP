import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import {
  evaluationPeriods,
  evaluationSubmissions,
  enrollments,
  courses,
  classSchedules,
  users,
} from '../../db/schema/index.js';

export const evaluationsRepository = {
  async findActivePeriod() {
    const now = new Date();
    const [period] = await db
      .select()
      .from(evaluationPeriods)
      .where(
        sql`${now} >= ${evaluationPeriods.opensAt} AND ${now} <= ${evaluationPeriods.closesAt}`
      )
      .limit(1);

    return period ?? null;
  },

  async findStudentCoursesWithFaculty(
    studentId: string,
    academicYear: string,
    semester: number
  ) {
    const rows = await db
      .select({
        courseId: courses.id,
        courseCode: courses.code,
        courseTitle: courses.title,
        facultyId: users.id,
        facultyFirstName: users.firstName,
        facultyLastName: users.lastName,
        section: classSchedules.section,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(classSchedules, eq(courses.id, classSchedules.courseId))
      .innerJoin(users, eq(classSchedules.facultyId, users.id))
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.academicYear, academicYear),
          eq(enrollments.semester, semester)
        )
      );

    // Deduplicate by courseId + facultyId
    const uniqueMap = new Map<string, typeof rows[0]>();
    for (const r of rows) {
      const key = `${r.courseId}:${r.facultyId}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, r);
      }
    }

    return Array.from(uniqueMap.values());
  },

  async findSubmissionsByStudent(studentId: string, periodId: string) {
    return db
      .select()
      .from(evaluationSubmissions)
      .where(
        and(
          eq(evaluationSubmissions.studentId, studentId),
          eq(evaluationSubmissions.periodId, periodId)
        )
      );
  },

  async findSubmission(
    periodId: string,
    studentId: string,
    facultyId: string,
    courseId: string
  ) {
    const [row] = await db
      .select()
      .from(evaluationSubmissions)
      .where(
        and(
          eq(evaluationSubmissions.periodId, periodId),
          eq(evaluationSubmissions.studentId, studentId),
          eq(evaluationSubmissions.facultyId, facultyId),
          eq(evaluationSubmissions.courseId, courseId)
        )
      )
      .limit(1);

    return row ?? null;
  },

  async createSubmission(data: {
    periodId: string;
    studentId: string;
    facultyId: string;
    courseId: string;
    ratings: string; // JSON
    comments?: string | null;
  }) {
    const [row] = await db
      .insert(evaluationSubmissions)
      .values({
        periodId: data.periodId,
        studentId: data.studentId,
        facultyId: data.facultyId,
        courseId: data.courseId,
        ratings: data.ratings,
        comments: data.comments ?? null,
        submittedAt: new Date(),
      })
      .returning();

    return row;
  },
};
