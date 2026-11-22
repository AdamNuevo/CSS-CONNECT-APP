import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluationsService } from './evaluations.service.js';
import { evaluationsRepository } from './evaluations.repository.js';
import { BadRequestError, ConflictError } from '../../errors/app-error.js';

describe('Evaluations Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockActivePeriod = {
    id: 'period-1',
    academicYear: '2026-2027',
    semester: 1,
    label: 'First Semester Faculty Evaluation',
    opensAt: new Date(Date.now() - 3600000),
    closesAt: new Date(Date.now() + 3600000 * 24),
    createdAt: new Date(),
  };

  it('returns inactive state when no period is currently open', async () => {
    vi.spyOn(evaluationsRepository, 'findActivePeriod').mockResolvedValueOnce(null as any);

    const status = await evaluationsService.getStudentEvaluationStatus('student-1');
    expect(status.isActive).toBe(false);
    expect(status.period).toBeNull();
    expect(status.items).toEqual([]);
  });

  it('returns active status and student course instructors', async () => {
    vi.spyOn(evaluationsRepository, 'findActivePeriod').mockResolvedValueOnce(mockActivePeriod);
    vi.spyOn(evaluationsRepository, 'findStudentCoursesWithFaculty').mockResolvedValueOnce([
      {
        courseId: 'c-1',
        courseCode: 'IT101',
        courseTitle: 'Introduction to Computing',
        facultyId: 'fac-1',
        facultyFirstName: 'Jose',
        facultyLastName: 'Reyes',
        section: 'IT-101',
      },
    ]);
    vi.spyOn(evaluationsRepository, 'findSubmissionsByStudent').mockResolvedValueOnce([]);

    const status = await evaluationsService.getStudentEvaluationStatus('student-1');
    expect(status.isActive).toBe(true);
    expect(status.items).toHaveLength(1);
    expect(status.items[0].isSubmitted).toBe(false);
    expect(status.completedCount).toBe(0);
  });

  it('rejects duplicate evaluation submission for the same course and instructor', async () => {
    vi.spyOn(evaluationsRepository, 'findActivePeriod').mockResolvedValueOnce(mockActivePeriod);
    vi.spyOn(evaluationsRepository, 'findSubmission').mockResolvedValueOnce({
      id: 'sub-1',
      periodId: mockActivePeriod.id,
      studentId: 'student-1',
      facultyId: 'fac-1',
      courseId: 'c-1',
      ratings: '{}',
      comments: 'Great teacher',
      submittedAt: new Date(),
      createdAt: new Date(),
    });

    await expect(
      evaluationsService.submitEvaluation('student-1', {
        periodId: mockActivePeriod.id,
        facultyId: 'fac-1',
        courseId: 'c-1',
        ratings: { mastery: 5, pedagogy: 5, management: 4, professionalism: 5 },
      })
    ).rejects.toThrow(ConflictError);
  });

  it('saves new valid evaluation submission', async () => {
    vi.spyOn(evaluationsRepository, 'findActivePeriod').mockResolvedValueOnce(mockActivePeriod);
    vi.spyOn(evaluationsRepository, 'findSubmission').mockResolvedValueOnce(null as any);
    vi.spyOn(evaluationsRepository, 'createSubmission').mockResolvedValueOnce({
      id: 'sub-2',
      periodId: mockActivePeriod.id,
      studentId: 'student-1',
      facultyId: 'fac-1',
      courseId: 'c-1',
      ratings: JSON.stringify({ mastery: 5 }),
      comments: 'Excellent',
      submittedAt: new Date(),
      createdAt: new Date(),
    });

    const result = await evaluationsService.submitEvaluation('student-1', {
      periodId: mockActivePeriod.id,
      facultyId: 'fac-1',
      courseId: 'c-1',
      ratings: { mastery: 5 },
      comments: 'Excellent',
    });

    expect(result.id).toBe('sub-2');
  });
});
