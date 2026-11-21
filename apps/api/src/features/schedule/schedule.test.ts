import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scheduleService } from './schedule.service.js';
import { scheduleRepository } from './schedule.repository.js';
import type { EnrichedClassSchedule } from '@ccs-hub/shared';

describe('Schedule Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockSchedules: EnrichedClassSchedule[] = [
    {
      id: 'sched-1',
      courseId: 'c-1',
      courseCode: 'IT101',
      courseTitle: 'Introduction to Computing',
      units: 3,
      facultyId: 'fac-1',
      facultyName: 'Prof. Jose Reyes',
      section: 'IT-101',
      day: 'monday',
      startTime: '07:30',
      endTime: '09:00',
      room: 'CCS-101',
      building: 'Main Building',
      floor: 1,
      academicYear: '2026-2027',
      semester: 1,
    },
    {
      id: 'sched-2',
      courseId: 'c-2',
      courseCode: 'GE001',
      courseTitle: 'Understanding the Self',
      units: 3,
      facultyId: 'fac-2',
      facultyName: 'Prof. Ana Dela Cruz',
      section: 'IT-101',
      day: 'wednesday',
      startTime: '10:30',
      endTime: '12:00',
      room: 'CCS-102',
      building: 'Main Building',
      floor: 1,
      academicYear: '2026-2027',
      semester: 1,
    },
  ];

  it('retrieves student weekly schedule', async () => {
    vi.spyOn(scheduleRepository, 'findStudentSchedule').mockResolvedValueOnce(mockSchedules);

    const result = await scheduleService.getWeeklySchedule('student-1', 'student');
    expect(result).toHaveLength(2);
    expect(result[0].courseCode).toBe('IT101');
    expect(result[1].courseCode).toBe('GE001');
  });

  it('retrieves faculty weekly schedule', async () => {
    vi.spyOn(scheduleRepository, 'findFacultySchedule').mockResolvedValueOnce([mockSchedules[0]]);

    const result = await scheduleService.getWeeklySchedule('fac-1', 'faculty');
    expect(result).toHaveLength(1);
    expect(result[0].facultyName).toBe('Prof. Jose Reyes');
  });

  it('computes next class card correctly', async () => {
    vi.spyOn(scheduleRepository, 'findStudentSchedule').mockResolvedValueOnce(mockSchedules);

    const nextClass = await scheduleService.getNextClass('student-1', 'student');
    expect(nextClass).not.toBeNull();
    expect(nextClass).toHaveProperty('courseCode');
    expect(nextClass).toHaveProperty('room');
    expect(nextClass).toHaveProperty('inSession');
  });
});
