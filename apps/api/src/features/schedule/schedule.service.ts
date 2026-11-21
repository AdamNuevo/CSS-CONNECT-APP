import { scheduleRepository } from './schedule.repository.js';
import type { EnrichedClassSchedule, NextClassCardData, DayOfWeek } from '@ccs-hub/shared';

const DAY_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getPhilippineDayAndMinutes(): { currentDay: DayOfWeek | null; currentMinutes: number } {
  // Philippine Standard Time is UTC+8
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const phtDate = new Date(utc + 3600000 * 8);

  const dayIndex = phtDate.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const currentMinutes = phtDate.getHours() * 60 + phtDate.getMinutes();

  if (dayIndex === 0) {
    return { currentDay: null, currentMinutes };
  }

  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return { currentDay: days[dayIndex - 1], currentMinutes };
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export const scheduleService = {
  async getWeeklySchedule(
    userId: string,
    role: string,
    academicYear = '2026-2027',
    semester = 1
  ): Promise<EnrichedClassSchedule[]> {
    if (role === 'faculty') {
      return scheduleRepository.findFacultySchedule(userId, academicYear, semester);
    }
    return scheduleRepository.findStudentSchedule(userId, academicYear, semester);
  },

  async getNextClass(userId: string, role: string): Promise<NextClassCardData | null> {
    const schedules = await this.getWeeklySchedule(userId, role);
    if (!schedules.length) {
      return null;
    }

    const { currentDay, currentMinutes } = getPhilippineDayAndMinutes();

    // 1. Look for remaining or ongoing classes today
    if (currentDay) {
      const todayClasses = schedules
        .filter((s) => s.day === currentDay)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      for (const item of todayClasses) {
        const startMin = timeToMinutes(item.startTime);
        const endMin = timeToMinutes(item.endTime);

        if (currentMinutes >= startMin && currentMinutes <= endMin) {
          // Class is currently in session!
          return {
            id: item.id,
            courseCode: item.courseCode,
            courseTitle: item.courseTitle,
            facultyName: item.facultyName,
            room: item.room,
            building: item.building ?? 'Main Building',
            floor: item.floor ?? 1,
            section: item.section,
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime,
            inSession: true,
            isToday: true,
          };
        }

        if (currentMinutes < startMin) {
          // Next upcoming class today
          return {
            id: item.id,
            courseCode: item.courseCode,
            courseTitle: item.courseTitle,
            facultyName: item.facultyName,
            room: item.room,
            building: item.building ?? 'Main Building',
            floor: item.floor ?? 1,
            section: item.section,
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime,
            inSession: false,
            isToday: true,
          };
        }
      }
    }

    // 2. If no more classes today (or Sunday), find next scheduled day
    const startIndex = currentDay ? DAY_ORDER.indexOf(currentDay) : -1;

    for (let i = 1; i <= 6; i++) {
      const nextDayIndex = (startIndex + i) % 6;
      const targetDay = DAY_ORDER[nextDayIndex];

      const dayClasses = schedules
        .filter((s) => s.day === targetDay)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      if (dayClasses.length > 0) {
        const firstNextClass = dayClasses[0];
        return {
          id: firstNextClass.id,
          courseCode: firstNextClass.courseCode,
          courseTitle: firstNextClass.courseTitle,
          facultyName: firstNextClass.facultyName,
          room: firstNextClass.room,
          building: firstNextClass.building ?? 'Main Building',
          floor: firstNextClass.floor ?? 1,
          section: firstNextClass.section,
          day: firstNextClass.day,
          startTime: firstNextClass.startTime,
          endTime: firstNextClass.endTime,
          inSession: false,
          isToday: false,
        };
      }
    }

    return null;
  },
};
