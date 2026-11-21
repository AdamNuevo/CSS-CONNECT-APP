import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gradesService } from './grades.service.js';
import { gradesRepository } from './grades.repository.js';

describe('Grades Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('computes term GWA, cumulative GWA, and curriculum progress accurately', async () => {
    vi.spyOn(gradesRepository, 'findStudentEnrollments').mockResolvedValueOnce([
      {
        courseId: 'c-1',
        courseCode: 'IT101',
        courseTitle: 'Introduction to Computing',
        units: 3,
        academicYear: '2026-2027',
        semester: 1,
      },
      {
        courseId: 'c-2',
        courseCode: 'IT102',
        courseTitle: 'Computer Programming 1',
        units: 3,
        academicYear: '2026-2027',
        semester: 1,
      },
    ]);

    vi.spyOn(gradesRepository, 'findStudentGradesByTerm').mockResolvedValueOnce([
      {
        id: 'g-1',
        courseId: 'c-1',
        courseCode: 'IT101',
        courseTitle: 'Introduction to Computing',
        units: 3,
        period: 'Finals',
        grade: '1.25',
        academicYear: '2026-2027',
        semester: 1,
      },
      {
        id: 'g-2',
        courseId: 'c-2',
        courseCode: 'IT102',
        courseTitle: 'Computer Programming 1',
        units: 3,
        period: 'Finals',
        grade: '1.75',
        academicYear: '2026-2027',
        semester: 1,
      },
    ]);

    vi.spyOn(gradesRepository, 'findAllCompletedGrades').mockResolvedValueOnce([
      { grade: '1.25', units: 3, period: 'Finals' },
      { grade: '1.75', units: 3, period: 'Finals' },
    ]);

    const result = await gradesService.getStudentGrades('student-1', '2026-2027', 1);

    // GWA = (1.25 * 3 + 1.75 * 3) / 6 = (3.75 + 5.25) / 6 = 9.00 / 6 = 1.50
    expect(result.termGwa).toBe('1.50');
    expect(result.cumulativeGwa).toBe('1.50');
    expect(result.completedUnits).toBe(6);
    expect(result.totalEnrolledUnits).toBe(6);
    // 6 / 146 = 4.1% -> 4%
    expect(result.curriculumProgressPercent).toBe(4);
    expect(result.courses).toHaveLength(2);
    expect(result.courses[0].status).toBe('passed');
  });

  it('handles in-progress courses without released grades', async () => {
    vi.spyOn(gradesRepository, 'findStudentEnrollments').mockResolvedValueOnce([
      {
        courseId: 'c-1',
        courseCode: 'IT101',
        courseTitle: 'Introduction to Computing',
        units: 3,
        academicYear: '2026-2027',
        semester: 1,
      },
    ]);

    vi.spyOn(gradesRepository, 'findStudentGradesByTerm').mockResolvedValueOnce([]);
    vi.spyOn(gradesRepository, 'findAllCompletedGrades').mockResolvedValueOnce([]);

    const result = await gradesService.getStudentGrades('student-1', '2026-2027', 1);

    expect(result.termGwa).toBeNull();
    expect(result.courses[0].status).toBe('in_progress');
    expect(result.completedUnits).toBe(0);
  });
});
