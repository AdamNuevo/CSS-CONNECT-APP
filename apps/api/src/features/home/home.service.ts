import { eq, and, gt, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { events } from '../../db/schema/index.js';
import { scheduleService } from '../schedule/schedule.service.js';
import { announcementsService } from '../announcements/announcements.service.js';
import { gradesService } from '../grades/grades.service.js';
import { evaluationsService } from '../evaluations/evaluations.service.js';
import { usersRepository } from '../users/users.repository.js';

export const homeService = {
  async getDashboard(user: { id: string; role: string }) {
    const [profile, nextClass, announcementsData, eventList] = await Promise.all([
      usersRepository.findUserById(user.id),
      scheduleService.getNextClass(user.id, user.role),
      announcementsService.getAnnouncements({ limit: 3 }),
      db
        .select({
          id: events.id,
          title: events.title,
          category: events.category,
          location: events.location,
          startsAt: events.startsAt,
          endsAt: events.endsAt,
          maxSlots: events.maxSlots,
        })
        .from(events)
        .where(and(eq(events.isPublished, true), gt(events.startsAt, new Date())))
        .orderBy(events.startsAt)
        .limit(1),
    ]);

    let pendingEvaluations = 0;
    let termGwa: string | null = null;
    let enrolledUnits = 0;

    if (user.role === 'student') {
      try {
        const evalStatus = await evaluationsService.getStudentEvaluationStatus(user.id);
        pendingEvaluations = evalStatus.totalCount - evalStatus.completedCount;
      } catch {
        // Safe fallback if evaluations are closed or query fails
      }

      try {
        const gradesData = await gradesService.getStudentGrades(user.id);
        termGwa = gradesData.termGwa;
        enrolledUnits = gradesData.totalEnrolledUnits;
      } catch {
        // Safe fallback
      }
    }

    const upcomingEvent = eventList[0]
      ? {
          id: eventList[0].id,
          title: eventList[0].title,
          category: eventList[0].category,
          location: eventList[0].location,
          startsAt: eventList[0].startsAt.toISOString(),
          endsAt: eventList[0].endsAt.toISOString(),
          maxSlots: eventList[0].maxSlots,
        }
      : null;

    return {
      user: profile
        ? {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: profile.role,
            studentNumber: profile.studentNumber,
            employeeNumber: profile.employeeNumber,
            program: profile.program,
            yearLevel: profile.yearLevel,
            section: profile.section,
          }
        : null,
      nextClass,
      latestAnnouncements: announcementsData.items,
      upcomingEvent,
      stats: {
        pendingEvaluations,
        termGwa,
        enrolledUnits,
      },
    };
  },
};
