import { eq, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import {
  classSchedules,
  courses,
  enrollments,
  users,
  campusRooms,
} from '../../db/schema/index.js';
import type { EnrichedClassSchedule } from '@ccs-hub/shared';

export const scheduleRepository = {
  async findStudentSchedule(
    studentId: string,
    academicYear = '2026-2027',
    semester = 1
  ): Promise<EnrichedClassSchedule[]> {
    const rows = await db
      .select({
        id: classSchedules.id,
        courseId: courses.id,
        courseCode: courses.code,
        courseTitle: courses.title,
        units: courses.units,
        facultyId: users.id,
        facultyFirstName: users.firstName,
        facultyLastName: users.lastName,
        section: classSchedules.section,
        day: classSchedules.day,
        startTime: classSchedules.startTime,
        endTime: classSchedules.endTime,
        room: classSchedules.room,
        building: campusRooms.building,
        floor: campusRooms.floor,
        academicYear: classSchedules.academicYear,
        semester: classSchedules.semester,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(classSchedules, eq(courses.id, classSchedules.courseId))
      .innerJoin(users, eq(classSchedules.facultyId, users.id))
      .leftJoin(campusRooms, eq(classSchedules.room, campusRooms.code))
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.academicYear, academicYear),
          eq(enrollments.semester, semester)
        )
      );

    return rows.map((r) => ({
      id: r.id,
      courseId: r.courseId,
      courseCode: r.courseCode,
      courseTitle: r.courseTitle,
      units: r.units,
      facultyId: r.facultyId,
      facultyName: `Prof. ${r.facultyFirstName} ${r.facultyLastName}`.trim(),
      section: r.section,
      day: r.day as any,
      startTime: r.startTime.slice(0, 5),
      endTime: r.endTime.slice(0, 5),
      room: r.room ?? 'TBA',
      building: r.building ?? 'Main Building',
      floor: r.floor ?? 1,
      academicYear: r.academicYear,
      semester: r.semester,
    }));
  },

  async findFacultySchedule(
    facultyId: string,
    academicYear = '2026-2027',
    semester = 1
  ): Promise<EnrichedClassSchedule[]> {
    const rows = await db
      .select({
        id: classSchedules.id,
        courseId: courses.id,
        courseCode: courses.code,
        courseTitle: courses.title,
        units: courses.units,
        facultyId: users.id,
        facultyFirstName: users.firstName,
        facultyLastName: users.lastName,
        section: classSchedules.section,
        day: classSchedules.day,
        startTime: classSchedules.startTime,
        endTime: classSchedules.endTime,
        room: classSchedules.room,
        building: campusRooms.building,
        floor: campusRooms.floor,
        academicYear: classSchedules.academicYear,
        semester: classSchedules.semester,
      })
      .from(classSchedules)
      .innerJoin(courses, eq(classSchedules.courseId, courses.id))
      .innerJoin(users, eq(classSchedules.facultyId, users.id))
      .leftJoin(campusRooms, eq(classSchedules.room, campusRooms.code))
      .where(
        and(
          eq(classSchedules.facultyId, facultyId),
          eq(classSchedules.academicYear, academicYear),
          eq(classSchedules.semester, semester)
        )
      );

    return rows.map((r) => ({
      id: r.id,
      courseId: r.courseId,
      courseCode: r.courseCode,
      courseTitle: r.courseTitle,
      units: r.units,
      facultyId: r.facultyId,
      facultyName: `Prof. ${r.facultyFirstName} ${r.facultyLastName}`.trim(),
      section: r.section,
      day: r.day as any,
      startTime: r.startTime.slice(0, 5),
      endTime: r.endTime.slice(0, 5),
      room: r.room ?? 'TBA',
      building: r.building ?? 'Main Building',
      floor: r.floor ?? 1,
      academicYear: r.academicYear,
      semester: r.semester,
    }));
  },
};
