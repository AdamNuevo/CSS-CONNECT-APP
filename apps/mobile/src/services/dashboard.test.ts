import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('expo-secure-store', () => ({
  setItemAsync: vi.fn(),
  getItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

vi.mock('./storage', () => ({
  storage: {
    getTokens: vi.fn().mockResolvedValue({ accessToken: 'test-token', refreshToken: 'test-refresh' }),
    saveTokens: vi.fn(),
    clearTokens: vi.fn(),
    clearUserProfile: vi.fn(),
  },
}));

import { mobileApi } from './dashboard';
import { api } from './api';

describe('Mobile Dashboard Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches dashboard data', async () => {
    const mockDashboard = {
      user: {
        id: 'user-1',
        email: 'angelo.cruz@students.qcu.edu.ph',
        firstName: 'Angelo',
        lastName: 'Cruz',
        role: 'student',
      },
      nextClass: null,
      latestAnnouncements: [],
      upcomingEvent: null,
      stats: {
        pendingEvaluations: 0,
        termGwa: '1.50',
        enrolledUnits: 6,
      },
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { data: mockDashboard } });

    const result = await mobileApi.getDashboard();
    expect(result.user?.firstName).toBe('Angelo');
    expect(result.stats.termGwa).toBe('1.50');
  });

  it('fetches weekly schedule', async () => {
    const mockSchedule = [
      {
        id: 's-1',
        courseId: 'c-1',
        courseCode: 'IT101',
        courseTitle: 'Introduction to Computing',
        units: 3,
        facultyId: 'fac-1',
        facultyName: 'Prof. Jose Reyes',
        section: 'IT-101',
        day: 'monday' as const,
        startTime: '07:30',
        endTime: '09:00',
        room: 'CCS-101',
        academicYear: '2026-2027',
        semester: 1,
      },
    ];

    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { data: mockSchedule } });

    const result = await mobileApi.getWeeklySchedule();
    expect(result).toHaveLength(1);
    expect(result[0].courseCode).toBe('IT101');
  });

  it('submits faculty evaluation', async () => {
    const mockSubmission = { id: 'eval-sub-1' };
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { data: mockSubmission } });

    const result = await mobileApi.submitEvaluation({
      periodId: 'period-1',
      facultyId: 'fac-1',
      courseId: 'c-1',
      ratings: { mastery: 5, pedagogy: 5 },
      comments: 'Great teacher',
    });

    expect(result.id).toBe('eval-sub-1');
  });
});
